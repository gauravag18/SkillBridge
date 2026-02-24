"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { CheckCircle2 } from "lucide-react";

interface Props {
  onFileSelect: (file: File | null) => void;
}

export default function ResumeUploader({ onFileSelect }: Props) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (incoming: File[]) => {
    setFiles(incoming);
    onFileSelect(incoming[0] ?? null);
  };

  return (
    <div className="space-y-3">
      <FileUpload onChange={handleFileUpload} />

      {files.length > 0 && (
        <div className="flex items-center gap-3 bg-[#fff3ed] border border-[#ff6b35] rounded-lg p-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm font-medium text-slate-800 truncate">
            Resume uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
}