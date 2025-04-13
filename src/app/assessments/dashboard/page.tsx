"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import useUser from "@/store/useUser";

interface Assessment {
  _id: string;
  title: string;
  mcq: any[];
  fillInBlanks: any[];
  shortAnswer: any[];
  createdAt: string;
}

export default function Dashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();

  // Fetch all assessments from the database
  const fetchAssessments = async () => {
    try {
      const response = await axios.get("/api/assessments");
      setAssessments(response.data.assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to fetch assessments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold mb-8 text-white">Dashboard</h1>
        {currentUser?.role === "teacher" && (
          <Link
            href="/assessments"
            className="bg-orange-500/20 text-white px-6 py-1.5 rounded-md hover:bg-orange-500/40 border-2 border-orange-500 transition-colors"
          >
            Create Assessment
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-black">Loading assessments...</p>
      ) : assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment._id}
              className="bg-blue-500/5 p-6 rounded-lg shadow-md border-2 border-blue-500 hover:bg-blue-500/10 transition-all flex flex-col"
            >
              <h2 className="text-2xl font-semibold mb-4 text-white">
                {assessment.title}
              </h2>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white">
                  Created: {new Date(assessment.createdAt).toLocaleDateString()}
                </p>
                <p className="text-white">
                  Questions:{" "}
                  {assessment.mcq.length +
                    assessment.fillInBlanks.length +
                    assessment.shortAnswer.length}
                </p>
              </div>
              {currentUser?.role === "teacher" ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/assessments/${assessment._id}?title=${assessment.title}`} // Use plural "assessments"
                    className="bg-orange-500/20 text-white w-full py-1.5 rounded-md text-center hover:bg-orange-500/40 border-2 border-orange-500 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/assessments/scores/${assessment._id}?title=${assessment.title}`} // Use plural "assessments"
                    className="bg-orange-500/20 text-white w-full py-1.5 rounded-md text-center hover:bg-orange-500/40 border-2 border-orange-500 transition-colors"
                  >
                    View Scores
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/assessments/${assessment._id}?title=${assessment.title}`} // Use plural "assessments"
                  className="bg-orange-500/20 text-white w-full py-1.5 rounded-md text-center hover:bg-orange-500/40 border-2 border-orange-500 transition-colors"
                >
                  Take Assessment
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-black">No assessments found.</p>
      )}
    </div>
  );
}
