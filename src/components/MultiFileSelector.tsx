"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
          {isUploading ? "Uploading..." : "+ Upload Files"}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="*/*"
        />
        {/* {selectedFiles.length > 0 && (
          <Button onClick={handleClearFiles} variant="outline" size="icon">
            <X className="h-4 w-4" />
          </Button>
        )} */}
      </div>
      {/* {selectedFiles.length > 0 && (
        <div className="bg-muted p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Selected Files:</h3>
          <ul className="text-sm space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="truncate">{file.name}</span>
                <span className="text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
}
