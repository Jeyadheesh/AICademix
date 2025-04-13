"use client";

import GlitchText from "@/components/GlitchText";
import Hyperspeed from "@/components/Hyperspeed";
import RotatingText from "@/components/RotatingText";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen text-white w-full flex flex-col items-center justify-center bg-black  overflow-hidden ">
      <Hyperspeed
        effectOptions={{
          onSpeedUp: () => {},
          onSlowDown: () => {},
          distortion: "turbulentDistortion",
          length: 400,
          roadWidth: 9,
          islandWidth: 2,
          lanesPerRoad: 3,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 50,
          lightPairsPerRoadWay: 50,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.05, 400 * 0.15],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.2, 0.2],
          carFloorSeparation: [0.05, 1],
          colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0x131318,
            brokenLines: 0x131318,
            leftCars: [0xdc5b20, 0xdca320, 0xdc2020],
            rightCars: [0x334bf7, 0xe5e6ed, 0xbfc6f3],
            sticks: 0xc5e8eb,
          },
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center  rounded-lg ">
          <GlitchText
            speed={1.5}
            enableShadows={true}
            className="custom-class whitespace-nowrap"
          >
            AI cademix
          </GlitchText>
          <div className="flex gap-2 items-center justify-center">
            <p className="text-white text-4xl font-bold">Creative</p>
            <RotatingText
              texts={["Learning", "Rhymes", "Memorization", "Retention"]}
              mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
              className="text-white bg-[#dca320]/20 border-2 border-[#dca320] p-3 rounded-lg py-1 font-bold text-4xl"
            />
          </div>
          <Link
            href="/dashboard"
            className="border-2 border-gray-300 bg-gray-300/40 hover:bg-gray-300/60 z-30 text-black px-8 py-2 rounded-lg font-semibold text-xl mt-8"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
