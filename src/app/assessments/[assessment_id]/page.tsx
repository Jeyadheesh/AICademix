"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import AssessmentBox from "@/components/ui/AssessmentBox";

import { toast } from "react-toastify";
import useUser from "@/store/useUser";
import { FaGear } from "react-icons/fa6";

export default function EditAssessmentPage() {
  const { currentUser } = useUser();
  const { assessment_id } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previousScore, setPreviousScore] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const retake = searchParams.get("retake");
  const router = useRouter();
  const isNewAssessment = !assessment_id || assessment_id === "new";
  const [generating, setGenerating] = useState(false);

  // Fetch assessment data
  const fetchAssessment = async () => {
    try {
      const res = await axios.get(`/api/assessments/${assessment_id}`);
      setAssessment(res.data.assessments[0]);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error("Failed to fetch assessment.");
    } finally {
      setLoading(false);
    }
  };

  // Check if student has already taken this assessment
  const checkPreviousAttempt = async () => {
    if (currentUser?.role !== "teacher" && !retake && currentUser?._id) {
      try {
        // Add console log to debug
        console.log("Checking previous attempts for user:", currentUser._id);

        const res = await axios.post(
          `/api/scores/by-assessment/${assessment_id}`,
          {
            student_id: currentUser._id,
          }
        );

        console.log("Previous attempt check response:", res.data);

        if (res.data.scoreId) {
          setPreviousScore(res.data.scoreId);
          // Redirect to results page
          toast.info(
            "You've already taken this assessment. Viewing your results."
          );
          router.push(`/assessments/results/${res.data.scoreId}`);
        }
      } catch (error) {
        console.error("Error checking previous attempts:", error);
      }
    }
  };

  useEffect(() => {
    if (assessment_id) {
      fetchAssessment();
    }

    // Only check previous attempts if user is loaded and not in retake mode
    if (currentUser?._id && !isNewAssessment && !retake) {
      checkPreviousAttempt();
    }
  }, [assessment_id, currentUser, retake]);

  if (loading) {
    return <div className="text-center p-8">Loading assessment...</div>;
  }

  if (!assessment) {
    return <div className="text-center p-8">Assessment not found.</div>;
  }

  return (
    <div className="p-4 bg-black">
      <h1 className="text-3xl font-bold mb-4 text-white container mx-auto">
        {isNewAssessment
          ? "Create New Assessment"
          : `${
              currentUser?.role === "teacher" ? "Edit" : "Take"
            } Assessment: ${title}`}
      </h1>
      <AssessmentBox
        assessment={assessment}
        onUpdate={async (updatedAssessment) => {
          setAssessment(updatedAssessment);
          try {
            setSaving(true);
            const url = isNewAssessment
              ? "/api/assessments/publish"
              : `/api/assessments/${assessment_id}`;
            const method = isNewAssessment ? "post" : "put";

            await axios[method](url, {
              title: updatedAssessment.title,
              mcq: updatedAssessment.mcq,
              fillInBlanks: updatedAssessment.fillInBlanks,
              shortAnswer: updatedAssessment.shortAnswer,
            });

            if (isNewAssessment) {
              toast.success("Assessment published successfully!");
            }

            router.push("/assessments/dashboard");
          } catch (error) {
            console.error("Error saving assessment:", error);
            toast.error(
              isNewAssessment
                ? "Failed to publish assessment."
                : "Failed to update assessment."
            );
          } finally {
            setSaving(false);
          }
        }}
        isEditMode={currentUser?.role === "teacher"}
        isNewAssessment={isNewAssessment}
        setGenerating={setGenerating}
        takeAssessment={currentUser?.role !== "teacher"}
      />

      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-4 text-2xl">
            <FaGear className="animate-spin text-white" />
            <span className="text-white">Weaving your assessments...</span>
          </div>
        </div>
      )}
    </div>
  );
}
