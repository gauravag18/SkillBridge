"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ResumeUploader from "@/components/ui/ResumeUploader";
import { ArrowRight, Loader2, CheckCircle2, FileText, Target, Github, ChevronRight, Brain, Calendar } from "lucide-react";
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
    skills: ["C++", "Java", "Python", "JavaScript", "TypeScript"],
  },
  "Frontend": {
    icon: "◻",
    color: "violet",
    skills: ["HTML", "CSS", "Tailwind CSS", "React", "Next.js", "Redux"],
  },
  "Backend": {
    icon: "⬡",
    color: "green",
    skills: ["Node.js", "Express.js", "Spring Boot", "Django", "Flask"],
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
    skills: ["DSA", "OOPs", "Operating Systems", "DBMS", "System Design"],
  },
  "AI / Data": {
    icon: "◉",
    color: "purple",
    skills: ["Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch"],
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
    <header className="clean-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 hover:text-brand transition-colors">
          SkillBridge
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg transition-all hover:shadow-lg text-xs">
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}

function StepCard({
  number,
  title,
  icon: Icon,
  children,
}: {
  number: string;
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="clean-card overflow-hidden">
      <div className="h-px bg-linear-to-r from-[#ff6b35]/30 via-transparent to-transparent" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#ff6b35] flex items-center justify-center text-white text-[10px] font-black shrink-0">
              {number}
            </div>
            <div className="h-px w-4 bg-slate-200" />
          </div>
          <div className="h-8 w-8 rounded-xl bg-[#fff3ed] flex items-center justify-center shrink-0">
            <Icon className="text-[#ff6b35]" size={16} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Step {number}</p>
            <h2 className="text-base font-bold text-slate-900 leading-tight">{title}</h2>
          </div>
        </div>
        {children}
      </div>
    </section>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!uuid) { setErrorMsg("Session error – please refresh"); setLoading(false); return; }

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

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium">Create Profile</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-full text-[10px] font-bold text-[#ff6b35] uppercase tracking-wide mb-3">
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-blue-900">Create Your Career Profile</h1>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            Fill in your details and upload your resume. Our AI will analyze your readiness and create a personalized 30-day roadmap.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

            {/* LEFT: Main form column */}
            <div className="space-y-5">

              {/* Step 1 — Basic Information */}
              <StepCard number="1" title="Basic Information" icon={Target}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name</Label>
                    <Input
                      placeholder="e.g. Gaurav Agarwalla"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35] text-sm h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Target Role</Label>
                    <Select value={targetRole} onValueChange={setTargetRole}>
                      <SelectTrigger className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35] h-10 rounded-xl text-sm">
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
                        className="mt-2 border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35] text-sm h-10 rounded-xl"
                      />
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                      <Github size={12} /> GitHub Username
                      <span className="text-slate-400 text-[10px] font-normal normal-case tracking-normal">(Optional but recommended)</span>
                    </Label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-xs font-semibold">
                        github.com/
                      </div>
                      <Input
                        placeholder="your-username"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value.toLowerCase().trim())}
                        className="rounded-l-none border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35] text-sm h-10"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Our AI analyzes your repositories, contributions, stars, and tech stack to give role-specific improvement tips.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Year in College</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35] h-10 rounded-xl text-sm">
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
                    {year === "passed" && (
                      <Input
                        placeholder="Years of experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="mt-2 border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35] text-sm h-10 rounded-xl"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">CGPA</Label>
                    <Input
                      placeholder="8.4"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35] text-sm h-10 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Job Description
                        <span className="ml-2 text-[10px] text-slate-400 font-normal normal-case tracking-normal">optional</span>
                      </Label>
                      <span className={`text-[10px] font-semibold tabular-nums ${
                        jobDescription.length >= JD_LIMIT - 50 ? "text-red-500" : "text-slate-400"
                      }`}>
                        {jobDescription.length} / {JD_LIMIT}
                      </span>
                    </div>
                    <textarea
                      placeholder="Paste the job description here to get a more targeted analysis..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value.slice(0, JD_LIMIT))}
                      rows={4}
                      maxLength={JD_LIMIT}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35] resize-none text-slate-800 placeholder:text-slate-400 bg-white"
                    />
                    <p className="text-[11px] text-slate-400">
                      Adding a JD gives you a score matched to that specific role.
                    </p>
                  </div>
                </div>
              </StepCard>

              {/* Step 2 — Technical Skills */}
              <StepCard number="2" title="Technical Skills" icon={FileText}>
                {/* Selected skills summary */}
                {skills.length > 0 && (
                  <div className="mb-6 p-4 bg-[#fffaf7] rounded-xl border border-[#ff6b35]/20">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Selected Skills</p>
                      <span className="text-[10px] font-bold text-[#ff6b35] bg-[#fff3ed] px-2 py-0.5 rounded-full">
                        {skills.length} added
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ff6b35] text-white text-xs font-semibold rounded-lg hover:bg-[#e55a28] transition-colors"
                        >
                          {skill}
                          <span className="opacity-70 ml-0.5">×</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category grid */}
                <div className="space-y-1">
                  {Object.entries(skillCategories).map(([category, { icon, color, skills: list }]) => {
                    const colors = categoryColors[color];
                    const selectedInCategory = list.filter((s) => skills.includes(s)).length;
                    return (
                      <div
                        key={category}
                        className="rounded-xl border border-slate-100 overflow-hidden"
                      >
                        {/* Category header */}
                        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-mono font-bold ${colors.dot} text-white`}>
                            {icon}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{category}</span>
                          {selectedInCategory > 0 && (
                            <span className="ml-auto text-[10px] font-bold text-[#ff6b35] bg-[#fff3ed] px-1.5 py-0.5 rounded-full">
                              {selectedInCategory} selected
                            </span>
                          )}
                        </div>

                        {/* Skill pills */}
                        <div className="flex flex-wrap gap-1.5 p-3 bg-white">
                          {list.map((skill) => {
                            const isSelected = skills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer",
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
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Input
                    placeholder="Add custom skill (press Enter)"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35] text-sm h-10 rounded-xl"
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
                    className="bg-[#ff6b35] hover:bg-[#e55a28] h-10 px-5 rounded-xl font-bold text-sm"
                    disabled={!customSkill.trim()}
                  >
                    Add
                  </Button>
                </div>
              </StepCard>

              {/* Mobile Resume Upload */}
              <div className="lg:hidden clean-card border-2 border-[#ff6b35]/30 overflow-hidden shadow-lg">
                <div className="h-px bg-linear-to-r from-[#ff6b35] via-[#ff8a5c] to-transparent" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ff6b35] text-white rounded-full text-[10px] font-bold uppercase tracking-wide">
                      Step 3
                    </div>
                  </div>
                  <h2 className="text-base font-black text-slate-900 mb-1">Resume Analyzer</h2>
                  <p className="text-xs text-[#ff6b35] font-medium mb-5">
                    Upload your resume for AI-powered evaluation
                  </p>
                  <ResumeUploader onFileSelect={setResumeFile} />
                  <Button
                    type="submit"
                    disabled={loading || !resumeFile || !uuid}
                    className="w-full mt-5 bg-[#ff6b35] hover:bg-[#e55a28] text-white h-11 font-bold shadow-lg hover:shadow-xl transition-all rounded-xl text-sm"
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

                {/* Resume Upload */}
                <div className="clean-card border-2 border-[#ff6b35]/25 overflow-hidden shadow-lg">
                  <div className="h-0.5 bg-linear-to-r from-[#ff6b35] via-[#ff8a5c] to-transparent" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ff6b35] text-white rounded-full text-[10px] font-bold uppercase tracking-wide">
                        Step 3
                      </div>
                    </div>
                    <h2 className="text-base font-black text-slate-900 mb-0.5">Resume Analyzer</h2>
                    <p className="text-xs text-[#ff6b35] font-semibold mb-4">
                      Upload your resume for AI-powered evaluation
                    </p>

                    <ResumeUploader onFileSelect={setResumeFile} />

                    <Button
                      type="submit"
                      disabled={loading || !resumeFile || !uuid}
                      className="w-full mt-4 bg-[#ff6b35] hover:bg-[#e55a28] text-white h-11 font-bold shadow-lg hover:shadow-xl transition-all rounded-xl text-sm"
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

                {/* Report includes */}
                <div className="bg-[#1a1a1a] rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#ff6b35]" />
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your report will include</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      "Career readiness score",
                      "JD match percentage",
                      "GitHub profile analysis",
                      "Missing technical skills",
                      "Suggested job roles",
                      "Learning priority order",
                      "Personalized 30-day roadmap",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle2 size={13} className="text-[#ff6b35] shrink-0" />
                        <span className="text-xs text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Our AI analyzes 50+ data points + your GitHub profile to create your personalized career development plan
                    </p>
                  </div>
                </div>

                {/* What happens next */}
                <div className="clean-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#ff6b35]" />
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">What happens next?</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      ["1", "Skill Extraction", "We detect technologies, coursework and experience from your resume."],
                      ["2", "GitHub Analysis", "We scan your public repos and contributions for targeted tips."],
                      ["3", "Gap Detection & Roadmap", "You get a clear 30-day plan showing exactly what to study."],
                    ].map(([num, title, desc]) => (
                      <div key={num} className="flex gap-3">
                        <div className="h-7 w-7 rounded-full bg-[#fff3ed] text-[#ff6b35] flex items-center justify-center text-xs font-black shrink-0">
                          {num}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
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