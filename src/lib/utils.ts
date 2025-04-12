import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getFileContext() {
  try {
    const response = await axios.post("/api/chat");
    const result = await response.data;
    return result.context;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return "";
  }
}
