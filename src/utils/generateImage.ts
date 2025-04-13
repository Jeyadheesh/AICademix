import { HfInference } from "@huggingface/inference";
import { GoogleGenAI, PersonGeneration } from "@google/genai";

const client = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);
const ai = new GoogleGenAI({
  apiKey: "AIzaSyBPeIdXELoTVH9cgpWLmYZ2u8bHJfHoJ5w",
});

type props = {
  topic: string;
  context: string;
  panelDescription: string;
  previousPanelDescription?: string; // Optional for continuity
};

export async function generateImage({
  context,
  panelDescription,
  topic,
  previousPanelDescription,
}: props) {
  const prompt = `Generate a colorful, fun, and age-appropriate comic book style image based on the following description:

**Story Topic**: ${topic}
**Overall Story Context**: ${context}
**Panel Description**: ${panelDescription}

You're a comic generator who will create images for the script provided.Provide only the image without any text or labels in it.
The image should be bright, colorful, and suitable for children under Grade 5. Again Don't provide any text in the images ,generate only
images to the scripts. The characters in the generated images should be cartoonish and expressive, with simple emotions. The setting should be safe, imaginative, and whimsical (e.g., classrooms, parks, 
fantasy lands, or cozy homes).

Important :
- Safe, imaginative, and whimsical settings (e.g., classrooms, parks, fantasy lands, or cozy homes).
- Maintain character consistency across panels (e.g., same outfit, hair, colors, and style).
- Don't include any text, labels, or speech bubbles in the generated image.
`;

  let attempts = 0;
  const maxRetries = 5;
  const delay = 2000; // 2 seconds delay between retries
  while (attempts < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: prompt,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });

      const part = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;

      if (part?.data && part?.mimeType) {
        const dataURL = `data:${part.mimeType};base64,${part.data}`;
        return dataURL;
      }

      console.warn(`Attempt ${attempts + 1} failed: No image data found.`);
    } catch (err) {
      console.error(`Error on attempt ${attempts + 1}:`, err.message || err);
    }

    attempts++;
    if (attempts < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delay)); // wait before retry
    }
  }
}
