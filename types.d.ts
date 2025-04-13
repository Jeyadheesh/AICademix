interface FileInfo {
  name: string;
}

type Role = "teacher" | "student";

interface McqType {
  question: string;
  options: string[];
}

interface Assessment {
  _id?: string;
  mcq: {
    question: string;
    options: string[];
    answer: string;
    selected?: string;
  }[];
  fillInBlanks: { question: string; answer: string; selected?: string }[];
  shortAnswer: { question: string; answer: string; selected?: string }[];
  title?: string;
}

interface AssessmentBoxProps {
  assessment: Assessment;
  onUpdate: (updatedAssessment: Assessment) => void;
}
