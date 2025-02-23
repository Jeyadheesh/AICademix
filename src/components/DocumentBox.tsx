import React from "react";
import { PiFilePdfBold } from "react-icons/pi";

type Props = {
  name: string;
  selected: boolean;
  onClick: () => void;
};

const DocumentBox = ({ name, selected, onClick }: Props) => {
  return (
    <div
      key={name}
      className={`border-2 rounded p-4 cursor-pointer ${
        selected ? "border-blue-500 bg-blue-50" : "border-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <PiFilePdfBold className="w-8 h-8 text-red-500" />
        <div className="flex-1">
          <div className="font-bold">{name}</div>
        </div>
      </div>
    </div>
  );
};

export default DocumentBox;
