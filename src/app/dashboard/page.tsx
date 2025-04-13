"use client";

import Header from "@/components/Header";
import SpotlightCard from "@/components/SpotlightCard";
import React, { useState } from "react";
import { ImBook } from "react-icons/im";
import { BsClipboard2CheckFill } from "react-icons/bs";
import { FaRegEye } from "react-icons/fa";
import { LuAudioLines } from "react-icons/lu";
import Link from "next/link";
import { MdOutlineChecklistRtl } from "react-icons/md";
import Particles from "@/components/ui/Particles";
import { RiSpeakAiLine } from "react-icons/ri";

type Props = {};

const page = (props: Props) => {
  const [selected, setSelected] = useState<string>("");

  return (
    <>
      <main className="min-h-[calc(100vh-5rem)] text-white overflow-hidden flex flex-col relative">
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
        <section className="flex flex-col items-center justify-center flex-1 h-full gap-6 p-4">
          <div className="flex flex-col gap-10">
            <p className="text-white text-5xl font-bold">
              What do you want to do?
            </p>
            <div className="flex gap-8">
              <div onClick={() => setSelected("learn")} className="w-[25vw]">
                <SpotlightCard
                  className="bg-orange-500/10 w-full border-2 border-orange-400 p-10 backdrop-blur-sm"
                  spotlightColor="rgba(251, 146, 60, 0.3)"
                >
                  <div className="flex flex-col justify-center gap-4">
                    <ImBook className="text-5xl text-white" />
                    <p className="text-white text-4xl font-bold">Learn</p>
                    <p className="text-xl font-medium  text-gray-300">
                      Unleash your genius with every lesson
                    </p>
                  </div>
                </SpotlightCard>
              </div>
              <div onClick={() => setSelected("evaluate")} className="w-[25vw]">
                <SpotlightCard
                  className="bg-blue-500/10 w-full border-2 border-blue-400 p-10 backdrop-blur-sm"
                  spotlightColor="rgba(96, 165, 250, 0.3)"
                >
                  <div className="flex flex-col justify-center gap-4">
                    <BsClipboard2CheckFill className="text-5xl text-white" />
                    <p className="text-white text-4xl font-bold">Evaluate</p>
                    <p className="text-xl font-medium  text-gray-300">
                      Watch your growth unfold in real-time
                    </p>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </div>
          {selected === "learn" && (
            <div className="flex flex-col gap-10">
              <p className="text-white text-5xl font-bold">
                How do you want to learn?
              </p>
              <div className="flex gap-8">
                <Link href={"/comic"} className="w-[25vw]">
                  <SpotlightCard
                    className="bg-orange-500/10 w-full border-2 border-orange-400 p-10 backdrop-blur-sm"
                    spotlightColor="rgba(251, 146, 60, 0.3)"
                  >
                    <div className="flex flex-col justify-center gap-4">
                      <FaRegEye className="text-5xl text-white" />
                      <p className="text-white text-4xl font-bold">Visual</p>
                      <p className="text-xl font-medium  text-gray-300">
                        From complex to creative - craft comics that make
                        learning fun, visual, and unforgettable.
                      </p>
                    </div>
                  </SpotlightCard>
                </Link>
                <Link href={"/rhymes"} className="w-[25vw]">
                  <SpotlightCard
                    className="bg-blue-500/10 w-full border-2 border-blue-400 p-10 backdrop-blur-sm"
                    spotlightColor="rgba(96, 165, 250, 0.3)"
                  >
                    <div className="flex flex-col justify-center gap-4">
                      <LuAudioLines className="text-5xl text-white" />
                      <p className="text-white text-4xl font-bold">Audio</p>
                      <p className="text-xl font-medium  text-gray-300">
                        Turn tough answers into catchy rhymes - memorize
                        smarter, retain longer and ace every chapter
                      </p>
                    </div>
                  </SpotlightCard>
                </Link>
                <Link href={"/storynarrator"} className="w-[25vw]">
                  <SpotlightCard
                    className="bg-yellow-500/10 w-full border-2 border-yellow-400 p-10 backdrop-blur-sm"
                    spotlightColor="rgba(250, 204, 21, 0.3)"
                  >
                    <div className="flex flex-col justify-center gap-4">
                      <RiSpeakAiLine className="text-5xl text-white" />
                      <p className="text-white text-4xl font-bold">Narration</p>
                      <p className="text-xl font-medium  text-gray-300">
                        From classic tales to modern adventures - let AI narrate
                      </p>
                    </div>
                  </SpotlightCard>
                </Link>
              </div>
            </div>
          )}
          {selected === "evaluate" && (
            <div className="flex flex-col gap-10">
              <p className="text-white text-5xl font-bold">
                How do you want to evaluate?
              </p>
              <div className="flex gap-8">
                <Link href={"/assessments/dashboard"} className="w-[50vw]">
                  <SpotlightCard
                    className="bg-yellow-500/10 w-full border-2 border-yellow-400 p-10 backdrop-blur-sm"
                    spotlightColor="rgba(250, 204, 21, 0.3)"
                  >
                    <div className="flex flex-col justify-center gap-4">
                      <MdOutlineChecklistRtl className="text-5xl text-white" />
                      <p className="text-white text-4xl font-bold">
                        Assessment
                      </p>
                      <p className="text-xl font-medium  text-gray-300">
                        Transform PDFs into powerful assessments - test your
                        knowledge, track progress, and get instant feedback.
                      </p>
                    </div>
                  </SpotlightCard>
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default page;
