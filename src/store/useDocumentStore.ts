import { create } from "zustand";

type DocumentStore = {
  selectedDocuments: string[];
  setSelectedDocuments: (documents: string[]) => void;
};

export const useDocumentStore = create<DocumentStore>((set) => ({
  selectedDocuments: [],
  setSelectedDocuments: (documents) => set({ selectedDocuments: documents }),
}));
