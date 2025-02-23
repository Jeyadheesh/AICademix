"use client";

import React, { useEffect, useState } from "react";
import { MultipleFileSelector } from "@/components/MultiFileSelector";
import axios from "axios";
import DocumentBox from "@/components/DocumentBox";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/store/useDocumentStore";
import { Input } from "@/components/ui/input";

export default function UploadPage() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { selectedDocuments, setSelectedDocuments } = useDocumentStore();
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<string | null>(null);

  useEffect(() => {
    const savedSelectedDocuments = localStorage.getItem("selectedDocuments");
    if (savedSelectedDocuments) {
      setSelectedDocuments(JSON.parse(savedSelectedDocuments));
    }
  }, [setSelectedDocuments]);

  const handleDone = () => {
    localStorage.setItem(
      "selectedDocuments",
      JSON.stringify(selectedDocuments)
    );
    setIsEditing(false);
  };

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post("/api/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response:", response);
      const result = await response.data;
      console.log("Upload successful:", result);
      fetchData();
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post(`/api/chat`, {
        query,
        filenames: selectedDocuments,
      });
      console.log("Response:", response);
      const result = await response.data;
      setQueryResult(result);
      console.log("Search result:", result);
    } catch (error) {
      console.error("Error searching documents:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/documents");
      console.log("Response:", response);

      const result = await response.data;
      setDocuments(result.filenames);
      console.log("Documents fetched:", result);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDocumentClick = (document: string) => {
    if (isEditing) {
      if (selectedDocuments.includes(document)) {
        setSelectedDocuments(
          selectedDocuments.filter((doc) => doc !== document)
        );
      } else {
        setSelectedDocuments([...selectedDocuments, document]);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <div className="flex justify-end">
        <div className="flex gap-3">
          {isEditing ? (
            <Button
              onClick={handleDone} // Use handleDone to save and exit edit mode
            >
              Done
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          )}
          <MultipleFileSelector onUpload={handleUpload} />
        </div>
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        {documents.map((document) => (
          <DocumentBox
            key={document}
            name={document}
            selected={selectedDocuments.includes(document)}
            onClick={() => handleDocumentClick(document)}
          />
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <Input
          className="w-3/4"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search documents"
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} variant="default">
          Search
        </Button>
      </div>

      {queryResult && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Search Results</h2>
          <pre>{JSON.stringify(queryResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
