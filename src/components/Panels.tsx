import React, { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { FaGear } from "react-icons/fa6";

type Props = {
  images: { image: Blob | string | undefined; text: string }[];
  isGenerating: boolean;
};

const Loading = () => {
  return (
    <div className=" inset-0 text-black backdrop-blur-sm flex items-center justify-center">
      <div className="flex items-center flex-col  text-2xl">
        <FaGear className="animate-spin" />
        <p>Generating...</p>
      </div>
       
    </div>
  );
};

const Panels = ({ images, isGenerating }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const panelsPerPage = 4;
  const totalPages = Math.ceil(images.length / panelsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  console.log(images);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Panels Container */}
      <div className="w-1/2 border border-gray-500 shadow-xl p-4">
        <div className="grid gap-2 grid-cols-2">
          {images
            .slice(
              currentPage * panelsPerPage,
              (currentPage + 1) * panelsPerPage
            )
            .map((item, index) => (
              <div key={index} className="border-2 relative border-black">
                <div className="h-[450px] w-full bg-gray-200">
                  {item.image ? (
                    <Image
                      width={100}
                      height={100}
                      alt="Comic Image"
                      className="w-full h-full object-cover"
                      src={item.image as string}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex justify-center items-center">
                      {isGenerating ? <Loading /> : null}
                    </div>
                  )}
                </div>
                {item.text && (
                  <textarea
                    onChange={(e) => console.log(e.target.value)}
                    className="w-[95%] p-1 resize-none rounded-md border text-black border-black left-1/2 -translate-x-1/2 h-auto absolute bottom-3"
                    value={item.text}
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between w-1/2 mt-4">
        <Button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-lg shadow-md ${
            currentPage === 0 ? "cursor-not-allowed" : ""
          }`}
        >
          Previous
        </Button>
        <Button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded-lg shadow-md ${
            currentPage === totalPages - 1 ? "cursor-not-allowed" : ""
          }`}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Panels;
