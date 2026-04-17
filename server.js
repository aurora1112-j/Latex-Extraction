import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

import dotenv from 'dotenv';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 3000);

function buildPrompt(textContent, hasImage) {
  let promptText = 'You are an expert mathematician and LaTeX transcriber. ';

  if (hasImage) {
    promptText += 'Examine the provided image containing mathematical formulas. ';
  }

  if (textContent.trim()) {
    promptText += `\nAdditional user input/instructions: "${textContent}". `;
  }

  promptText += `\nExtract the formula and convert it into pure LaTeX code.
IMPORTANT:
- Return ONLY the LaTeX code.
- DO NOT wrap the output in markdown code blocks (\`\`\`latex ... \`\`\`).
- If there are multiple equations, format them appropriately with standard environments like aligned.
- Do NOT include $$ or $ wrappers in the final response unless absolutely necessary; I will handle the math environments.`;

  return promptText;
}

async function generateLatex({ imageData, mimeType, textContent }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing on the server.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const parts = [];

  if (imageData && mimeType) {
    parts.push({
      inlineData: {
        mimeType,
        data: imageData,
      },
    });
  }

  parts.push({
    text: buildPrompt(textContent, Boolean(imageData)),
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: { parts },
  });

  return response.text?.trim() || '';
}

async function createApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  app.post('/api/extract-latex', async (req, res) => {
    const { imageData, mimeType, textContent = '' } = req.body ?? {};
    const hasText = typeof textContent === 'string' && textContent.trim().length > 0;
    const hasImage = typeof imageData === 'string' && imageData.length > 0;

    if (!hasImage && !hasText) {
      res.status(400).json({ error: 'Please provide an image or text input.' });
      return;
    }

    if (hasImage && typeof mimeType !== 'string') {
      res.status(400).json({ error: 'The uploaded image is missing its MIME type.' });
      return;
    }

    try {
      const latex = await generateLatex({
        imageData: hasImage ? imageData : undefined,
        mimeType: hasImage ? mimeType : undefined,
        textContent: typeof textContent === 'string' ? textContent : '',
      });

      res.json({ latex });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to extract LaTeX.';

      res.status(500).json({ error: message });
    }
  });

  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const templatePath = path.join(__dirname, 'index.html');
        const template = await readFile(templatePath, 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error);
        next(error);
      }
    });
  }

  app.listen(port, () => {
    console.log(`Lxtract server listening on http://localhost:${port}`);
  });
}

createApp().catch((error) => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});
