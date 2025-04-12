"use client";

import DocumentSelector from "@/components/DocumentSelector";
import { MultipleFileSelector } from "@/components/MultiFileSelector";
import { useDocumentStore } from "@/store/useDocumentStore";
import axios from "axios";
import { useEffect } from "react";

export default function FileManagerDemo() {
  const { uploadedfiles, setUploadedFiles } = useDocumentStore();

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    const filenames = files.map((file) => ({ name: file.name }));
    try {
      const response = await axios.post("/api/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response:", response);
      const result = await response.data;
      console.log("Upload successful:", result);
      setUploadedFiles([...uploadedfiles, ...filenames]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Document Manager</h1>
          <MultipleFileSelector onUpload={handleUpload} />
        </div>

        <div className="">
          <h2 className="text-xl font-semibold mb-2">Uploaded Files</h2>
          <DocumentSelector selectorType="page" />
        </div>
      </div>
    </div>
  );
}
