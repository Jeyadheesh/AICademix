import { NextResponse, NextRequest } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({ url: "http://localhost:6333" });
const collectionName = "ai-vita-documents";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  modelName: "text-embedding-004",
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  client: qdrant,
  collectionName,
});

export async function POST(request: NextRequest) {
  try {
    const { filenames, query } = await request.json();

    if (!filenames) {
      return NextResponse.json(
        { error: "No filenames provided in query parameters" },
        { status: 400 }
      );
    }

    // Query the vector store with a filter for the filenames
    const results = await vectorStore.similaritySearch(query, 1, {
      must: [
        {
          key: "metadata.filename", // Filter by the filename in metadata
          match: {
            any: filenames, // Match any of the provided filenames
          },
        },
      ],
    });
    const context = results.map((doc) => doc.pageContent).join("\n");

    // Return the matched documents
    return NextResponse.json({ context });
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return NextResponse.json(
      { message: "Error retrieving documents", error: error },
      { status: 500 }
    );
  }
}