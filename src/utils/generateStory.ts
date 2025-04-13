import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
console.log(
  "NEXT_PUBLIC_GEMINI_API_KEY",
  process.env.NEXT_PUBLIC_GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

type Props = {
  maxNbPanels?: number;
  topic: string;
  context: string;
  previousPanel?: { panel: number; instructions: string; caption: string }[];
};

export async function generateStory({
  topic,
  context,
  maxNbPanels = 4,
  previousPanel,
}: Props) {
  try {
    const nbPanelsToGenerate = 2;
    const existingPanels = previousPanel || [];

    const existingPanelsTemplate = existingPanels.length
      ? ` To help you, here are the previous panels and their captions (note: if you see an anomaly here eg. no caption or the same description repeated multiple times, do not hesitate to fix the story): ${JSON.stringify(
          existingPanels,
          null,
          2
        )} and topic is ${topic}.`
      : "";
    // If the context is empty, return an error
    if (!context || context.trim() === "") {
      return {
        message:
          "Sorry, try again. No information about this topic in the uploaded documents.",
      };
    }

    const firstNextOrLast =
      existingPanels.length === 0
        ? "first"
        : maxNbPanels - existingPanels.length === maxNbPanels
        ? "last"
        : "next";

    const query = `
          You are a writer specialized in Science and Education. Create a 4-panel comic story about the topic: ${topic}. Use the context below to ensure technical accuracy.  

Context: ${context}  

Instructions:  
1. Write a story that integrates technical terms (e.g., "photosynthesis," "algorithm") naturally into dialogue or narration.  
2. Set the story in real-world scenarios (e.g., science labs, coding competitions, engineering projects).  
3. Use a professional and engaging tone, avoiding overly simplistic or childish language.  

For the ${firstNextOrLast} ${nbPanelsToGenerate} panels (out of 4 total):  
- Provide detailed drawing instructions (character gender, age, clothing, location, visual cues for technical concepts).  
- Write captions (less than 500 characters) that include 1-2 technical terms from the context.  
- Ensure continuity with the broader story (${maxNbPanels} panels total). 
          output format must be : 
            (Json)
            [
              {
            "panel": ${existingPanels.length + 1},
            "instructions": string,
            "caption": string
            },
            {
            "panel": ${existingPanels.length + 2},
            "instructions": string,
            "caption": string
            }
      },
      {
        role: "user",
        content: The story is about: ${prompt}.${existingPanelsTemplate}
      }`;

    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();
    const cleanText = text
      .trim()
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    const jsonData = JSON.parse(cleanText);

    return jsonData;
  } catch (error) {
    console.error("Error generating assessment:", error);
    return {
      message: "Error generating assessment",
      error: error.message || "Unknown error",
    };
  }
}

export async function generateLyrics({ topic, context }: Props) {
  try {
    if (!context || context.trim() === "") {
      return {
        message:
          "Sorry, try again. No information about this topic in the uploaded documents.",
      };
    }

    const query = `
      You are a creative and educational song lyrics generator. Your task 

      Step - 1 : Generate a detailed answer from the provided topic and context.
      Step - 2 : Create a  engaging and memorable song lyrics based on created detailed answer and the lyrics should correlate with the concepts technically.

      Generate a song that:
      - Include any choreography or verse labels (e.g., "Verse 1" or "Chorus") If needed. 
      - Focus on creating a flowing, rhythmic, and educational song that helps students learn the topic effectively.
      - Is entirely based on the detailed answer.
      - Uses simple, rhyming language to make it easy to remember.
      - Avoids adding any extra information not present in the context.
      - Is engaging and enjoyable for students to sing or listen to.
      - Output only the song lyrics, nothing else.

      context : ${context}
      topic : ${topic}

      Format the response as a JSON object like this:
      {
        "title": "Song Title",
        "lyrics": "Your song lyrics here in paragraph format."
      }
    `;

    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();
    const cleanText = text
      .trim()
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    const jsonData = JSON.parse(cleanText);

    return jsonData;
  } catch (error) {
    console.error("Error generating lyrics:", error);
    return {
      message: "Error generating lyrics",
      error: error.message || "Unknown error",
    };
  }
}
