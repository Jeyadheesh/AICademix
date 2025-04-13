import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import useUser from "@/store/useUser";

const AssessmentCard = ({ assessment }) => {
  const router = useRouter();
  const { currentUser } = useUser();

  useEffect(() => {
    if (currentUser && currentUser.role !== "teacher") {
      toast.error("Only teachers can access this page");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  return (
    <div className="bg-neutral-900 p-6 rounded-lg border-2 border-gray-700">
      {/* Rest of the component content */}
      {currentUser?.role === "teacher" && (
        <button
          onClick={() => router.push(`/assessments/scores/${assessment._id}`)}
          className="bg-blue-500/20 text-white px-4 py-1 rounded hover:bg-blue-500/30 transition-colors border border-blue-500"
        >
          View Scores
        </button>
      )}
    </div>
  );
};

export default AssessmentCard;
