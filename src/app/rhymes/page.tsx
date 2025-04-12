"use client";

import axios from "axios";
import { BiChevronLeft } from "react-icons/bi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";
// import useUser from "@/store/useUser";
// import { useStore } from "@/store/useComic";
// import { cn } from "@/lib/generate-comic/cn";
// import { fonts } from "@/lib/generate-comic/fonts";
import { FaGear } from "react-icons/fa6";
import { cn, getFileContext } from "@/lib/utils";
import { useDocumentStore } from "@/store/useDocumentStore";
import { DocumentModal } from "@/components/DocumentModal";
import { generateLyrics } from "@/utils/generateStory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

type Rhymes = {
  id?: string;
  title: string;
  audio_url: string;
  lyric: string;
};

const RhymesGeneratorPage = () => {
  //   console.log(process.env.NEXT_PUBLIC_SUNO_API_KEY);
  const { selectedFiles, setUploadedFiles } = useDocumentStore();
  const [userEmail, setUserEmail] = useState("teacher@gmail.com");
  const router = useRouter();
  const [input, setInput] = useState("");
  const resultedParam = useSearchParams().get("resulted");
  const [generatedIds, setGeneratedIds] = useState("");
  const [url, setUrl] = useState("");
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  //   const { user } = useUser((state) => state);
  //   const isGeneratingStory = useStore((s) => s.isGeneratingStory);
  //   const setGeneratingStory = useStore((s) => s.setGeneratingStory);
  const [isResulted, setIsResulted] = useState(resultedParam);
  const [old, setOlds] = useState<Rhymes[]>([]);
  const [generating, setGenerating] = useState(false);

  const getRhymes = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_API_ENDPOINT}/api/rhymes?email=${userEmail}`
      );
      console.log(data);

      const dbRhymes: Rhymes[] = data["rhymes"].map((d: Rhymes) => ({
        id: d.id,
        title: d.title,
        audio_url: d.audio_url,
        lyric: d.lyric,
      }));
      setOlds(dbRhymes);
    } catch (err) {
      console.log(err);
    } finally {
      // setGeneratingStory(false);
    }
  };

  useEffect(() => {
    getRhymes();
  }, []);

  const setRhymes = async (rhymes: Rhymes[]) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API_ENDPOINT}/api/rhymes`,
        {
          email: userEmail,
          rhymess: rhymes,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  // const fetchContext = async () => {
  //   try {
  //     const response = await axios.post("/api/chat", {
  //       query: input,
  //       filenames: selectedFiles.map((file) => file.name),
  //     });

  //     const context = response.data.context;
  //     if (!context || context.trim() === "") {
  //       console.error(
  //         "No relevant information found in the uploaded documents."
  //       );
  //       return null;
  //     }
  //     return context;
  //   } catch (error) {
  //     console.error("Error fetching context:", error);
  //     return null;
  //   }
  // };

  const handleGenerateSong = async () => {
    setGenerating(true);
    try {
      const context = await getFileContext(input, selectedFiles);
      console.log("context", context);

      if (!context) {
        setGenerating(false);
        toast.error("No relevant information found in the uploaded documents.");
        return;
      }

      const lyrics = await generateLyrics({
        topic: input,
        context,
      });
      console.log("lyrics", lyrics);

      const { data } = await axios.post(
        `http://localhost:3001/api/custom_generate`,
        {
          prompt: lyrics.lyrics,
          // tags: "pop metal male melancholic",
          // title: "Silent Battlefield",
          make_instrumental: false,
          wait_audio: true,
        }
      );

      const audio_url = data[0].audio_url;
      console.log("audio_url", audio_url);
      // songId && setGeneratedIds(songId);
      let newRhyme = [
        ...old,
        {
          title: input,
          audio_url: audio_url,
          lyric: data[0].lyric,
        },
      ];
      setOlds(newRhyme);
      setRhymes(newRhyme);
      console.log("newRhyme", newRhyme);

      setGenerating(false);
      // getSong(songId);
    } catch (err) {
      console.log(err);
      setGenerating(false);
    }
  };

  // const getSong = async (songId: string) => {
  //   try {
  //     const { data } = await axios.get(
  //       `https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${songId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUNO_API_KEY}`,
  //         },
  //       }
  //     );

  //     // if (data[0].audio_url) {
  //     //   setGeneratingStory(false);
  //     // }

  //     if (data.data.status !== "SUCCESS") {
  //       setTimeout(() => {
  //         getSong(songId);
  //       }, 3000);
  //       return;
  //     }

  //     const audioUrl = data.data.response.sunoData[0].audioUrl;
  //     console.log("audioUrl", audioUrl);
  //     const prompt = JSON.parse(data.data.param).prompt;
  //     console.log("prompt", prompt);
  //     const updatedRhymes = [
  //       {
  //         id: songId,
  //         title: prompt,
  //         audioUrl: audioUrl,
  //       },
  //     ];
  //     setOlds([]);
  //     console.log("updatedRhymes", updatedRhymes);

  //     //   await setRhymes(updatedRhymes);
  //     // await getRhymes();
  //     //   window.location.href = "/generate-rhym?resulted=true";
  //   } catch (err) {
  //     console.log(err);
  //     getSong(songId);
  //     // setGeneratingStory(false);
  //   }
  // };

  // useEffect(() => {
  //   // Play the last video added when URL is updated
  //   setTimeout(() => {
  //     if (url && videoRef.current) {
  //       videoRef.current.load(); // Reload the video to ensure it picks up the new source
  //       videoRef.current.addEventListener("canplay", () => {
  //         videoRef.current?.play(); // Play the video when it's ready
  //       });
  //     }
  //   }, 3000);
  // }, [url]);

  return (
    <main className="p-5 flex text-white flex-col gap-2 bg min-h-[calc(100vh-5rem)] bg-black">
      <div className="w-3/4 mx-auto">
        {/* <div
        className={cn(
          `print:hidden`,
          `z-20 fixed inset-0`,
          `flex flex-row items-center justify-center`,
          `transition-all duration-300 ease-in-out`,
          //   isGeneratingStory
          //     ? `bg-zinc-50/30 backdrop-blur-md`
          // : `bg-zinc-50/0 backdrop-blur-none pointer-events-none`,
          //   fonts.actionman.className
          `bg-zinc-50/0 backdrop-blur-none pointer-events-none`
        )}
      >
        <div
          className={cn(
            `text-center text-xl text-stone-700 w-[70%]`,
            // isGeneratingStory ? `` : `scale-0 opacity-0`,
            `transition-all duration-300 ease-in-out`
          )}
        >
          <div className="bg-white p-3 px-10 border-2 border-priClr boxShadow font-semibold w-max mx-auto ">
            <FaGear className="animate-spin text-3xl w-max mx-auto " />
            <h1 className="text-xl my-3">Generating...</h1>
          </div>
        </div>
      </div> */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Rhymes</h1>
          <DocumentModal />
        </div>
        <div className="flex gap-4 items-center mt-8">
          {/* <div
          onClick={() => router.push("/dashboard")}
          className="bg-priClr text-white capitalize border-[3px] border-black boxShadow flex items-center gap-2 px-3 py-2 rounde-md shadow-black shadow-sm font-semibold"
        >
          <BiChevronLeft className="text-3xl " />
        </div> */}
          <input
            placeholder="Enter Prompt"
            className={
              "p-2 border-2 border-priClr bg-white/10  boxShadow outline-0 w-full text-lg rounded-md text-white"
            }
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGenerateSong();
              }
            }}
            value={input}
          />

          <button
            disabled={!input}
            onClick={() => {
              handleGenerateSong();
            }}
            className="border-2 border-blue-500 bg-blue-500/20 hover:bg-blue-500/40 px-6 py-2 outline-0  text-lg rounded-md text-white"
          >
            <p className="whitespace-nowrap">Generate Rhym</p>
          </button>
        </div>
        {/* Result Rhymes */}
        {/* {isResulted && old.length > 0 && (
        <>
          <h3 className="text-xl font-semibold py-6">Result</h3>
          <div className="grid grid-cols-3 gap-10 items-center">
            <div></div>
            <div
              key={old[old.length - 1].audio_url}
              className="p-4 boxShadow flex flex-col gap-4 bg-white border-2 border-priClr"
            >
              <h4 className="text-lg font-semibold">
                {old[old.length - 1].title}
              </h4>
              {old[old.length - 1].audio_url && (
                <audio controls>
                  <source
                    src={old[old.length - 1].audio_url}
                    type="audio/mp3"
                  />
                </audio>
              )}
            </div>
          </div>
        </>
      )} */}

        {/* Previous Rhymes */}
        {/* <h3 className="text-xl font-semibold py-6">Previous Rhymes</h3> */}
        <div className="grid grid-cols-2 gap-10 mt-8">
          {old.map((ol, index) => (
            <div
              key={ol.audio_url + index}
              className="p-4 border-orange-500 w-full text-wrap break-words rounded-md hover:bg-orange-500/40 flex flex-col gap-4 bg-orange-500/20  border-2 border-priClr"
            >
              <h4 className="text-lg font-semibold capitalize">{ol.title}</h4>
              {ol.audio_url && (
                <audio controls>
                  <source src={ol.audio_url} type="audio/mp3" />
                </audio>
              )}
              <h1 className="text-lg font-semibold">Lyric:</h1>
              <p className="whitespace-pre text-wrap break-words">{ol.lyric}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-4 text-2xl">
            <FaGear className="animate-spin" />
            <span>Weaving your rhyme...</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default RhymesGeneratorPage;
