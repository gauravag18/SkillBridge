"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Upload, ArrowRight, Loader2, ShieldCheck, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ---------------- Navbar (same as landing) ---------------- */

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-slate-900">
            SkillBridge
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-slate-700 hover:text-[#3d52a0] font-medium text-sm">
            Features
          </Link>
          <Link href="/#process" className="text-slate-700 hover:text-[#3d52a0] font-medium text-sm">
            How It Works
          </Link>
          <Link href="/#testimonials" className="text-slate-700 hover:text-[#3d52a0] font-medium text-sm">
            Testimonials
          </Link>
        </nav>

        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-[#3d52a0]">
          Exit
        </Link>
      </div>
    </header>
  );
}

/* ---------------- Skill Suggestions ---------------- */

const skillSuggestions = [
  "React","Next.js","Node.js","TypeScript","Java","Python",
  "DSA","System Design","SQL","AWS","Docker","Git","AI/ML"
];

export default function OnboardPage() {

  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------- Dropzone ---------- */

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file?.type === "application/pdf") {
      setResumeFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) setSkills([...skills, skill]);
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const startAnalysis = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2500));
    window.location.href = "/dashboard";
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Create Your Career Profile
          </h1>
          <p className="text-slate-700 mt-2 text-base">
            Provide your academic details and upload your resume. Our AI will analyze your profile and generate a personalized skill roadmap.
          </p>
        </div>

        {/* 2 Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* LEFT COLUMN — DETAILS */}
<div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-8">

  {/* Basic Info */}
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-slate-900">
      Basic Information
    </h2>

    {/* Full Name */}
    <div className="space-y-2">
      <Label className="text-slate-800 font-medium">Full Name</Label>
      <Input
        type="text"
        placeholder="e.g. Gaurav Agarwalla"
      />
    </div>

    {/* Target Role */}
    <div className="space-y-2">
      <Label className="text-slate-800 font-medium">Target Role</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select the role you are preparing for" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="frontend">Frontend Developer</SelectItem>
          <SelectItem value="backend">Backend Developer</SelectItem>
          <SelectItem value="fullstack">Full Stack Developer</SelectItem>
          <SelectItem value="data">Data Scientist</SelectItem>
          <SelectItem value="ml">ML Engineer</SelectItem>
          <SelectItem value="software">Software Engineer (General)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Academic Info */}
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-slate-900">
      Academic Details
    </h2>

    {/* Two Column Row */}
    <div className="grid grid-cols-2 gap-5">

      {/* Year in College */}
      <div className="space-y-2">
        <Label className="text-slate-800 font-medium">Year in College</Label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
            <SelectItem value="passed">Passed Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CGPA */}
      <div className="space-y-2">
        <Label className="text-slate-800 font-medium">CGPA</Label>
        <Input
          type="number"
          placeholder="8.4"
          value={cgpa}
          onChange={(e) => setCgpa(e.target.value)}
        />
      </div>

    </div>
  </div>

  {/* Skills */}
  <div className="space-y-5">
    <h2 className="text-lg font-semibold text-slate-900">
      Technical Skills
    </h2>

    {/* Selected skills */}
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge
          key={skill}
          className="bg-[#e3ecff] text-[#2f417f] cursor-pointer"
          onClick={() => removeSkill(skill)}
        >
          {skill} ×
        </Badge>
      ))}
    </div>

    {/* Suggestions */}
    <div className="flex flex-wrap gap-2">
      {skillSuggestions.map((s) => (
        <Badge
          key={s}
          variant="outline"
          className="cursor-pointer hover:bg-[#eef3ff]"
          onClick={() => addSkill(s)}
        >
          + {s}
        </Badge>
      ))}
    </div>
  </div>

</div>


          {/* RIGHT COLUMN — RESUME */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              Upload Resume
            </h2>

            {/* Upload Box */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                isDragActive
                  ? "border-[#3d52a0] bg-[#eef2ff]"
                  : "border-slate-300 hover:border-[#3d52a0] hover:bg-[#f7f9ff]"
              )}
            >
              <input {...getInputProps()} />

              <Upload className="mx-auto h-12 w-12 text-slate-500 mb-4" />

              {resumeFile ? (
                <>
                  <p className="font-semibold text-slate-900">
                    {resumeFile.name}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • PDF
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-800 font-medium">
                    Drag & drop your resume here
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    or click to browse (PDF only)
                  </p>
                </>
              )}
            </div>

            {/* Trust */}
            <div className="flex items-center gap-2 text-sm text-slate-700 mt-4">
              <ShieldCheck className="h-4 w-4 text-green-600"/>
              Your resume is encrypted and never shared.
            </div>

            {/* CTA */}
            <Button
              onClick={startAnalysis}
              disabled={!resumeFile || loading}
              className="w-full mt-6 bg-[#3d52a0] hover:bg-[#2f417f] h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  Analyze My Resume
                  <ArrowRight className="ml-2 h-5 w-5"/>
                </>
              )}
            </Button>

            <p className="text-xs text-slate-600 text-center mt-3">
              Takes ~10 seconds. No signup required.
            </p>

          </div>

        </div>
      </main>
    </div>
  );
}
