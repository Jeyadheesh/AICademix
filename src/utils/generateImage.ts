import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_DALLE_API_KEY,
  dangerouslyAllowBrowser: true,
});

const client = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

type props = {
  topic: string;
  context: string;
  panelDescription: string;
  llmModel: llmModel;
  previousPanelDescription?: string; // Optional for continuity
};

export async function generateImage({
  context,
  panelDescription,
  topic,
  previousPanelDescription,
  llmModel,
}: props) {
  const prompt = `Generate a detailed, visually engaging comic book style image based on the following description:

**Story Topic**: ${topic}
**Overall Story Context**: ${context}
**Panel Description**: ${panelDescription}
${
  previousPanelDescription
    ? `**Previous Panel Description**: ${previousPanelDescription}`
    : ""
}

Focus on:
- Key visual elements: characters, setting, emotions, and actions.
- Maintaining character continuity (if applicable).
- Enhancing storytelling through dramatic effects and emotions.
`;

  try {
    // const image = await client.textToImage({
    //   model: "stabilityai/stable-diffusion-3.5-large",
    //   inputs: prompt,
    //   parameters: { num_inference_steps: 20 },
    // });

    if (llmModel === "hugging-face") {
      const image = await client.textToImage({
        model: "stabilityai/stable-diffusion-3.5-large",
        inputs: prompt,
        parameters: { num_inference_steps: 20 },
      });
      return image;
    } else if (llmModel === "dalle") {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      console.log(response.data[0].url);
      return response.data[0].url;
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}
