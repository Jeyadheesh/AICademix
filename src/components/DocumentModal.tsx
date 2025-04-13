"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useDocumentStore } from "@/store/useDocumentStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileIcon } from "lucide-react";
import { MultipleFileSelector } from "./MultiFileSelector";
import axios from "axios";
import DocumentSelector from "./DocumentSelector";
import { DialogDescription } from "@radix-ui/react-dialog";

export function DocumentModal() {
  const { uploadedfiles, setUploadedFiles } = useDocumentStore();
  const [isOpen, setIsOpen] = useState(false);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FileIcon className="h-4 w-4" />
          Manage Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-black text-white">
        <DialogHeader>
          <DialogTitle>Document Manager</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div>
          <DocumentSelector />
        </div>

        {uploadedfiles.length > 0 && (
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <div className="flex-1 flex justify-start">
              <label htmlFor="file-upload-footer" className="cursor-pointer">
                <MultipleFileSelector onUpload={handleUpload} />
              </label>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
