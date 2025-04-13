import { NextResponse, NextRequest } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function POST(request: NextRequest) {
  try {
    const qdrant = new QdrantClient({ url: "http://localhost:6333" });

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      modelName: "text-embedding-004",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        client: qdrant,
        collectionName: "ai-vita-documents",
      }
    );

    const { filenames, query } = await request.json();

    if (!filenames) {
      return NextResponse.json(
        { error: "No filenames provided in query parameters" },
        { status: 400 }
      );
    }

    const results = await vectorStore.similaritySearch(query, 1, {
      must: [
        {
          key: "metadata.filename",
          match: { any: filenames },
        },
      ],
    });

    const context = results.map((doc) => doc.pageContent).join("\n");
    return NextResponse.json({ context });
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return NextResponse.json(
      { message: "Error retrieving documents", error: String(error) },
      { status: 500 }
    );
  }
}
