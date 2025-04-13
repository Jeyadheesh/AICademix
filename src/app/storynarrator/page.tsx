"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiChevronLeft } from "react-icons/bi";
import { FaGear } from "react-icons/fa6";
import { GoogleGenerativeAI } from "@google/generative-ai";

type StoryNode = {
  question: string;
  options: { description: string }[];
  selectedOption?: string;
};

const StoryNarrator = () => {
  const [title, setTitle] = useState("");
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [integratedStory, setIntegratedStory] = useState("");
  const [generating, setGenerating] = useState(false);

  const router = useRouter();
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const generateNewNode = async (previousNodes: StoryNode[] = []) => {
    setGenerating(true);

    const historyPrompt = previousNodes
      .map(
        (node) => `${node.question}\nChosen: ${node.selectedOption || "none"}`
      )
      .join("\n");

    const prompt = `Generate a story continuation based on:
    Title: ${title}
    Previous choices: ${historyPrompt || "None"}
    
    You're a story narrator who will generate stories with user provided topic and choices,It's especially for children to learn and have fun.Atlast the children should learn that provided topic.Educate them with the story.
    - It should be a educative and entertaining story.
    - The story should be suitable for small children.
    - Make them learn something new in the given context.
    - The story should be engaging and immersive.
    - use imojis to make it more fun.
    Provide:
    1. A new concise story situation or explanation of the topic.
    2. 3 possible choices. should be single short sentences.The choice should aslo related or explaning the topic.
    3. The choices should be relevant to the story and lead to different paths.
    Format response as JSON: { "question": "...", "options": [{ "description": "..." }] }`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      return JSON.parse(jsonString);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateFirstQuestion = async () => {
    const firstNode = await generateNewNode();
    setNodes([firstNode]);
  };

  const handleSelectOption = async (nodeIndex: number, optionIndex: number) => {
    const updatedNodes = [...nodes];
    updatedNodes[nodeIndex].selectedOption =
      updatedNodes[nodeIndex].options[optionIndex].description;

    const newNode = await generateNewNode(updatedNodes);
    setNodes([...updatedNodes, newNode]);
  };

  const handleEndStory = async () => {
    setGenerating(true);
    const storyPrompt = nodes
      .map(
        (node) =>
          `${node.question}\nChoice made: ${node.selectedOption || "none"}`
      )
      .join("\n\n");

    const prompt = `Create a cohesive story from these events:
    ${storyPrompt}
    
    Format as a continuous narrative without choices. Start with "Once upon a time..."
    Keep the story engaging and coherent. Provide a title for the story.
    `;

    try {
      const result = await model.generateContent(prompt);
      setIntegratedStory(result.response.text());
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white w-full p-8">
      {/* Header Section */}
      <div className="w-full max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold">Interactive Story Generator</h1>
        </div>

        {/* Controls */}
        <div className="flex gap-6 items-center">
          <input
            placeholder="Story Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 p-4 bg-black border-2 border-white/20 bg-white/10 rounded-lg focus:outline-none"
          />

          <button
            onClick={handleGenerateFirstQuestion}
            disabled={!title}
            className="px-8 py-4 bg-blue-500/20 hover:bg-blue-500/40 border-2 border-blue-500 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Start Journey
          </button>
        </div>
      </div>

      {/* Story Nodes Container */}
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {nodes.map((node, index) => (
          <div
            key={index}
            className="relative p-8 bg-gray-900 rounded-xl border-2 border-white/10 shadow-xl"
          >
            <div className="absolute top-4 right-4 text-white/40 text-sm">
              Chapter {index + 1}
            </div>

            <p className="text-xl mb-6 font-light leading-relaxed">
              {node.question}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {node.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => handleSelectOption(index, optionIndex)}
                  disabled={!!node.selectedOption}
                  className={`p-4 text-left rounded-xl border-2 transition-all
                    ${
                      node.selectedOption
                        ? option.description === node.selectedOption
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/5 opacity-50 cursor-default"
                        : "border-white/10 hover:border-blue-400 hover:bg-blue-500/10"
                    }
                    `}
                >
                  <span className="text-blue-400 mr-2">▷</span>
                  {option.description}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* End Story Section */}
      {nodes.length > 0 && !integratedStory && (
        <div className="w-full max-w-7xl mx-auto mt-16 flex justify-center">
          <button
            onClick={handleEndStory}
            className="px-8 py-4 bg-red-500/20 border-2 border-red-500 hover:bg-red-500/40 rounded-lg font-bold text-lg transition-all"
          >
            Complete Story & Generate Finale
          </button>
        </div>
      )}

      {/* Integrated Story Display */}
      {integratedStory && (
        <div className="w-full max-w-7xl mx-auto mt-12 p-8 bg-gray-900 rounded-xl border-2 border-white/10">
          <h2 className="text-3xl font-bold mb-6">Your Epic Tale</h2>
          <div className="prose prose-invert text-lg leading-relaxed whitespace-pre-wrap">
            {integratedStory}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-4 text-2xl">
            <FaGear className="animate-spin" />
            <span>Weaving your story...</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default StoryNarrator;
