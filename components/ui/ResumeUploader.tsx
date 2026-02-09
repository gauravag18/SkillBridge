"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { FileText, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-5">

      {/* Upload Area */}
      <div className="w-full border border-slate-200 rounded-xl bg-linear-to-b from-[#d0d9ed] to-[#879ff4] shadow-sm overflow-hidden">
        <FileUpload onChange={handleFileUpload} />
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="flex items-center gap-3 bg-[#eef3ff] border border-[#d6e0ff] rounded-lg p-4">
          <FileText className="h-6 w-6 text-[#3d52a0]" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900">
              {files[0].name}
            </p>
            <p className="text-sm text-slate-600">
              {(files[0].size / 1024 / 1024).toFixed(2)} MB • PDF Ready
            </p>
          </div>
          <CheckCircle2 className="text-green-600" />
        </div>
      )}
    </div>
  );
}
