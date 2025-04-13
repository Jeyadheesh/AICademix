"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import useUser from "@/store/useUser";

interface ScoreDataType {
  _id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  title: string;
  score: number;
  feedback: string;
  questionScores: {
    questionType: string;
    userAnswer: string;
    correctAnswer: string;
    score: number;
    feedback: string;
  }[];
  flashcards: {
    front: string;
    back: string;
    topic: string;
  }[];
}

export default function AssessmentResultsPage() {
  const { score_id } = useParams();
  const [scoreData, setScoreData] = useState<ScoreDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currentUser } = useUser();

  useEffect(() => {
    async function fetchScoreData() {
      try {
        const response = await axios.get(`/api/scores/${score_id}`);
        setScoreData(response.data.score);
      } catch (error) {
        console.error("Error fetching score data:", error);
        toast.error("Failed to load assessment results.");
      } finally {
        setLoading(false);
      }
    }

    if (score_id) {
      fetchScoreData();
    }
  }, [score_id]);

  const handleBackToDashboard = () => {
    router.push("/assessments/dashboard");
  };

  const handleTryAgain = () => {
    if (scoreData?.assessmentId) {
      router.push(
        `/assessments/${
          scoreData.assessmentId
        }?retake=true&title=${encodeURIComponent(
          scoreData.title || "Assessment"
        )}`
      );
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading results...</div>;
  }

  if (!scoreData) {
    return <div className="text-center p-8">Results not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8">Assessment Results</h1>

      {/* Overall Score */}
      <div className="mb-8 p-6 bg-neutral-900 rounded-lg border-2 border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Score</h2>
          <div className="text-4xl font-bold text-orange-500">
            {scoreData.score}%
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Feedback</h3>
          <p className="text-gray-300">{scoreData.feedback}</p>
        </div>
      </div>

      {/* Question Breakdown */}
      <h2 className="text-2xl font-semibold mb-4">Question Breakdown</h2>
      <div className="space-y-4 mb-8">
        {scoreData.questionScores.map((question, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${
              question.score >= 0.8
                ? "border-green-500 bg-green-500/10"
                : question.score >= 0.4
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-red-500 bg-red-500/10"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">
                Question {index + 1} ({question.questionType})
              </span>
              <span className="font-bold">
                {Math.round(question.score * 100)}%
              </span>
            </div>
            <p className="mb-2 text-gray-300">{question.feedback}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/10 p-3 rounded">
                <h4 className="text-sm uppercase text-gray-400">Your Answer</h4>
                <p>{question.userAnswer || "No answer provided"}</p>
              </div>
              <div className="bg-white/10 p-3 rounded">
                <h4 className="text-sm uppercase text-gray-400">
                  Correct Answer
                </h4>
                <p>{question.correctAnswer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flashcards */}
      {scoreData.flashcards && scoreData.flashcards.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Study These Concepts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoreData.flashcards.map((flashcard, index) => (
              <div
                key={index}
                className="bg-neutral-900 border-2 border-orange-500 rounded-lg overflow-hidden shadow-lg hover:shadow-orange-500/20 transition-shadow duration-300"
              >
                <div className="bg-orange-500/20 p-4 border-b border-orange-500/30">
                  <h3 className="font-bold text-lg text-orange-300">
                    {flashcard.front}
                  </h3>
                  {flashcard.topic && (
                    <span className="inline-block mt-2 bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                      {flashcard.topic}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-gray-300">{flashcard.back}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleBackToDashboard}
          className="bg-neutral-900 text-white px-6 py-2 rounded-lg hover:bg-neutral-800 transition-colors border-2 border-gray-700"
        >
          Back to Dashboard
        </button>
        <button
          onClick={handleTryAgain}
          className="bg-orange-500/20 text-white px-6 py-2 rounded-lg hover:bg-orange-500/30 transition-colors border-2 border-orange-500"
        >
          Try Again
        </button>
      </div>

      {currentUser?.role === "teacher" && (
        <button
          onClick={() =>
            router.push(`/assessments/scores/${scoreData.assessmentId}`)
          }
          className="bg-blue-500/20 text-white px-6 py-2 rounded-lg hover:bg-blue-500/30 transition-colors border-2 border-blue-500"
        >
          Back to Scores
        </button>
      )}

      {currentUser?.role === "teacher" && scoreData.studentName && (
        <div className="mb-4 p-4 bg-neutral-900 rounded-lg border-2 border-blue-500">
          <h2 className="text-xl font-semibold">
            Student: {scoreData.studentName}
          </h2>
        </div>
      )}
    </div>
  );
}
