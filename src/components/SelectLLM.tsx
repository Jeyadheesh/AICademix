import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  handleSelectChange: (value: llmModel) => void;
}

export default function LLMSelect({ handleSelectChange }: Props) {
  return (
    <Select defaultValue="hugging-face" onValueChange={handleSelectChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a LLM Model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="hugging-face">Hugging Face</SelectItem>
          <SelectItem value="dalle">Dalle</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
