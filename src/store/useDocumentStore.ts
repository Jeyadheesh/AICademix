"use client";

import { create } from "zustand";

interface DocumentStore {
  uploadedfiles: FileInfo[];
  selectedFiles: FileInfo[];

  addUploadedFiles: (newFiles: FileInfo[]) => void;
  toggleFileSelection: (fileName: FileInfo) => void;
  setUploadedFiles: (files: FileInfo[]) => void;
  setSelectedFiles: (fileIds: FileInfo[]) => void;
  getUploadedFiles: () => FileInfo[];
  getSelectedFiles: () => FileInfo[];
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  uploadedfiles: [],
  selectedFiles: [],

  addUploadedFiles: (newFiles) =>
    set((state) => ({
      uploadedfiles: [...state.uploadedfiles, ...newFiles],
    })),

  setSelectedFiles: (files) =>
    set({
      selectedFiles: files,
    }),

  setUploadedFiles: (files) =>
    set({
      uploadedfiles: files,
    }),

  toggleFileSelection: (file) => {
    if (get().selectedFiles.includes(file)) {
      set({
        selectedFiles: get().selectedFiles.filter((f) => f !== file),
      });
    } else {
      set({
        selectedFiles: [...get().selectedFiles, file],
      });
    }
  },

  getSelectedFiles: () => get().selectedFiles,
  getUploadedFiles: () => get().uploadedfiles,
}));
