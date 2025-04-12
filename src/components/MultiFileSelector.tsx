"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, X, Loader } from "lucide-react";

interface MultipleFileSelectorProps {
  onUpload: (files: File[]) => Promise<void>;
}

export function MultipleFileSelector({ onUpload }: MultipleFileSelectorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      setIsUploading(true);
      try {
        await onUpload(filesArray);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="default"
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="flex items-center space-x-2">
              <Loader className="mr-2 h-4 w-4" />
              <p>Uploading...</p>
            </span>
          ) : (
            <div>
              <span className="flex items-center space-x-2">
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Files
              </span>
            </div>
          )}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="*/*"
        />
      </div>
    </div>
  );
}
