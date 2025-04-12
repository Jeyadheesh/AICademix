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

const vectorStore = new QdrantVectorStore(embeddings, {
  client: qdrant,
  collectionName,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Process each file
    const allSplits = [];
    for (const file of files) {
      // Convert the file to an array buffer
      const arrayBuffer = await file.arrayBuffer();
      // Convert the array buffer to a blob
      const blob = new Blob([arrayBuffer]);

      // Load the file into a loader
      const loader = new PDFLoader(blob);

      // Load the file into a document
      const docs = await loader.load();

      // Define the splitter
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      // Split the document into chunks
      const splits = await splitter.splitDocuments(docs);

      // Add metadata (filename) to each chunk
      const splitsWithMetadata = splits.map((split) => ({
        ...split,
        metadata: { ...split.metadata, filename: file.name },
      }));

      console.log(`Split ${file.name} into ${splits.length} sub-documents.`);
      allSplits.push(...splitsWithMetadata);
    }

    // Add all chunks to the vector store with metadata
    await vectorStore.addDocuments(allSplits);

    return NextResponse.json({ message: "PDFs loaded successfully" });
  } catch (error) {
    console.error("Error processing PDFs:", error);
    return NextResponse.json(
      { message: "Error processing PDF files", error: error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if the collection exists
    let collectionInfo;
    try {
      collectionInfo = await qdrant.getCollection(collectionName);
    } catch (error) {
      if (error.status === 404) {
        console.log("Collection does not exist. Creating it...");
        await qdrant.createCollection(collectionName, {
          vectors: {
            size: 768, // Adjust based on your embeddings model (e.g., 768 for text-embedding-004)
            distance: "Cosine", // Or "Euclidean" or "Dot"
          },
        });
        console.log("Collection created successfully.");
        collectionInfo = await qdrant.getCollection(collectionName);
      } else {
        throw error;
      }
    }

    const response = await qdrant.scroll(collectionName, {
      limit: 10000, // Adjust the limit based on your dataset size
      with_payload: true, // Include metadata in the response
    });

    // Extract unique filenames from the metadata
    const filenames = new Set<string>(); // Store only filename strings

    for (const point of response.points) {
      if (
        point.payload &&
        point.payload.metadata &&
        (point.payload.metadata as { filename: string }).filename
      ) {
        filenames.add(
          (point.payload.metadata as { filename: string }).filename
        );
      }
    }

    // Convert the Set to an array of objects
    const uniqueFilenames = Array.from(filenames).map((name) => ({ name }));

    // Return the list of unique filenames
    return NextResponse.json({ filenames: uniqueFilenames });
  } catch (error) {
    console.error("Error retrieving vectorized documents:", error);
    return NextResponse.json(
      { message: "Error retrieving vectorized documents", error: error },
      { status: 500 }
    );
  }
}
