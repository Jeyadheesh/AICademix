import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getFileContext(query: string, selectedFiles: FileInfo[]) {
  try {
    const response = await axios.post("/api/chat", {
      query,
      filenames: selectedFiles.map((file) => file.name),
    });

    const context = response.data.context;
    if (!context || context.trim() === "") {
      console.error("No relevant information found in the uploaded documents.");
      return null;
    }
    return context;
  } catch (error) {
    console.error("Error fetching context:", error);
    return null;
  }
}
