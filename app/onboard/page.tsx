"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ResumeUploader from "@/components/ui/ResumeUploader";
import { ArrowRight, Loader2, CheckCircle2, FileText, Target, Github, ChevronRight, Brain, Calendar, Sparkles, Upload, BookOpen } from "lucide-react";
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
import { onboardUser } from "@/app/actions/onboard";

const skillCategories = {
  "Programming Languages": {
    icon: "{ }",
    color: "blue",
    skills: ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Rust", "Go", "Kotlin", "Swift"],
  },
  "Frontend": {
    icon: "◻",
    color: "violet",
    skills: ["HTML", "CSS", "Tailwind CSS", "React", "Next.js", "Redux", "Context-API", "Frame-Motion"],
  },
  "Backend": {
    icon: "⬡",
    color: "green",
    skills: ["Node.js", "Express.js", "Spring Boot", "Django", "Flask", "FastAPI", "NestJS"],
  },
  "Database": {
    icon: "⊞",
    color: "amber",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Redis"],
  },
  "Tools & DevOps": {
    icon: "⚙",
    color: "slate",
    skills: ["Git", "GitHub", "Docker", "AWS", "Linux", "CI/CD"],
  },
  "Core CS": {
    icon: "◈",
    color: "rose",
    skills: ["DSA", "OOPs", "Operating Systems", "Computer Networks", "DBMS", "System Design"],
  },
  "AI / Data": {
    icon: "◉",
    color: "purple",
    skills: ["Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch", "Computer Vision"],
  },
};

const categoryColors: Record<string, { pill: string; active: string; dot: string }> = {
  blue:   { pill: "bg-blue-50 border-blue-100 text-blue-700",   active: "bg-blue-600 border-blue-600 text-white",   dot: "bg-blue-500" },
  violet: { pill: "bg-violet-50 border-violet-100 text-violet-700", active: "bg-violet-600 border-violet-600 text-white", dot: "bg-violet-500" },
  green:  { pill: "bg-emerald-50 border-emerald-100 text-emerald-700", active: "bg-emerald-600 border-emerald-600 text-white", dot: "bg-emerald-500" },
  amber:  { pill: "bg-amber-50 border-amber-100 text-amber-700", active: "bg-amber-600 border-amber-600 text-white",  dot: "bg-amber-500" },
  slate:  { pill: "bg-slate-50 border-slate-200 text-slate-600", active: "bg-slate-700 border-slate-700 text-white",  dot: "bg-slate-500" },
  rose:   { pill: "bg-rose-50 border-rose-100 text-rose-700",   active: "bg-rose-600 border-rose-600 text-white",   dot: "bg-rose-500" },
  purple: { pill: "bg-purple-50 border-purple-100 text-purple-700", active: "bg-purple-600 border-purple-600 text-white", dot: "bg-purple-500" },
};

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        
        {/* LEFT */}
        <Link
          href="/"
          className="font-bold text-lg tracking-tight text-slate-900 hover:text-[#ff6b35] transition-colors"
        >
          SkillBridge
        </Link>

        {/* RIGHT → HOME */}
        <Link
          href="/"
          className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg transition-all hover:shadow-lg text-xs"
        >
          Home
        </Link>

      </div>
    </header>
  );
}

function StepCard({
  number,
  title,
  description,
  icon: Icon,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="clean-card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#EA580C]/25 via-transparent to-transparent" />
      <div className="p-7">
        <div className="flex items-center gap-4 mb-7">
          <div className="h-10 w-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center shrink-0">
            <Icon className="text-[#EA580C]" size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="text-[10px] font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full uppercase tracking-wider">Step {number}</span>
            </div>
            <h2 className="text-lg font-bold text-blue-900 leading-tight">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function FormField({ label, hint, required, children, full }: { label: string; hint?: string; required?: boolean; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("space-y-2", full && "sm:col-span-2")}>
      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
        {hint && <span className="text-[10px] text-slate-400 font-normal normal-case tracking-normal">({hint})</span>}
      </Label>
      {children}
    </div>
  );
}

export default function OnboardPage() {
  const [uuid, setUuid] = useState("");
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [year, setYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const JD_LIMIT = 1000;

  useEffect(() => {
    let storedUuid = localStorage.getItem("skillbridge_uuid");
    if (!storedUuid) {
      storedUuid = crypto.randomUUID();
      localStorage.setItem("skillbridge_uuid", storedUuid);
    }
    setUuid(storedUuid);
  }, []);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills((prev) => [...prev, trimmed]);
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) removeSkill(skill);
    else addSkill(skill);
  };

  const isFormValid = !!(fullName.trim() && targetRole && year && (year === "passed" ? experience.trim() : cgpa.trim()) && resumeFile && uuid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!uuid) { setErrorMsg("Session error – please refresh"); setLoading(false); return; }
    if (!fullName.trim()) { setErrorMsg("Full name is required"); setLoading(false); return; }
    if (!targetRole) { setErrorMsg("Please select a target role"); setLoading(false); return; }
    if (!year) { setErrorMsg("Please select your year in college"); setLoading(false); return; }
    if (year === "passed" && !experience.trim()) { setErrorMsg("Years of experience is required"); setLoading(false); return; }
    if (year !== "passed" && !cgpa.trim()) { setErrorMsg("CGPA is required"); setLoading(false); return; }

    let resumePath: string | undefined = undefined;

    if (resumeFile) {
      const uploadForm = new FormData();
      uploadForm.append("resume", resumeFile);
      uploadForm.append("uuid", uuid);
      try {
        const res = await fetch("/api/upload-resume", { method: "POST", body: uploadForm });
        const uploadResult = await res.json();
        if (!res.ok || !uploadResult.success) {
          setErrorMsg(uploadResult.error || "Resume upload failed");
          setLoading(false);
          return;
        }
        resumePath = uploadResult.path;
      } catch {
        setErrorMsg("Failed to upload resume");
        setLoading(false);
        return;
      }
    }

    if (!formRef.current) { setErrorMsg("Form reference missing – please try again"); setLoading(false); return; }

    const formData = new FormData();
    formData.append("uuid", uuid);
    formData.append("fullName", fullName);
    formData.append("targetRole", targetRole);
    formData.append("customRole", customRole);
    formData.append("githubUsername", githubUsername);
    formData.append("jobDescription", jobDescription);
    formData.append("year", year);
    formData.append("cgpa", cgpa);
    formData.append("experience", experience);
    formData.append("skills", JSON.stringify(skills));
    if (resumePath) formData.append("resume_path", resumePath);

    const result = await onboardUser({}, formData);
    setLoading(false);
    if (result?.error) setErrorMsg(result.error);
  };

  const completedSteps = [
    fullName.trim() && targetRole && year && (year === "passed" ? experience.trim() : cgpa.trim()),
    skills.length > 0,
    resumeFile,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-transparent">
      <style>{`
        [data-radix-popper-content-wrapper] > div,
        [role="listbox"] {
          background-color: white !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
      `}</style>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium">Create Profile</span>
        </div>

        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF7ED] border border-[#EA580C]/20 rounded-full text-[10px] font-bold text-[#EA580C] uppercase tracking-wide mb-4">
            AI-Powered Analysis
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-blue-900">Create Your Career Profile</h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed">
            Fill in your details and upload your resume. Our AI analyzes your readiness and creates a personalized 30-day roadmap.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_300px] gap-7 items-start">

            {/* LEFT: Main form column */}
            <div className="space-y-6">

              {/* Step 1 — Basic Information */}
              <StepCard number="1" title="Basic Information" description="Your profile details and target role" icon={Target}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField label="Full Name" required>
                    <Input
                      placeholder="e.g. Gaurav Agarwalla"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-slate-200 focus:border-[#EA580C] focus:ring-[#EA580C] text-sm h-11 rounded-xl bg-white"
                    />
                  </FormField>

                  <FormField label="Target Role" required>
                    <Select value={targetRole} onValueChange={setTargetRole}>
                      <SelectTrigger className="border-slate-200 focus:border-[#EA580C] focus:ring-[#EA580C] h-11 rounded-xl text-sm bg-white">
                        <SelectValue placeholder="Select target role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend Developer</SelectItem>
                        <SelectItem value="backend">Backend Developer</SelectItem>
                        <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                        <SelectItem value="software">Software Engineer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {targetRole === "other" && (
                      <Input
                        placeholder="Enter your role (DevOps, QA, etc)"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="mt-2 border-slate-200 focus:border-[#EA580C] focus:ring-[#EA580C] text-sm h-11 rounded-xl bg-white"
                      />
                    )}
                  </FormField>

                  <FormField label="GitHub Username" hint="recommended" full>
                    <div className="flex">
                      <div className="flex items-center px-3.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-xs font-semibold">
                        <Github size={13} className="mr-1.5 text-slate-400" />
                        github.com/
                      </div>
                      <Input
                        placeholder="your-username"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value.toLowerCase().trim())}
                        className="rounded-l-none border-slate-200 focus:border-[#EA580C] focus:ring-[#EA580C] text-sm h-11 bg-white"
                      />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      We analyze your repos, contributions, and tech stack for role-specific tips.
                    </p>
                  </FormField>

                  <FormField label="Year in College" required>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="border-slate-200 focus:border-[#EA580C] focus:ring-[#EA580C] h-11 rounded-xl text-sm bg-white">
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
                  </FormField>

                  <FormField label={year === "passed" ? "Years of Experience" : "CGPA"} required>
                    {year === "passed" ? (
                      <Input
                        placeholder="e.g. 2"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="border-slate-200 focus:border-[#EA580C] focus:ring-[#EA580C] text-sm h-11 rounded-xl bg-white"
                      />
                    ) : (
                      <Input
                        placeholder="8.4"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="border-slate-200 focus:border-[#EA580C] focus:ring-[#EA580C] text-sm h-11 rounded-xl bg-white"
                      />
                    )}
                  </FormField>

                  <FormField label="Job Description" hint="optional" full>
                    <div className="relative">
                      <textarea
                        placeholder="Paste the job description here to get a more targeted analysis..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value.slice(0, JD_LIMIT))}
                        rows={4}
                        maxLength={JD_LIMIT}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C] resize-none text-slate-800 placeholder:text-slate-400 bg-white"
                      />
                      <span className={`absolute bottom-3 right-3 text-[10px] font-semibold tabular-nums ${
                        jobDescription.length >= JD_LIMIT - 50 ? "text-red-500" : "text-slate-300"
                      }`}>
                        {jobDescription.length}/{JD_LIMIT}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Adding a JD gives you a match score tailored to that specific role.
                    </p>
                  </FormField>
                </div>
              </StepCard>

              {/* Step 2 — Technical Skills */}
              <StepCard number="2" title="Technical Skills" description="Select the technologies you know" icon={BookOpen}>
                {/* Selected skills summary */}
                {skills.length > 0 && (
                  <div className="mb-6 p-4 bg-[#FFF7ED] rounded-xl border border-[#EA580C]/15">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-600">Selected Skills</p>
                      <span className="text-[10px] font-bold text-[#EA580C] bg-white px-2.5 py-0.5 rounded-full border border-[#EA580C]/15">
                        {skills.length} added
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#EA580C] text-white text-xs font-semibold rounded-lg hover:bg-[#C2410C] transition-colors"
                        >
                          {skill}
                          <span className="opacity-70 ml-0.5">×</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category grid */}
                <div className="space-y-1.5">
                  {Object.entries(skillCategories).map(([category, { icon, color, skills: list }]) => {
                    const colors = categoryColors[color];
                    const selectedInCategory = list.filter((s) => skills.includes(s)).length;
                    return (
                      <div
                        key={category}
                        className="rounded-xl border border-slate-100 overflow-hidden"
                      >
                        {/* Category header */}
                        <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-mono font-bold ${colors.dot} text-white`}>
                            {icon}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{category}</span>
                          {selectedInCategory > 0 && (
                            <span className="ml-auto text-[10px] font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full">
                              {selectedInCategory} selected
                            </span>
                          )}
                        </div>

                        {/* Skill pills */}
                        <div className="flex flex-wrap gap-2 p-4 bg-white">
                          {list.map((skill) => {
                            const isSelected = skills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer",
                                  isSelected
                                    ? colors.active
                                    : colors.pill + " hover:opacity-80"
                                )}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom skill input */}
                <div className="flex gap-2 mt-5 pt-5 border-t border-slate-100">
                  <Input
                    placeholder="Add custom skill (press Enter)"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="border-slate-200 focus:border-[#EA580C] focus:ring-[#EA580C] text-sm h-11 rounded-xl bg-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customSkill.trim()) {
                        e.preventDefault();
                        toggleSkill(customSkill);
                        setCustomSkill("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (customSkill.trim()) { toggleSkill(customSkill); setCustomSkill(""); }
                    }}
                    className="bg-[#EA580C] hover:bg-[#C2410C] h-11 px-6 rounded-xl font-bold text-sm"
                    disabled={!customSkill.trim()}
                  >
                    Add
                  </Button>
                </div>
              </StepCard>

              {/* Mobile Resume Upload */}
              <div className="lg:hidden clean-card overflow-hidden border-2 border-[#EA580C]/20">
                <div className="h-1 bg-gradient-to-r from-[#EA580C] via-[#EA580C]/50 to-transparent" />
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
                      <Upload className="text-[#EA580C]" size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full uppercase tracking-wider">Step 3</span>
                      <h2 className="text-lg font-bold text-blue-900 mt-0.5">Upload Resume</h2>
                    </div>
                  </div>
                  <ResumeUploader onFileSelect={setResumeFile} />
                  <Button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="w-full mt-5 bg-[#EA580C] hover:bg-[#C2410C] text-white h-12 font-bold shadow-lg hover:shadow-xl transition-all rounded-xl text-sm"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing Resume...</>
                    ) : (
                      <>Analyze My Resume<ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                  {errorMsg && <p className="text-red-600 text-xs mt-3 text-center font-medium">{errorMsg}</p>}
                </div>
              </div>
            </div>

            {/* RIGHT: Sticky sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-20 flex flex-col gap-5">

                {/* Resume Upload — Primary CTA */}
                <div className="clean-card overflow-hidden border-2 border-[#EA580C]/20">
                  <div className="h-1 bg-gradient-to-r from-[#EA580C] via-[#EA580C]/50 to-transparent" />
                  <div className="p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="h-8 w-8 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
                        <Upload className="text-[#EA580C]" size={15} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full uppercase tracking-wider">Step 3</span>
                        <h2 className="text-sm font-bold text-blue-900 mt-0.5">Upload Resume</h2>
                      </div>
                    </div>

                    <ResumeUploader onFileSelect={setResumeFile} />

                    <Button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className="w-full mt-4 bg-[#EA580C] hover:bg-[#C2410C] text-white h-11 font-bold shadow-lg hover:shadow-xl transition-all rounded-xl text-sm"
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                      ) : (
                        <>Analyze My Resume<ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>

                    {errorMsg && <p className="text-red-600 text-xs mt-3 text-center font-medium">{errorMsg}</p>}
                  </div>
                </div>

                {/* Progress tracker */}
                <div className="clean-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-700">Progress</h3>
                    <span className="text-[10px] font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full">{completedSteps}/3 done</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-[#EA580C] rounded-full transition-all duration-500"
                      style={{ width: `${(completedSteps / 3) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Basic info & required fields", done: !!(fullName.trim() && targetRole && year && (year === "passed" ? experience.trim() : cgpa.trim())) },
                      { label: "Technical skills", done: skills.length > 0 },
                      { label: "Resume uploaded", done: !!resumeFile },
                    ].map(({ label, done }) => (
                      <div key={label} className="flex items-center gap-2.5">
                        <div className={cn(
                          "h-5 w-5 rounded-md flex items-center justify-center transition-colors",
                          done ? "bg-[#EA580C]" : "bg-slate-100"
                        )}>
                          <CheckCircle2 size={10} className={done ? "text-white" : "text-slate-300"} />
                        </div>
                        <span className={cn("text-xs font-medium", done ? "text-slate-700" : "text-slate-400")}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report includes */}
                <div className="clean-card p-5">
                  <h3 className="text-xs font-bold text-slate-700 mb-4">Your report includes</h3>
                  <ul className="space-y-2.5">
                    {[
                      "Career readiness score",
                      "JD match percentage",
                      "GitHub profile analysis",
                      "Missing technical skills",
                      "Suggested job roles",
                      "Personalized 30-day roadmap",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <ChevronRight size={12} className="text-[#EA580C] shrink-0" />
                        <span className="text-xs text-slate-500">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What happens next */}
                <div className="clean-card p-5">
                  <h3 className="text-xs font-bold text-slate-700 mb-4">What happens next?</h3>
                  <div className="space-y-4">
                    {[
                      ["1", "Skill Extraction", "We detect technologies, coursework and experience from your resume."],
                      ["2", "GitHub Analysis", "We scan your public repos and contributions for targeted tips."],
                      ["3", "Gap Detection", "You get a clear 30-day plan showing exactly what to study."],
                    ].map(([num, title, desc]) => (
                      <div key={num} className="flex gap-3">
                        <div className="h-7 w-7 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center text-xs font-black shrink-0">
                          {num}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}