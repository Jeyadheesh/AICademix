import { DocumentModal } from "@/components/DocumentModal";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <div>Home</div>
      <DocumentModal />
    </div>
  );
}
