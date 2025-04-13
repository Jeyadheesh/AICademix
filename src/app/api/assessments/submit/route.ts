import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Assessment from "@/model/assessment.model";
import Score from "@/model/score.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Helper function to extract JSON from Gemini's response
// which sometimes includes markdown formatting
const extractJsonFromResponse = (text: string) => {
  try {
    // Direct parse attempt first
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (err) {
        // If that fails too, manually extract the content
        console.log("Failed to parse extracted JSON, falling back to defaults");
      }
    }
    // Return a default object if all parsing attempts fail
    return {
      feedback: "Thank you for completing the assessment!",
      flashcard: {
        front: "Review the concepts you missed",
        back: "Check your incorrect answers and study those topics",
        topic: "Assessment Review",
      },
    };
  }
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { assessmentId, answers, studentId } = await req.json();

    // Validate studentId
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 }
      );
    }

    // Get the assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Process each question type separately
    const questionScores = [];
    let totalScore = 0;
    let totalQuestions = 0;

    // Process MCQ questions - simple direct comparison
    for (const [index, answer] of Object.entries(answers.mcq || {})) {
      const questionIndex = parseInt(index);
      const question = assessment.mcq[questionIndex];

      if (!question) continue;

      const isCorrect = question.answer === answer;
      const score = isCorrect ? 1 : 0;
      totalScore += score;
      totalQuestions++;

      questionScores.push({
        questionId: `mcq_${questionIndex}`,
        questionType: "mcq",
        userAnswer: answer,
        correctAnswer: question.answer,
        score,
        feedback: isCorrect
          ? "Correct answer!"
          : `Incorrect. The correct answer is: ${question.answer}`,
      });
    }

    // Process fill-in-the-blanks questions - simple string comparison
    for (const [index, answer] of Object.entries(answers.fillInBlanks || {})) {
      const questionIndex = parseInt(index);
      const question = assessment.fillInBlanks[questionIndex];

      if (!question) continue;

      // Simple comparison - exact or close match
      const isExactMatch =
        question.answer.toLowerCase() === String(answer).toLowerCase();
      const isPartialMatch =
        answer &&
        question.answer.toLowerCase().includes(String(answer).toLowerCase());

      let score = 0;
      let feedback = "";

      if (isExactMatch) {
        score = 1;
        feedback = "Correct answer!";
      } else if (isPartialMatch) {
        score = 0.5;
        feedback = "Partially correct. The full answer is: " + question.answer;
      } else {
        score = 0;
        feedback = "Incorrect. The correct answer is: " + question.answer;
      }

      totalScore += score;
      totalQuestions++;

      questionScores.push({
        questionId: `fillInBlanks_${questionIndex}`,
        questionType: "fillInBlanks",
        userAnswer: String(answer),
        correctAnswer: question.answer,
        score,
        feedback,
      });
    }

    // Process short answer questions - simple keyword matching
    for (const [index, answer] of Object.entries(answers.shortAnswer || {})) {
      const questionIndex = parseInt(index);
      const question = assessment.shortAnswer[questionIndex];

      if (!question) continue;

      // Simple keyword matching
      const studentAnswer = String(answer).toLowerCase();
      const correctAnswerKeywords = question.answer.toLowerCase().split(/\s+/);

      // Count how many keywords from correct answer appear in student answer
      const matchedKeywords = correctAnswerKeywords.filter(
        (keyword) => studentAnswer.includes(keyword) && keyword.length > 3
      );

      const keywordRatio =
        matchedKeywords.length / (correctAnswerKeywords.length || 1); // Avoid division by zero

      let score = 0;
      let feedback = "";

      if (keywordRatio >= 0.8) {
        score = 1;
        feedback = "Excellent answer!";
      } else if (keywordRatio >= 0.5) {
        score = 0.7;
        feedback = "Good answer, but missing some key points.";
      } else if (keywordRatio >= 0.3) {
        score = 0.4;
        feedback = "Partially correct, but needs improvement.";
      } else {
        score = 0.1;
        feedback = "Incorrect. Review the material and try again.";
      }

      totalScore += score;
      totalQuestions++;

      questionScores.push({
        questionId: `shortAnswer_${questionIndex}`,
        questionType: "shortAnswer",
        userAnswer: String(answer),
        correctAnswer: question.answer,
        score,
        feedback,
      });
    }

    // Calculate final normalized score as a percentage
    const finalScore =
      totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    // Collect incorrect answers for evaluation
    const incorrectAnswers = questionScores
      .filter((q) => q.score < 0.8)
      .map((q) => ({
        question:
          q.questionType === "mcq"
            ? assessment.mcq[parseInt(q.questionId.split("_")[1])]?.question ||
              ""
            : q.questionType === "fillInBlanks"
            ? assessment.fillInBlanks[parseInt(q.questionId.split("_")[1])]
                ?.question || ""
            : assessment.shortAnswer[parseInt(q.questionId.split("_")[1])]
                ?.question || "",
        userAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
      }));

    // Default feedback and flashcards if user got everything right
    let overallFeedback = "Great job! You answered all questions correctly.";
    let flashcards = [
      {
        front: "What topics should I review from this assessment?",
        back: "Focus on reviewing the questions you missed, especially those related to key concepts and definitions.",
        topic: "Study Strategy",
      },
    ];

    // Only call Gemini if there are incorrect answers
    if (incorrectAnswers.length > 0) {
      try {
        // Single call to Gemini for evaluation
        const prompt = `
        The student has completed an assessment with a score of ${finalScore}%.
        
        Here are the questions they got wrong or partially wrong:
        ${JSON.stringify(incorrectAnswers.slice(0, 3))}
        
        Based on these incorrect answers, please create ONE excellent study flashcard that:
        - Targets the most important concept they need to understand
        - Has a clear, concise question on the front
        - Provides a comprehensive but concise answer on the back
        - Includes a relevant topic label
        
        Respond with JSON only in this format:
        {
          "feedback": "your encouraging feedback here that mentions specific areas to improve",
          "flashcard": {
            "front": "clear, specific question about a key concept",
            "back": "helpful, informative answer that truly teaches the concept",
            "topic": "relevant topic name"
          }
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const evaluation = extractJsonFromResponse(responseText);
        overallFeedback = evaluation.feedback || overallFeedback;

        if (evaluation.flashcard) {
          flashcards = [evaluation.flashcard];
        }
      } catch (e) {
        console.error("Error calling Gemini API:", e);
        // Fallback feedback
        overallFeedback =
          finalScore > 70
            ? "Good job! Review the questions you missed to improve your understanding."
            : "Keep practicing! Review the topics you struggled with and try again.";
      }
    }

    // Save score to database - ensure userId is a valid ObjectId
    const scoreRecord = await Score.create({
      userId: studentId,
      assessmentId,
      title: assessment.title,
      score: finalScore,
      feedback: overallFeedback,
      flashcards,
      questionScores,
    });

    return NextResponse.json(
      {
        message: "Assessment submitted and evaluated successfully",
        score: finalScore,
        feedback: overallFeedback,
        flashcards,
        questionScores,
        scoreId: scoreRecord._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
