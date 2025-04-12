import React, { useEffect } from "react";
import { DocumentBox } from "./DocumentBox";
import axios from "axios";
import { useDocumentStore } from "@/store/useDocumentStore";
import { MultipleFileSelector } from "./MultiFileSelector";
import { FileIcon } from "lucide-react";

type Props = {
  selectorType?: "dialog" | "page";
};

const DocumentSelector = ({ selectorType = "dialog" }: Props) => {
  const {
    uploadedfiles,
    selectedFiles,
    setUploadedFiles,
    toggleFileSelection,
  } = useDocumentStore();

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

  const selectedCount = selectedFiles.length;
  const totalCount = uploadedfiles.length;

  return (
    <div className="">
      <p className="text-muted-foreground mb-4">
        {totalCount > 0
          ? `Select files to use in your project. ${selectedCount} of ${totalCount} files selected.`
          : ""}
      </p>

      {uploadedfiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {uploadedfiles.map((file) => (
            <DocumentBox
              key={file.name}
              file={file}
              isSelected={selectedFiles.includes(file)}
              onToggleSelect={toggleFileSelection}
            />
          ))}
        </div>
      ) : selectorType === "page" ? (
        <div className="text-muted-foreground border border-dashed rounded-md p-6 text-center">
          No uploaded files. Click the upload button to upload files.
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
          <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No files uploaded</h3>
          <p className="text-muted-foreground text-center mt-1 mb-4">
            Upload files to start managing your content
          </p>
          <label htmlFor="file-upload" className="cursor-pointer">
            <MultipleFileSelector onUpload={handleUpload} />
          </label>
        </div>
      )}
    </div>
  );
};

export default DocumentSelector;
