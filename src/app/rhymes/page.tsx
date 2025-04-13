"use client";

import axios from "axios";
import { BiChevronLeft } from "react-icons/bi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect, Suspense } from "react";
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
import RhymesGenerator from "@/components/RhymGenerator";

type Rhymes = {
  id?: string;
  title: string;
  audio_url: string;
  lyric: string;
};

const RhymesGeneratorPage = () => {
  return (
    <Suspense>
      <RhymesGenerator />
    </Suspense>
  );
};

export default RhymesGeneratorPage;
