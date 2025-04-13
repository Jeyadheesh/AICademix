"use client";

import React, { useState } from "react";
import axios from "axios";
import { useDocumentStore } from "@/store/useDocumentStore";
import { DocumentModal } from "@/components/DocumentModal";
import { FaGear } from "react-icons/fa6";
import AssessmentBox from "@/components/ui/AssessmentBox";

export default function AssessmentsPage() {
  const [topic, setTopic] = useState("");
  const { selectedFiles } = useDocumentStore();
  const [mcqCount, setMcqCount] = useState(0);
  const [fillInBlanksCount, setFillInBlanksCount] = useState(0);
  const [shortAnswerCount, setShortAnswerCount] = useState(0);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateAssessment = async () => {
    setGenerating(true);
    try {
      // Reset the assessment state
      setAssessment(null);

      const contextResponse = await axios.post("/api/chat", {
        query: topic,
        filenames: selectedFiles.map((file) => file.name),
      });
      const context = contextResponse.data.context;
      if (!context || context.trim() === "") {
        console.error(
          "Sorry, try again. No information about this topic in the uploaded documents."
        );
        return;
      }

      // Generate the assessment using the context
      const response = await axios.post("/api/assessments", {
        topic,
        mcqCount,
        fillInBlanksCount,
        shortAnswerCount,
        context,
      });
      setAssessment(response.data);
      setGenerating(false);
    } catch (error) {
      console.error(
        "Error generating assessment:",
        error.response?.data || error.message
      );
      setGenerating(false);
    }
  };

  // Debugging: Log the assessment state whenever it changes
  // useEffect(() => {
  //   console.log("Assessment State Updated:", assessment);
  // }, [assessment]);

  return (
    <div className="mx-auto p-4 bg-black min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-4 text-white">
        Question Generator
      </h1>
      <div className="flex justify-end">
        <DocumentModal />
      </div>
      <div className="mt-4 container mx-auto flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-white text-2xl font-bold">Topic</p>
          <input
            type="text"
            placeholder="Enter the Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white/10 text-white text-lg rounded-lg p-3"
          />
        </div>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-base font-semibold mb-1 text-white">
              MCQ
            </label>
            <input
              type="number"
              placeholder="0"
              value={mcqCount}
              onChange={(e) => setMcqCount(Number(e.target.value))}
              className="w-full bg-white/10 text-white text-lg rounded-lg p-3"
            />
          </div>
          <div className="flex-1">
            <label className="block text-base font-semibold mb-1 text-white">
              Fill in the Blanks
            </label>
            <input
              type="number"
              placeholder="0"
              value={fillInBlanksCount}
              onChange={(e) => setFillInBlanksCount(Number(e.target.value))}
              className="w-full bg-white/10 text-white text-lg rounded-lg p-3"
            />
          </div>
          <div className="flex-1">
            <label className="block text-base font-semibold mb-1 text-white">
              Short Answers
            </label>
            <input
              type="number"
              placeholder="0"
              value={shortAnswerCount}
              onChange={(e) => setShortAnswerCount(Number(e.target.value))}
              className="w-full bg-white/10 text-white text-lg rounded-lg p-3"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateAssessment}
          className="p-3 border-2 border-blue-500 rounded-lg text-white text-lg font-semibold bg-blue-500/20 hover:bg-blue-500/40 transition-all duration-300"
        >
          Generate Assessment
        </button>
      </div>
      {assessment && (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">Generated Assessment</h2>
          <AssessmentBox
            assessment={assessment}
            onUpdate={(updatedAssessment) => setAssessment(updatedAssessment)}
            setGenerating={setGenerating}
          />
        </div>
      )}

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
