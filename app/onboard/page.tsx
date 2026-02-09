"use client";

import React, { useState } from "react";
import Link from "next/link";
import ResumeUploader from "@/components/ui/ResumeUploader";
import { ArrowRight, Loader2 } from "lucide-react";
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

/* ---------- Navbar ---------- */
function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 h-[60px] flex items-center">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 w-full flex items-center justify-between">

        <Link href="/" className="font-bold text-lg text-slate-900">
          SkillBridge
        </Link>

        <Link
              href="/"
              className="px-4 py-2 bg-[#3d52a0] text-white font-semibold rounded-lg hover:bg-primary-hover transition-all hover:shadow-lg text-xs"
            >
              Back
            </Link>

      </div>
    </header>
  );
}

export default function OnboardPage() {

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

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Create Your Career Profile
          </h1>
          <p className="text-slate-700 mt-2">
            Fill your details and upload resume. Our AI will analyze your readiness.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">

          {/* LEFT PANEL */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-8">

            {/* Basic Info */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>

              <div className="space-y-3">
                <Label>Full Name</Label>
                <Input
                  placeholder="e.g. Gaurav Agarwalla"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Target Role</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
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
                  />
                )}
              </div>
            </div>

            {/* Academic */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Academic Details</h2>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <Label>Year in College</Label>
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

                  {year === "passed" && (
                    <Input
                      placeholder="Years of experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <Label>CGPA</Label>
                  <Input
                    placeholder="8.4"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Technical Skills</h2>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} className="bg-[#e3ecff] text-[#2f417f]" onClick={() => removeSkill(skill)}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2">
                {Object.entries(skillCategories).map(([category, list]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {list.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className={cn(
                            "cursor-pointer",
                            skills.includes(skill)
                              ? "bg-[#3d52a0] text-white border-[#3d52a0]"
                              : "hover:bg-[#eef3ff]"
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

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                />
                <Button type="button" onClick={() => { addSkill(customSkill); setCustomSkill(""); }}>
                  Add
                </Button>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-white rounded-xl border border-slate-400 p-8 shadow-sm flex flex-col justify-between">

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  AI Resume Analyzer
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Upload resume and our AI will evaluate interview readiness.
                </p>
              </div>

              <ResumeUploader onFileSelect={setResumeFile} />
            </div>  
             <div className="pt-2">
    <h3 className="text-sm font-semibold text-foreground mb-4">
      What happens next?
    </h3>

    <div className="space-y-5">

      <div className="flex gap-4">
        <div className="h-7 w-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold mt-0.5">
          1
        </div>
        <div>
          <p className="font-medium text-foreground">Skill Extraction</p>
          <p className="text-xs">
            We detect technologies, coursework and experience areas directly from your resume.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="h-7 w-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold mt-0.5">
          2
        </div>
        <div>
          <p className="font-medium text-foreground">Gap Detection</p>
          <p className="text-xs">
            Your profile is compared with real developer job requirements.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="h-7 w-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold mt-0.5">
          3
        </div>
        <div>
          <p className="font-medium text-foreground">Learning Roadmap</p>
          <p className="text-xs">
            You receive a clear 30-day plan showing exactly what to study and practice.
          </p>
        </div>
      </div>

    </div>
  </div>

  {/* Output Preview */}
  <div className="pt-2">
    <h3 className="text-sm font-semibold text-foreground mb-3">
      Your report will include
    </h3>

    <ul className="space-y-2 text-sm text-semibold">
      <li>• Career readiness score</li>
      <li>• Missing technical skills</li>
      <li>• Suggested job roles</li>
      <li>• Learning priority order</li>
      <li>• Personalized 30-day roadmap</li>
    </ul>
  </div>

            <Button
              onClick={startAnalysis}
              disabled={!resumeFile || loading}
              className="w-full mt-8 bg-[#16308c] hover:bg-[#2f417f] text-white h-12"
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

          </div>

        </div>
      </main>
    </div>
  );
}
