import { FileIcon, CheckIcon } from "lucide-react";

interface FileCardProps {
  file: FileInfo;
  isSelected: boolean;
  onToggleSelect: (file: FileInfo) => void;
}

export function DocumentBox({
  file,
  isSelected,
  onToggleSelect,
}: FileCardProps) {
  if (!file) {
    return null;
  }

  return (
    <div
      onClick={() => onToggleSelect(file)}
      className={`relative cursor-pointer border rounded-lg p-3 transition-all ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary ring-opacity-50"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium truncate" title={file.name}>
            {file.name}
          </p>
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
            <CheckIcon className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
}
