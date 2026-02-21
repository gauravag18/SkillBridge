"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ResumeUploader from "@/components/ui/ResumeUploader";
import { ArrowRight, Loader2, CheckCircle2, FileText, Target, Zap } from "lucide-react";
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
  "Programming Languages": ["C++","Java","Python","JavaScript","TypeScript"],
  "Frontend": ["HTML","CSS","Tailwind CSS","React","Next.js","Redux"],
  "Backend": ["Node.js","Express.js","Spring Boot","Django","Flask"],
  "Database": ["MySQL","PostgreSQL","MongoDB","Firebase","Redis"],
  "Tools & DevOps": ["Git","GitHub","Docker","AWS","Linux","CI/CD"],
  "Core CS Subjects": ["DSA","OOPs","Operating Systems","DBMS","System Design"],
  "AI / Data": ["Machine Learning","Deep Learning","NLP","TensorFlow","PyTorch"],
  "Coding Platforms": ["LeetCode","Codeforces","CodeChef","HackerRank"],
};

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 h-15 flex items-center">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full flex items-center justify-between">

        <Link href="/" className="font-bold text-lg text-slate-900">
          SkillBridge
        </Link>

        <Link
          href="/"
          className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg hover:bg-[#e55a28] transition-all hover:shadow-lg text-xs"
        >
          Back
        </Link>

      </div>
    </header>
  );
}

export default function OnboardPage() {
  const [uuid, setUuid] = useState("");
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [year, setYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let storedUuid = localStorage.getItem("skillbridge_uuid");
    if (!storedUuid) {
      storedUuid = crypto.randomUUID();
      localStorage.setItem("skillbridge_uuid", storedUuid);
    }
    setUuid(storedUuid);
  }, []);

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) setSkills([...skills, skill]);
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!uuid) {
      setErrorMsg("Session error – please refresh");
      setLoading(false);
      return;
    }

    let resumePath: string | undefined = undefined;

    if (resumeFile) {
      const uploadForm = new FormData();
      uploadForm.append("resume", resumeFile);
      uploadForm.append("uuid", uuid);

      try {
        const res = await fetch("/api/upload-resume", {
          method: "POST",
          body: uploadForm,
        });

        const uploadResult = await res.json();

        if (!res.ok || !uploadResult.success) {
          setErrorMsg(uploadResult.error || "Resume upload failed");
          setLoading(false);
          return;
        }

        resumePath = uploadResult.path;
      } catch (err) {
        setErrorMsg("Failed to upload resume");
        setLoading(false);
        return;
      }
    }

    // Use form ref instead of e.currentTarget to avoid event target issues
    if (!formRef.current) {
      setErrorMsg("Form reference missing – please try again");
      setLoading(false);
      return;
    }

    const formData = new FormData(formRef.current);
    formData.append("uuid", uuid);
    if (resumePath) formData.append("resume_path", resumePath);

    const result = await onboardUser({}, formData);

    setLoading(false);

    if (result?.error) {
      setErrorMsg(result.error);
    }
    // redirect happens inside onboardUser action
  };

  return (
    <div className="min-h-screen bg-[#fffcfa]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        {/* Header Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-full text-xs font-medium text-[#ff6b35] mb-4">
            <Zap size={14} className="fill-current" />
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Create Your Career Profile
          </h1>
          <p className="text-slate-600 text-lg">
            Fill in your details and upload your resume. Our AI will analyze your readiness and create a personalized roadmap.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          <input type="hidden" name="uuid" value={uuid} />
          <input type="hidden" name="skills" value={JSON.stringify(skills)} />

          <div className="grid lg:grid-cols-3 gap-8 items-strech">
            {/* LEFT PANEL - Basic Info & Academic & What Happens */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                    <Target className="text-[#ff6b35]" size={18} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                    <Input
                      name="fullName"
                      placeholder="e.g. Gaurav Agarwalla"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Target Role</Label>
                    <Select value={targetRole} onValueChange={setTargetRole}>
                      <SelectTrigger className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35]">
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
                        name="customRole"
                        placeholder="Enter your role (DevOps, QA, etc)"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="mt-2 border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                    <FileText className="text-[#ff6b35]" size={18} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Academic Details</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Year in College</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35]">
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
                        name="experience"
                        placeholder="Years of experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="mt-2 border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">CGPA</Label>
                    <Input
                      name="cgpa"
                      placeholder="8.4"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                    />
                  </div>
                </div>
              </div>

              {/* What Happens Next Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-semibold text-slate-900 mb-5 flex items-center gap-2">
                  <CheckCircle2 className="text-[#ff6b35]" size={16} />
                  What happens next?
                </h3>

                <div className="space-y-4">

                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#fff3ed] text-[#ff6b35] flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Skill Extraction</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        We detect technologies, coursework and experience areas directly from your resume.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#fff3ed] text-[#ff6b35] flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Gap Detection</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Your profile is compared with real developer job requirements.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#fff3ed] text-[#ff6b35] flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Learning Roadmap</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        You receive a clear 30-day plan showing exactly what to study and practice.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* MIDDLE PANEL - Skills */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <h2 className="text-lg font-semibold text-slate-900 mb-5">Technical Skills</h2>

                {skills.length > 0 && (
                  <div className="mb-5 p-4 bg-[#fffaf7] rounded-lg border border-[#ff6b35]/20">
                    <p className="text-xs font-medium text-slate-700 mb-2">
                      Selected Skills ({skills.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge 
                          key={skill} 
                          className="bg-[#ff6b35] text-white hover:bg-[#e55a28] cursor-pointer" 
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-5 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {Object.entries(skillCategories).map(([category, list]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-slate-800 mb-2.5 flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-[#ff6b35]"></div>
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {list.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className={cn(
                              "cursor-pointer transition-all",
                              skills.includes(skill)
                                ? "bg-[#ff6b35] text-white border-[#ff6b35] shadow-sm"
                                : "hover:bg-[#fff3ed] hover:border-[#ff6b35]/30"
                            )}
                            onClick={() => addSkill(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-5 pt-5 border-t border-slate-200">
                  <Input
                    placeholder="Add custom skill"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="border-slate-200 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && customSkill.trim()) {
                        addSkill(customSkill);
                        setCustomSkill("");
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => { 
                      if (customSkill.trim()) {
                        addSkill(customSkill); 
                        setCustomSkill(""); 
                      }
                    }}
                    className="bg-[#ff6b35] hover:bg-[#e55a28]"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL - Resume Upload & Report Preview */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Resume Upload Card */}
              <div className="bg-linear-to-br from-white to-[#fffaf7] rounded-xl border-2 border-[#ff6b35]/30 p-6 shadow-lg">

                <div className="space-y-4 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff6b35] text-white rounded-full text-xs font-medium">
                    <Zap size={12} className="fill-current" />
                    AI Powered
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Resume Analyzer
                    </h2>
                    <p className="text-orange-600 text-sm mt-1">
                      Upload your resume and let AI evaluate your interview readiness.
                    </p>
                  </div>
                </div>

                <ResumeUploader onFileSelect={setResumeFile} />

                <Button
                  type="submit"
                  disabled={loading || !resumeFile || !uuid}
                  className="w-full mt-6 bg-[#ff6b35] hover:bg-[#e55a28] text-white h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
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

                {errorMsg && <p className="text-red-600 text-sm mt-3 text-center">{errorMsg}</p>}
              </div>

              {/* Report Preview Card */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 text-white shadow-lg flex-1">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ff6b35]"></div>
                  Your report will include
                </h3>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#ff6b35] shrink-0" />
                    <span>Career readiness score</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#ff6b35] shrink-0" />
                    <span>Missing technical skills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#ff6b35] shrink-0" />
                    <span>Suggested job roles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#ff6b35] shrink-0" />
                    <span>Learning priority order</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#ff6b35] shrink-0" />
                    <span>Personalized 30-day roadmap</span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-slate-400">
                    Our AI analyzes 50+ data points to create your personalized career development plan
                  </p>
                </div>
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  );
}