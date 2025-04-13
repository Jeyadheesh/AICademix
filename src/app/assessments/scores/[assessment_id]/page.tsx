"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  submittedAt: string;
}

export default function AssessmentScoresPage() {
  const { assessment_id } = useParams();
  const title = useSearchParams().get("title");
  const [scores, setScores] = useState<ScoreDataType[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currentUser } = useUser();

  // Fetch all scores for this assessment
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get(
          `/api/scores/assessment/${assessment_id}`
        );
        setScores(response.data.scores);

        if (response.data.scores.length > 0) {
          setAssessmentTitle(response.data.scores[0].title || "Assessment");
        } else {
          // If no scores, fetch assessment title directly
          const assessmentResponse = await axios.get(
            `/api/assessments/${assessment_id}`
          );
          if (
            assessmentResponse.data.assessments &&
            assessmentResponse.data.assessments.length > 0
          ) {
            setAssessmentTitle(
              assessmentResponse.data.assessments[0].title || "Assessment"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching scores:", error);
        toast.error("Failed to load assessment scores");
      } finally {
        setLoading(false);
      }
    };

    if (assessment_id) {
      fetchScores();
    }
  }, [assessment_id]);

  // Check if user is a teacher
  useEffect(() => {
    if (currentUser && currentUser.role !== "teacher") {
      toast.error("Only teachers can access this page");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const handleViewScore = (scoreId: string) => {
    router.push(`/assessments/results/${scoreId}`);
  };

  const handleBackToDashboard = () => {
    router.push("/assessments/dashboard");
  };

  if (loading) {
    return <div className="text-center p-8">Loading scores...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8">
        Student Scores: {title || assessmentTitle}
      </h1>

      {scores.length === 0 ? (
        <div className="bg-neutral-900 p-6 rounded-lg border-2 border-gray-700 text-center">
          <p className="text-xl">No students have taken this assessment yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-neutral-900 rounded-lg border-2 border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-center">Submitted</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {scores.map((score) => (
                  <tr key={score._id} className="hover:bg-gray-800/50">
                    <td className="p-3">{score.studentName}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-bold ${
                          score.score >= 80
                            ? "text-green-500"
                            : score.score >= 60
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {score.score}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {new Date(score.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleViewScore(score._id)}
                        className="bg-orange-500/20 text-white px-4 py-1 rounded hover:bg-orange-500/30 transition-colors border border-orange-500"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-sm text-gray-400">
            <p>* Showing all student submissions for this assessment</p>
          </div>
        </>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleBackToDashboard}
          className="bg-neutral-900 text-white px-6 py-2 rounded-lg hover:bg-neutral-800 transition-colors border-2 border-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
