"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        initial={false}
        animate={{
          boxShadow: isDragActive
            ? "0 0 0 4px rgba(255,107,53,0.25), 0 20px 50px rgba(255,107,53,0.25)"
            : "0 8px 24px rgba(255,107,53,0.10)",
        }}
        transition={{ duration: 0.25 }}
        className="upload-zone group relative block w-full cursor-pointer overflow-hidden p-8"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) =>
            handleFileChange(Array.from(e.target.files || []))
          }
          className="hidden"
        />

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center text-center">

          <motion.p
            className="font-semibold text-[#ff6b35] text-lg"
            animate={{ y: isDragActive ? -2 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Upload your resume
          </motion.p>

          <p className="text-sm text-slate-500 mt-1">
            Drag & drop or click to browse
          </p>

          {/* Floating Upload Tile */}
          <motion.div
            animate={{
              y: isDragActive ? 0 : [0, -6, 0],
              scale: isDragActive ? 1.1 : 1,
            }}
            transition={{
              y: {
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              scale: { duration: 0.2 },
            }}
            className="upload-icon-tile relative mt-6 flex h-28 w-28 items-center justify-center shadow-lg"
          >
            {isDragActive ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#ff6b35] text-sm font-medium"
              >
                Drop your resume
              </motion.p>
            ) : (
              <IconUpload className="h-8 w-8 text-[#ff6b35]" />
            )}
          </motion.div>
        </div>

        {/* File Preview */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 space-y-3"
            >
              {files.map((file, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="upload-card flex items-center justify-between gap-4 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {file.name}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="upload-meta">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <span>
                        {new Date(file.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="text-[#ff6b35] font-semibold text-sm"
                  >
                    ✓ Ready
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};