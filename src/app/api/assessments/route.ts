import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/utils/db";
import Assessment from "@/model/assessment.model";

export async function GET() {
  try {
    await connectDB();
    const assessments = await Assessment.find().sort({ createdAt: -1 }); // Fetch all assessments, sorted by creation date
    return NextResponse.json({ assessments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments." },
      { status: 500 }
    );
  }
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request: Request) {
  try {
    const { topic, mcqCount, fillInBlanksCount, shortAnswerCount, context } =
      await request.json();

    // If the context is empty, return an error
    if (!context || context.trim() === "") {
      return NextResponse.json(
        {
          message:
            "Sorry, try again. No information about this topic in the uploaded documents.",
        },
        { status: 404 }
      );
    }

    const prompt = `
        You are an expert question paper generator. Your task is to generate a question paper based ONLY on the  ${context}
        provided. Follow these steps:

        1. Retrieve Relevant Information: Analyze the provided context and extract information relevant to the specified topic.
        2. Generate Questions: Use the extracted information to create the requested number of questions. Ensure the questions are clear, accurate, and directly based on the context.
        3. Output Format: Provide the output in JSON format with the following structure
        {
            "mcq": [
            {
                "question": "Question text",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "answer": "Correct option"
            }
            ],
            "fillInBlanks": [
            {
                "question": "Question text with _____",
                "answer": "Correct answer"
            }
            ],
            "shortAnswer": [
            {
                "question": "Question text",
                "answer": "Correct answer"
            }
            ]
        }

        Topic: ${topic}
        Number of MCQs: ${mcqCount}
        Number of Fill in the Blanks: ${fillInBlanksCount}
        Number of Short Answers: ${shortAnswerCount}

        Context: ${context}
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from Markdown response (if wrapped in ```json)
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;

    // Parse the JSON string
    const assessment = JSON.parse(jsonString);

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error generating assessment:", error);
    return NextResponse.json(
      {
        message: "Error generating assessment",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
