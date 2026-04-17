type ExtractLatexRequest = {
  imageData?: string;
  mimeType?: string;
  textContent: string;
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        reject(new Error('Failed to read the selected file.'));
        return;
      }

      const [, base64Data] = result.split(',');

      if (!base64Data) {
        reject(new Error('Failed to encode the selected image.'));
        return;
      }

      resolve(base64Data);
    };

    reader.onerror = () => reject(new Error('Failed to read the selected file.'));
    reader.readAsDataURL(file);
  });
}

export async function extractLatex(file: File | null, textContent: string): Promise<string> {
  const payload: ExtractLatexRequest = {
    textContent,
  };

  if (file) {
    payload.imageData = await fileToBase64(file);
    payload.mimeType = file.type;
  }

  const response = await fetch('/api/extract-latex', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof responseBody.error === 'string'
        ? responseBody.error
        : 'Failed to extract LaTeX.',
    );
  }

  if (typeof responseBody.latex !== 'string') {
    throw new Error('The server returned an invalid response.');
  }

  return responseBody.latex;
}
