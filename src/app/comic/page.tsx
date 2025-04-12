"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentStore } from "@/store/useDocumentStore";
import axios from "axios";
import { generateStory } from "@/utils/generateStory";
import { generateImage } from "@/utils/generateImage";
import { DocumentModal } from "@/components/DocumentModal";
import LLMSelect from "@/components/SelectLLM";
import Panels from "@/components/Panels";
import Particles from "@/components/ui/Particles";

const ComicGenerator = () => {
  const { selectedFiles, setUploadedFiles } = useDocumentStore();
  const [topic, setTopic] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [maxNbPanels, setMaxNbPanels] = useState(4);
  const [story, setStory] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [llmModel, setLlmModel] = useState<"hugging-face" | "dalle">(
    "hugging-face"
  );
  const [images, setImages] = React.useState<
    { image: Blob | string | undefined; text: string }[]
  >([
    {
      image: undefined,
      text: "",
    },
    {
      image: undefined,
      text: "",
    },
    {
      image: undefined,
      text: "",
    },
    {
      image: undefined,
      text: "",
    },
  ]);

  const fetchData = async () => {
    try {
      console.log("Fetching documents...");

      const response = await axios.get("/api/documents");
      console.log("Response:", response);

      const result = await response.data;
      setUploadedFiles(result.filenames);
      console.log("Documents fetched:", result);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateNextPage = async () => {
    setMaxNbPanels((prev) => prev + 4);
    setImages((prev) => [
      ...prev,
      {
        image: undefined,
        text: "",
      },
      {
        image: undefined,
        text: "",
      },
      {
        image: undefined,
        text: "",
      },
      {
        image: undefined,
        text: "",
      },
    ]);

    generateComic();
  };

  const generateComic = async () => {
    try {
      setIsGenerating(true);

      // Step 1: Get the context
      const context = await fetchContext();
      if (!context) return;

      // Step 2: Generate first story and images
      const firstStory = await generateStory({
        maxNbPanels,
        topic,
        context,
        previousPanel: story,
      });

      console.log("First Story generated:", firstStory);

      // Store firstStory in a local variable
      let updatedStory = [...story, ...firstStory];
      setStory(updatedStory);

      // Step 3: Generate second story and images
      const secondStory = await generateStory({
        maxNbPanels,
        topic,
        context,
        previousPanel: updatedStory, // Use updated story here
      });

      updatedStory = [...updatedStory, ...secondStory];
      setStory(updatedStory);
      console.log("Updated Story:", updatedStory);

      setCount((prev) => prev + 4);

      for (let i = 0; i < 4; i++) {
        console.log(
          "Generating image for panel",
          4 * (count / 4) - 4 + 1 + i + 3 + 1
        );

        let image;
        let success = false;
        let retryCount = 0;
        const maxRetries = 5;

        while (!success && retryCount < maxRetries) {
          try {
            image = await generateImage({
              topic,
              context,
              panelDescription:
                updatedStory[4 * (count / 4) - 4 + 1 + i + 3].instructions,
              previousPanelDescription:
                4 * (count / 4) - 4 + i > 0
                  ? updatedStory[4 * (count / 4) - 4 + 1 + i + 3]
                  : undefined,
            });
            success = true;
          } catch (error) {
            retryCount++;
            console.error(`Attempt ${retryCount} failed. Retrying...`, error);
            if (retryCount >= maxRetries) {
              throw new Error(
                `Failed to generate image after ${maxRetries} attempts: ${error.message}`
              );
            }
          }
        }

        console.log("Image generated:", image);
        console.log(updatedStory[4 * (count / 4) - 4 + 1 + i + 3].caption);

        setImages((prev) => {
          const newImages = [...prev];
          newImages[4 * (count / 4) - 4 + 1 + i + 3] = {
            image:
              llmModel == "dalle"
                ? image!
                : URL.createObjectURL(image! as Blob),
            text: updatedStory[4 * (count / 4) - 4 + 1 + i + 3].caption,
          };
          return newImages;
        });
      }
    } catch (error) {
      console.error(
        "Error generating comic:",
        error.response?.data || error.message
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchContext = async () => {
    try {
      const response = await axios.post("/api/chat", {
        query: topic,
        filenames: selectedFiles.map((file) => file.name),
      });
      
      const context = response.data.context;      
      if (!context || context.trim() === "") {
        console.error(
          "No relevant information found in the uploaded documents."
        );
        return null;
      }
      return context;
    } catch (error) {
      console.error("Error fetching context:", error);
      return null;
    }
  };

  return (
    <div className="w-full relative    h-full text-white">
      <div
        className=" -z-40 "
        style={{ width: "100%", height: "100%", position: "absolute" }}
      >
        <Particles
          className={"w-full h-full"}
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={500}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <div className=" w-3/4 mx-auto flex pt-9  items-center justify-center ">
        <h1 className="text-5xl font-bold">Comic Generator</h1>
      </div>

      <div className="flex justify-end gap-x-4 w-3/4 mx-auto mt-4">
        <DocumentModal />
        {/* <LLMSelect handleSelectChange={(e) => handleSelectChange(e)} /> */}
      </div>
      <div className="w-full mt-2 min-h-screen flex flex-col items-center justify-center gap-y-4">
        <div className=" flex  w-3/4 gap-x-3">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className=" w-full py-6 border text-white bg-gray-400/50 border-black"
            placeholder="Enter your comic text here"
          />
          <Button
            disabled={
              topic.length === 0 || selectedFiles.length === 0 || isGenerating
            }
            onClick={generateComic}
            className="py-6"
          >
            Generate
          </Button>
        </div>
        {/* Panels */}
        <Panels images={images} isGenerating={isGenerating} />
        <div className="flex gap-x-2">
          <Button
            disabled={
              topic.length === 0 || selectedFiles.length === 0 || isGenerating
            }
            className="w-32 mb-10"
            onClick={() => generateNextPage()}
          >
            Continue Story
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComicGenerator;
