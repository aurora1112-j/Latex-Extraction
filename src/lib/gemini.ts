import { GoogleGenAI } from "@google/genai";

export async function extractLatex(file: File | null, textContent: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is missing.");
  const ai = new GoogleGenAI({ apiKey });

  return new Promise((resolve, reject) => {
    const doGenerate = async (base64Data?: string, mimeType?: string) => {
      try {
        const parts: any[] = [];
        if (base64Data && mimeType) {
          parts.push({
            inlineData: { mimeType, data: base64Data },
          });
        }
        
        let promptText = `You are an expert mathematician and LaTeX transcriber. `;
        if (base64Data) promptText += `Examine the provided image containing mathematical formulas. `;
        if (textContent.trim()) promptText += `\nAdditional user input/instructions: "${textContent}". `;
        promptText += `\nExtract the formula and convert it into pure LaTeX code. 
IMPORTANT: 
- Return ONLY the LaTeX code. 
- DO NOT wrap the output in markdown code blocks (\`\`\`latex ... \`\`\`).
- If there are multiple equations, format them appropriately with standard environments like aligned.
- Do NOT include \$\$ or \$ wrappers in the final response unless absolutely necessary; I will handle the math environments.`;

        parts.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: { parts },
        });

        resolve(response.text?.trim() || "");
      } catch (err) {
        reject(err);
      }
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(",")[1];
        doGenerate(base64Data, file.type);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    } else {
      if (!textContent.trim()) {
        reject(new Error("Please provide either an image or text input."));
        return;
      }
      doGenerate();
    }
  });
}
