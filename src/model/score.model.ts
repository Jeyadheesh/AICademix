import mongoose, { Schema } from "mongoose";

// Define a flashcard schema
const flashcardSchema = new Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
  topic: { type: String, required: false },
});

// Define the score schema
const scoreSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    score: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    flashcards: [flashcardSchema],
    questionScores: [
      {
        questionId: String,
        questionType: {
          type: String,
          enum: ["mcq", "fillInBlanks", "shortAnswer"],
        },
        userAnswer: String,
        correctAnswer: String,
        score: Number,
        feedback: String,
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for faster queries
scoreSchema.index({ userId: 1, assessmentId: 1 });

const Score = mongoose.models.Score || mongoose.model("Score", scoreSchema);

export default Score;
