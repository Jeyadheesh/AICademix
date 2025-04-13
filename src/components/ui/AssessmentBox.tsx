"use client";

import React, { useState, useEffect } from "react";
import { Trash, Check, X, Plus } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import useUser from "@/store/useUser";
import { useRouter } from "next/navigation";

interface AssessmentBoxProps {
  assessment: Assessment;
  onUpdate: (updatedAssessment: Assessment) => void;
  isEditMode?: boolean;
  isNewAssessment?: boolean;
  takeAssessment?: boolean;
  setGenerating?: (generating: boolean) => void;
}

const AssessmentBox: React.FC<AssessmentBoxProps> = ({
  assessment,
  onUpdate,
  isEditMode,
  isNewAssessment = true,
  takeAssessment = false,
  setGenerating,
}) => {
  const [editableAssessment, setEditableAssessment] = useState<Assessment>({
    mcq: [],
    fillInBlanks: [],
    shortAnswer: [],
  });
  const [title, setTitle] = useState(""); // State for assessment title
  const [studentAnswers, setStudentAnswers] = useState<{
    mcq: Record<number, string>;
    fillInBlanks: Record<number, string>;
    shortAnswer: Record<number, string>;
  }>({
    mcq: {},
    fillInBlanks: {},
    shortAnswer: {},
  });
  const { currentUser } = useUser();
  const router = useRouter();

  // Initialize editableAssessment when the assessment prop changes
  useEffect(() => {
    if (assessment) {
      setEditableAssessment({
        mcq: assessment.mcq || [],
        fillInBlanks: assessment.fillInBlanks || [],
        shortAnswer: assessment.shortAnswer || [],
      });

      if (assessment.title) {
        setTitle(assessment.title);
      }
    }
  }, [assessment]);

  if (!assessment) {
    return <p>No assessment generated yet.</p>;
  }

  // Combine all questions into a single array with original indexes
  const allQuestions = [
    ...editableAssessment.mcq.map((q, originalIndex) => ({
      ...q,
      type: "mcq" as const,
      originalIndex,
    })),
    ...editableAssessment.fillInBlanks.map((q, originalIndex) => ({
      ...q,
      type: "fillInBlanks" as const,
      originalIndex,
    })),
    ...editableAssessment.shortAnswer.map((q, originalIndex) => ({
      ...q,
      type: "shortAnswer" as const,
      originalIndex,
    })),
  ];

  // Handle editing questions
  const handleEditQuestion = (
    type: keyof Assessment,
    originalIndex: number,
    newQuestion: string
  ) => {
    const updatedAssessment = { ...editableAssessment };
    if (updatedAssessment[type]?.[originalIndex]) {
      if (typeof updatedAssessment[type][originalIndex] !== "string") {
        updatedAssessment[type][originalIndex].question = newQuestion;
      }
    } else {
      console.error(
        `Question at index ${originalIndex} does not exist in ${type}.`
      );
      toast.error(
        `Failed to edit question for ${type} question at index ${originalIndex}.`
      );
    }
    setEditableAssessment(updatedAssessment);
  };

  // Handle editing options (for MCQs)
  const handleEditOption = (
    questionIndex: number,
    optionIndex: number,
    newOption: string
  ) => {
    const updatedAssessment = { ...editableAssessment };
    updatedAssessment.mcq[questionIndex].options[optionIndex] = newOption;
    setEditableAssessment(updatedAssessment);
  };

  // Handle editing answers
  const handleEditAnswer = (
    type: keyof Assessment,
    originalIndex: number,
    newAnswer: string
  ) => {
    const updatedAssessment = { ...editableAssessment };

    // Debugging: Log the type, index, and question being edited
    if (updatedAssessment[type] && updatedAssessment[type][originalIndex]) {
      console.log(
        "Editing answer for:",
        type,
        originalIndex,
        updatedAssessment[type][originalIndex]
      );
    }

    // Ensure the question exists before modifying its answer
    if (updatedAssessment[type] && updatedAssessment[type][originalIndex]) {
      if (typeof updatedAssessment[type][originalIndex] !== "string") {
        updatedAssessment[type][originalIndex].answer = newAnswer;
      }
      setEditableAssessment(updatedAssessment);
    } else {
      console.error(
        `Question at index ${originalIndex} does not exist in ${type}.`
      );
      toast.error(
        `Failed to edit answer for ${type} question at index ${originalIndex}.`
      );
    }
  };

  // Handle deleting questions
  const handleDeleteQuestion = (
    type: keyof Assessment,
    originalIndex: number
  ) => {
    const updatedAssessment = { ...editableAssessment };
    if (updatedAssessment[type]) {
      if (Array.isArray(updatedAssessment[type])) {
        updatedAssessment[type].splice(originalIndex, 1);
      }
    }
    setEditableAssessment(updatedAssessment);
  };

  // Handle deleting options (for MCQs)
  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const updatedAssessment = { ...editableAssessment };
    updatedAssessment.mcq[questionIndex].options.splice(optionIndex, 1);
    setEditableAssessment(updatedAssessment);
  };

  // Handle adding options (for MCQs)
  const handleAddOption = (questionIndex: number) => {
    const updatedAssessment = { ...editableAssessment };
    updatedAssessment.mcq[questionIndex].options.push("New Option");
    setEditableAssessment(updatedAssessment);
  };

  // Handle changing the correct answer for MCQs
  const handleChangeCorrectAnswer = (
    questionIndex: number,
    newCorrectAnswer: string
  ) => {
    const updatedAssessment = { ...editableAssessment };
    updatedAssessment.mcq[questionIndex].answer = newCorrectAnswer;
    setEditableAssessment(updatedAssessment);
  };

  // Save the entire assessment locally
  const handleRepublish = () => {
    setGenerating!(true); // Show loading spinner
    onUpdate(editableAssessment); // Save the updated assessment
    toast.success("Republished successfully!"); // Show toast message
    setGenerating!(false); // Hide loading spinner
    router.push("/assessments/dashboard"); // Navigate to dashboard
  };

  const handlePublish = async () => {
    setGenerating!(true); // Show loading spinner
    console.log(title);

    if (!title) {
      toast.error("Please provide a title for the assessment.");
      setGenerating!(false);
      return;
    }

    try {
      const response = await fetch("/api/assessments/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editableAssessment._id, // Include ID for updates
          title,
          mcq: editableAssessment.mcq,
          fillInBlanks: editableAssessment.fillInBlanks,
          shortAnswer: editableAssessment.shortAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish assessment.");
      }

      const data = await response.json();
      toast.success("Published successfully!");
      console.log("Published Assessment:", data); // Debugging
      router.push("/assessments/dashboard");
      setGenerating!(false);
    } catch (error) {
      setGenerating!(false);
      console.error("Error publishing assessment:", error);
      toast.error("Failed to publish assessment.");
    }
  };

  // Handle student selecting an MCQ option
  const handleSelectMCQOption = (questionIndex: number, option: string) => {
    if (!takeAssessment) return;

    setStudentAnswers((prev) => ({
      ...prev,
      mcq: {
        ...prev.mcq,
        [questionIndex]: option,
      },
    }));
  };

  // Handle student entering fill-in-the-blanks answer
  const handleFillInBlanksAnswer = (questionIndex: number, answer: string) => {
    if (!takeAssessment) return;

    setStudentAnswers((prev) => ({
      ...prev,
      fillInBlanks: {
        ...prev.fillInBlanks,
        [questionIndex]: answer,
      },
    }));
  };

  // Handle student entering short answer
  const handleShortAnswerInput = (questionIndex: number, answer: string) => {
    if (!takeAssessment) return;

    setStudentAnswers((prev) => ({
      ...prev,
      shortAnswer: {
        ...prev.shortAnswer,
        [questionIndex]: answer,
      },
    }));
  };

  // Submit student assessment
  const handleSubmitAssessment = async () => {
    setGenerating!(true);
    try {
      // Show a loading toast
      const loadingToast = toast.loading("Submitting your assessment...");

      const response = await axios.post("/api/assessments/submit", {
        studentId: currentUser?._id,
        assessmentId: assessment._id,
        answers: studentAnswers,
      });

      // Close the loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success("Assessment submitted successfully!");

      // Navigate to results page with the score ID using router
      router.push(`/assessments/results/${response.data.scoreId}`);
      setGenerating!(false);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment. Please try again.");
      setGenerating!(false);
    }
  };

  return (
    <div className="space-y-6 container mx-auto">
      {isNewAssessment && (
        <div>
          <label
            htmlFor="title"
            className="block text-xl font-semibold text-white"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title of the assessment"
            className="mt-1 block w-full rounded-md bg-white/10 text-white text-lg p-3"
            disabled={takeAssessment}
          />
        </div>
      )}
      {/* Render all questions with sequential numbering */}
      {allQuestions.map((question, index) => (
        <div key={index}>
          {/* MCQ Question */}
          {question.type === "mcq" && (
            <div className="border-2 border-gray-700 p-4 rounded-lg bg-neutral-900 shadow-sm relative">
              {/* Question Number */}
              <p className="text-lg font-bold mb-2 text-white">
                <span className="w-10 h-10  rounded-md border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center text-white">
                  {index + 1}
                </span>
                MCQ Question
              </p>

              {/* Delete Question Button */}
              {!takeAssessment && (
                <button
                  onClick={() =>
                    handleDeleteQuestion("mcq", question.originalIndex)
                  }
                  className="absolute top-2 right-2 p-1 hover:bg-gray-800 rounded"
                >
                  <Trash className="w-6 h-6 text-orange-500" />
                </button>
              )}

              {/* Question */}
              <div className="mb-4">
                {takeAssessment ? (
                  <p className="font-semibold w-full p-2 text-white text-lg">
                    {question.question}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      handleEditQuestion(
                        "mcq",
                        question.originalIndex,
                        e.target.value
                      )
                    }
                    className="font-semibold w-full p-2 rounded bg-white/10 text-white text-lg"
                  />
                )}
              </div>

              {/* Options */}
              <p className="text-white text-lg font-semibold">Options</p>
              <ul className="space-y-2">
                {"options" in question &&
                  (question.options as string[]).map(
                    (option: string, optionIndex: number) => (
                      <li key={optionIndex} className="flex items-center gap-2">
                        {/* Option Text */}
                        {takeAssessment ? (
                          <div
                            onClick={() =>
                              handleSelectMCQOption(
                                question.originalIndex,
                                option
                              )
                            }
                            className={`flex-1 p-2 rounded text-white text-lg cursor-pointer ${
                              studentAnswers.mcq[question.originalIndex] ===
                              option
                                ? "bg-orange-500/20 border-2 border-orange-500"
                                : "bg-white/10"
                            }`}
                          >
                            {option}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleEditOption(
                                question.originalIndex,
                                optionIndex,
                                e.target.value
                              )
                            }
                            className="flex-1 p-2 rounded bg-white/10 text-white text-lg"
                          />
                        )}

                        {/* Correct/Wrong Indicator */}
                        {!takeAssessment && (
                          <>
                            {option === question.answer ? (
                              <button
                                onClick={() =>
                                  handleChangeCorrectAnswer(
                                    question.originalIndex,
                                    option
                                  )
                                }
                                className="p-1 hover:bg-gray-800 rounded"
                              >
                                <Check className="w-6 h-6 text-green-500" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleChangeCorrectAnswer(
                                    question.originalIndex,
                                    option
                                  )
                                }
                                className="p-1 hover:bg-gray-800 rounded"
                              >
                                <X className="w-6 h-6 text-red-500" />
                              </button>
                            )}

                            {/* Delete Option Button */}
                            <button
                              onClick={() =>
                                handleDeleteOption(
                                  question.originalIndex,
                                  optionIndex
                                )
                              }
                              className="p-1 hover:bg-gray-800 rounded"
                            >
                              <Trash className="w-6 h-6 text-orange-500" />
                            </button>
                          </>
                        )}
                      </li>
                    )
                  )}
              </ul>

              {/* Add Option Button */}
              {!takeAssessment && (
                <button
                  onClick={() => handleAddOption(question.originalIndex)}
                  className="mt-2 text-sm text-blue-500 underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              )}
            </div>
          )}

          {/* Fill in the Blanks Question */}
          {question.type === "fillInBlanks" && (
            <div className="border-2 border-gray-700 p-4 rounded-lg bg-neutral-900 shadow-sm relative">
              {/* Question Number */}
              <p className="text-lg font-bold mb-2 text-white">
                <span className="w-10 h-10  rounded-md border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center text-white">
                  {index + 1}
                </span>
                Fill in the Blanks
              </p>

              {/* Delete Question Button */}
              {!takeAssessment && (
                <button
                  onClick={() =>
                    handleDeleteQuestion("fillInBlanks", question.originalIndex)
                  }
                  className="absolute top-2 right-2 p-1 hover:bg-gray-800 rounded"
                >
                  <Trash className="w-6 h-6 text-orange-500" />
                </button>
              )}

              {/* Question */}
              <div className="mb-4">
                {takeAssessment ? (
                  <p className="font-semibold w-full p-2 text-white text-lg">
                    {question.question}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      handleEditQuestion(
                        "fillInBlanks",
                        question.originalIndex,
                        e.target.value
                      )
                    }
                    className="font-semibold w-full p-2 rounded bg-white/10 text-white text-lg"
                  />
                )}
              </div>

              {/* Answer */}
              <div>
                <p className="text-white text-lg font-semibold">
                  {takeAssessment ? "Your Answer" : "Answer"}
                </p>
                <input
                  type="text"
                  value={
                    takeAssessment
                      ? studentAnswers.fillInBlanks[question.originalIndex] ||
                        ""
                      : question.answer
                  }
                  onChange={(e) =>
                    takeAssessment
                      ? handleFillInBlanksAnswer(
                          question.originalIndex,
                          e.target.value
                        )
                      : handleEditAnswer(
                          "fillInBlanks",
                          question.originalIndex,
                          e.target.value
                        )
                  }
                  className="w-full p-2 rounded bg-white/10 text-white text-lg"
                  placeholder={takeAssessment ? "Type your answer here" : ""}
                />
              </div>
            </div>
          )}

          {/* Short Answer Question */}
          {question.type === "shortAnswer" && (
            <div className="border-2 border-gray-700 p-4 rounded-lg bg-neutral-900 shadow-sm relative">
              {/* Question Number */}
              <p className="text-lg font-bold mb-2 text-white">
                <span className="w-10 h-10  rounded-md border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center text-white">
                  {index + 1}
                </span>
                Short Answer
              </p>

              {/* Delete Question Button */}
              {!takeAssessment && (
                <button
                  onClick={() =>
                    handleDeleteQuestion("shortAnswer", question.originalIndex)
                  }
                  className="absolute top-2 right-2 p-1 hover:bg-gray-800 rounded"
                >
                  <Trash className="w-6 h-6 text-orange-500" />
                </button>
              )}

              {/* Question */}
              <div className="mb-4">
                {takeAssessment ? (
                  <p className="font-semibold w-full p-2 text-white text-lg">
                    {question.question}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      handleEditQuestion(
                        "shortAnswer",
                        question.originalIndex,
                        e.target.value
                      )
                    }
                    className="font-semibold w-full p-2 rounded bg-white/10 text-white text-lg"
                  />
                )}
              </div>

              {/* Answer */}
              <div>
                <p className="text-white text-lg font-semibold">
                  {takeAssessment ? "Your Answer" : "Answer"}
                </p>
                <textarea
                  value={
                    takeAssessment
                      ? studentAnswers.shortAnswer[question.originalIndex] || ""
                      : question.answer
                  }
                  onChange={(e) =>
                    takeAssessment
                      ? handleShortAnswerInput(
                          question.originalIndex,
                          e.target.value
                        )
                      : handleEditAnswer(
                          "shortAnswer",
                          question.originalIndex,
                          e.target.value
                        )
                  }
                  className="w-full p-2 rounded bg-white/10 text-white text-lg"
                  rows={4}
                  placeholder={takeAssessment ? "Type your answer here" : ""}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Save and Publish Buttons */}
      <div className="flex justify-center gap-4">
        {isEditMode && !takeAssessment && (
          <button
            onClick={handleRepublish}
            className="bg-orange-500/20 text-white w-full py-2 text-lg font-semibold rounded-lg hover:bg-orange-500/40 border-2 border-orange-500 transition-colors"
          >
            Republish
          </button>
        )}
        {!isEditMode && !takeAssessment && (
          <button
            onClick={handlePublish}
            className="bg-orange-500/20 text-white w-full py-2 text-lg font-semibold rounded-lg hover:bg-orange-500/40 border-2 border-orange-500 transition-colors"
          >
            Publish
          </button>
        )}
        {takeAssessment && (
          <button
            onClick={handleSubmitAssessment}
            className="bg-orange-500/20 text-white w-full py-2 text-lg font-semibold rounded-lg hover:bg-orange-500/40 border-2 border-orange-500 transition-colors"
          >
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentBox;
