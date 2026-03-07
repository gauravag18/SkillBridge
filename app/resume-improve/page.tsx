"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Target,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  TrendingUp,
  Layout,
  Search,
  Award,
  Type,
  ChevronRight,
  Zap,
} from "lucide-react";

// Types
interface BulletImprovement {
  original: string;
  improved: string;
  reason: string;
}

interface StructureFeedback {
  category: string;
  issue: string;
  fix: string;
  priority: "high" | "medium" | "low";
}

interface ResumeAnalysis {
  overall_score: number;
  summary: string;
  sections: {
    bullet_improvements: BulletImprovement[];
    structure_feedback: StructureFeedback[];
    missing_keywords: {
      technical: string[];
      soft_skills: string[];
      action_verbs: string[];
    };
    achievements_analysis: {
      has_metrics: boolean;
      metrics_score: number;
      feedback: string;
      examples_to_quantify: string[];
    };
    ats_analysis: {
      score: number;
      issues: string[];
      recommendations: string[];
    };
  };
  jd_alignment: {
    match_score: number;
    matched_requirements: string[];
    missing_requirements: string[];
    tailoring_tips: string[];
  } | null;
  quick_wins: string[];
  top_issues: string[];
}

// Score Ring
function ScoreRing({
  score,
  size = 72,
  strokeWidth = 6,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black leading-none" style={{ fontSize: size * 0.24, color }}>{score}</span>
        <span className="text-slate-400 leading-none" style={{ fontSize: size * 0.12 }}>/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#ef4444";
  const tag = score >= 75 ? "Good" : score >= 50 ? "Fair" : "Poor";
  const tagCls = score >= 75 ? "bg-green-100 text-green-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tagCls}`}>{tag}</span>
          <span className="text-sm font-black tabular-nums" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    high:   "bg-red-50 text-red-600 border-red-200",
    medium: "bg-amber-50 text-amber-600 border-amber-200",
    low:    "bg-blue-50 text-blue-600 border-blue-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${map[priority] ?? map.low}`}>
      {priority}
    </span>
  );
}

// Upload Panel
function UploadPanel({
  onAnalyze,
  isLoading,
}: {
  onAnalyze: (file: File, jd: string) => void;
  isLoading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [jdOpen, setJdOpen] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-full text-[10px] font-bold text-[#ff6b35] uppercase tracking-wide mb-3">
          AI Resume Coach
        </div>
        <h1 className="text-xl font-bold text-slate-900 leading-tight">Resume Improvement</h1>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Upload your resume for instant AI-powered feedback on bullets, structure, ATS, and more.
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-6 text-center min-h-50
          ${isDragActive ? "border-[#ff6b35] bg-[#fff3ed]"
            : file ? "border-green-400 bg-green-50"
            : "border-slate-200 bg-slate-50 hover:border-[#ff6b35]/50 hover:bg-[#fff3ed]/40"
          }`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <FileText size={22} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{file.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                <CheckCircle2 size={12} /> Ready to analyze
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
              >
                Remove file
              </button>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ y: isDragActive ? 0 : [0, -6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="h-12 w-12 rounded-xl bg-[#fff3ed] flex items-center justify-center shadow-sm"
              >
                <Upload size={20} className="text-[#ff6b35]" />
              </motion.div>
              <div>
                <p className="font-semibold text-slate-700 text-sm">
                  {isDragActive ? "Drop your resume here" : "Upload your resume"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Drag & drop or click · PDF only · max 5MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* JD toggle */}
      <div>
        <button
          onClick={() => setJdOpen((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-[#ff6b35]/40 transition-all"
        >
          <span className="flex items-center gap-2">
            <Target size={14} className="text-slate-400" />
            Add Job Description
            <span className="text-xs font-normal text-slate-400">(optional)</span>
          </span>
          {jdOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </button>
        <AnimatePresence>
          {jdOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here to get JD alignment score..."
                rows={5}
                className="w-full mt-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#ff6b35]/50 resize-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Analyze button */}
      <button
        disabled={!file || isLoading}
        onClick={() => file && onAnalyze(file, jd)}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#ff6b35] text-white font-semibold rounded-xl text-sm transition-all hover:bg-[#e55a28] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" />Analyzing your resume...</>
        ) : (
          <>Analyze Resume <ArrowRight size={14} /></>
        )}
      </button>

      {/* What you'll get */}
      {!file && (
        <div className="p-4 bg-[#fffcfa] border border-slate-100 rounded-xl">
          <p className="text-[10px] font-bold text-slate-500 mb-2.5 uppercase tracking-wider">What you'll get</p>
          <div className="space-y-2">
            {[
              "Bullet-by-bullet rewrites with stronger impact",
              "Structure & formatting recommendations",
              "ATS optimization score & fixes",
              "Missing keywords & action verbs",
              "Quick wins you can apply today",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 size={12} className="text-[#ff6b35] mt-0.5 shrink-0" />
                <span className="text-xs text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-sell */}
      <div className="p-4 bg-[#1a1a1a] rounded-2xl text-white">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#ff6b35]/20 flex items-center justify-center shrink-0">
            <Award size={14} className="text-[#ff6b35]" />
          </div>
          <div>
            <p className="font-bold text-sm mb-0.5">Want the full analysis?</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get skill gaps, a 30-day roadmap, GitHub analysis & JD matching.
            </p>
            <Link
              href="/onboard"
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-[#ff6b35] text-white text-xs font-semibold rounded-lg hover:bg-[#e55a28] transition-colors"
            >
              Start Full Analysis <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading State
function LoadingState() {
  const steps = [
    "Extracting resume content...",
    "Analyzing bullet points...",
    "Checking ATS compatibility...",
    "Identifying missing keywords...",
    "Generating improvements...",
  ];
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s < steps.length - 1 ? s + 1 : s)), 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-100 gap-6">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#ff6b35]/20 animate-spin" style={{ borderTopColor: "#ff6b35" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText size={22} className="text-[#ff6b35]" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-800 text-base mb-1">Analyzing your resume</p>
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-sm text-slate-500">
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "w-6 bg-[#ff6b35]" : "w-1.5 bg-slate-200"}`} />
        ))}
      </div>
    </div>
  );
}

// Results Panel
function ResultsPanel({ data, onReset }: { data: ResumeAnalysis; onReset: () => void }) {
  const [activeTab, setActiveTab] = useState<"bullets" | "structure" | "keywords" | "ats" | "jd">("bullets");

  const tabs = [
    { id: "bullets" as const,   label: "Bullets",   icon: Type },
    { id: "structure" as const, label: "Structure", icon: Layout },
    { id: "keywords" as const,  label: "Keywords",  icon: Search },
    { id: "ats" as const,       label: "ATS",       icon: BarChart3 },
    ...(data.jd_alignment ? [{ id: "jd" as const, label: "JD Fit", icon: Target }] : []),
  ];

  const overallColor = data.overall_score >= 75 ? "#16a34a" : data.overall_score >= 50 ? "#f59e0b" : "#ef4444";
  const overallLabel = data.overall_score >= 75 ? "Strong Resume" : data.overall_score >= 50 ? "Needs Polish" : "Needs Work";

  return (
    <div className="flex flex-col gap-5">

      {/* HERO SCORE BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-[#ff6b35] via-[#ff8a5c] to-transparent" />
        <div className="grid sm:grid-cols-[auto_1fr]">
          {/* Score ring */}
          <div className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-[#fffaf7] to-[#fff3ed]/30 border-b sm:border-b-0 sm:border-r border-slate-100 min-w-36">
            <ScoreRing score={data.overall_score} size={80} strokeWidth={7} />
            <span
              className="mt-3 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide"
              style={{ color: overallColor, borderColor: overallColor + "44", backgroundColor: overallColor + "11" }}
            >
              {overallLabel}
            </span>
          </div>

          {/* Summary + score bars + reset */}
          <div className="p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-black text-slate-900 text-base tracking-tight">Analysis Results</h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-md">{data.summary}</p>
              </div>
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shrink-0"
              >
                <RefreshCw size={11} /> New
              </button>
            </div>
            <div className="space-y-2.5">
              <ScoreBar score={data.sections.ats_analysis.score} label="ATS Compatibility" />
              <ScoreBar score={data.sections.achievements_analysis.metrics_score} label="Impact & Metrics" />
              {data.jd_alignment && (
                <ScoreBar score={data.jd_alignment.match_score} label="JD Alignment" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Top issues */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-red-100 bg-red-50/60">
            <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle size={12} className="text-red-500" />
            </div>
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Top Issues to Fix</span>
            <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">{data.top_issues.length}</span>
          </div>
          <div className="p-4 space-y-2.5">
            {data.top_issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-red-600 text-[9px] font-black">{i + 1}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{issue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick wins */}
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-green-100 bg-green-50/60">
            <div className="h-6 w-6 rounded-lg bg-green-100 flex items-center justify-center">
              <Zap size={12} className="text-green-600" />
            </div>
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Quick Wins</span>
            <span className="ml-auto text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">Under 10 min</span>
          </div>
          <div className="p-4 space-y-2.5">
            {data.quick_wins.map((win, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={9} className="text-green-600" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{win}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*  TABS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="h-px bg-linear-to-r from-[#ff6b35]/20 via-transparent to-transparent" />
        <div className="p-5">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-1 justify-center ${
                  activeTab === tab.id ? "bg-white text-[#ff6b35] shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon size={11} />{tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="space-y-4">

              {/* BULLETS */}
              {activeTab === "bullets" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                      <Type size={13} className="text-[#ff6b35]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Bullet Point Rewrites</h3>
                      <p className="text-xs text-slate-500">AI-improved versions of your weakest bullets</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {data.sections.bullet_improvements.map((b, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                          <div className="p-4 bg-red-50/30">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <AlertCircle size={9} className="text-red-600" />
                              </div>
                              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Before</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{b.original}</p>
                          </div>
                          <div className="p-4 bg-green-50/30">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={9} className="text-green-600" />
                              </div>
                              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">After</span>
                            </div>
                            <p className="text-xs text-slate-800 font-semibold leading-relaxed">{b.improved}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="rounded-xl border border-amber-100 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-amber-100 bg-amber-50/60">
                      <div className="h-6 w-6 rounded-lg bg-amber-100 flex items-center justify-center">
                        <TrendingUp size={12} className="text-amber-600" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Metrics & Quantification</span>
                      <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        data.sections.achievements_analysis.has_metrics ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {data.sections.achievements_analysis.has_metrics ? "Present" : "Missing"}
                      </span>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{data.sections.achievements_analysis.feedback}</p>
                      {data.sections.achievements_analysis.examples_to_quantify.length > 0 && (
                        <>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Could be quantified</p>
                          <div className="space-y-1.5">
                            {data.sections.achievements_analysis.examples_to_quantify.map((ex, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                <ChevronRight size={11} className="text-amber-500 shrink-0 mt-0.5" />{ex}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* STRUCTURE */}
              {activeTab === "structure" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                      <Layout size={13} className="text-[#ff6b35]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Structure & Formatting</h3>
                      <p className="text-xs text-slate-500">Issues with how your resume is organized</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data.sections.structure_feedback.map((s, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                          <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">{s.category}</span>
                          <PriorityBadge priority={s.priority} />
                        </div>
                        <div className="p-4 bg-white space-y-2.5">
                          <div className="flex items-start gap-2.5">
                            <div className="h-5 w-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                              <AlertCircle size={10} className="text-red-400" />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{s.issue}</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="h-5 w-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle2 size={10} className="text-green-500" />
                            </div>
                            <p className="text-xs text-slate-800 font-semibold leading-relaxed">{s.fix}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* KEYWORDS */}
              {activeTab === "keywords" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                      <Search size={13} className="text-[#ff6b35]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Missing Keywords</h3>
                      <p className="text-xs text-slate-500">Add these to improve visibility and relevance</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Technical Skills",    items: data.sections.missing_keywords.technical,    dot: "bg-[#ff6b35]",  bg: "bg-[#fff3ed]", border: "border-[#ff6b35]/20", tc: "text-[#ff6b35]" },
                      { label: "Soft Skills",         items: data.sections.missing_keywords.soft_skills,  dot: "bg-violet-500", bg: "bg-violet-50", border: "border-violet-200",    tc: "text-violet-700" },
                      { label: "Strong Action Verbs", items: data.sections.missing_keywords.action_verbs, dot: "bg-cyan-500",   bg: "bg-cyan-50",   border: "border-cyan-200",      tc: "text-cyan-700" },
                    ].map(({ label, items, dot, bg, border, tc }) => (
                      <div key={label} className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                          <div className={`h-2 w-2 rounded-full ${dot}`} />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
                          <span className="ml-auto text-[10px] font-bold text-slate-400">{items.length} missing</span>
                        </div>
                        <div className="p-4 bg-white">
                          {items.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {items.map((kw, i) => (
                                <span key={i} className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${bg} ${border} ${tc}`}>+ {kw}</span>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-green-500" />
                              <p className="text-xs text-slate-500 font-medium">All covered</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ATS */}
              {activeTab === "ats" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                      <BarChart3 size={13} className="text-[#ff6b35]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">ATS Optimization</h3>
                      <p className="text-xs text-slate-500">How well your resume performs with Applicant Tracking Systems</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 bg-white flex items-center gap-5">
                      <ScoreRing score={data.sections.ats_analysis.score} size={72} strokeWidth={6} />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm mb-1">ATS Compatibility Score</p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">
                          {data.sections.ats_analysis.score >= 75
                            ? "Good — most ATS systems will parse this correctly."
                            : data.sections.ats_analysis.score >= 50
                            ? "Needs work — some ATS issues may filter you out."
                            : "Critical — likely being filtered by ATS systems."}
                        </p>
                        <ScoreBar score={data.sections.ats_analysis.score} label="Parsability" />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-red-100 overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-red-100 bg-red-50/60">
                        <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center">
                          <AlertCircle size={12} className="text-red-500" />
                        </div>
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Issues Found</span>
                        <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">{data.sections.ats_analysis.issues.length}</span>
                      </div>
                      <div className="p-4 bg-white space-y-2">
                        {data.sections.ats_analysis.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertCircle size={11} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-700 leading-relaxed">{issue}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-green-100 overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-green-100 bg-green-50/60">
                        <div className="h-6 w-6 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-green-600" />
                        </div>
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Recommendations</span>
                      </div>
                      <div className="p-4 bg-white space-y-2">
                        {data.sections.ats_analysis.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 size={11} className="text-green-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-700 leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* JD FIT */}
              {activeTab === "jd" && data.jd_alignment && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                      <Target size={13} className="text-[#ff6b35]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Job Description Alignment</h3>
                      <p className="text-xs text-slate-500">How well your resume matches the provided JD</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 bg-white flex items-center gap-5">
                      <ScoreRing score={data.jd_alignment.match_score} size={72} strokeWidth={6} />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm mb-1">JD Match Score</p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">
                          {data.jd_alignment.match_score >= 75 ? "Strong match — you cover most requirements."
                            : data.jd_alignment.match_score >= 50 ? "Partial match — tailor your resume further."
                            : "Low match — significant gaps vs this JD."}
                        </p>
                        <ScoreBar score={data.jd_alignment.match_score} label="Overall match" />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-green-100 overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-green-100 bg-green-50/60">
                        <div className="h-6 w-6 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-green-600" />
                        </div>
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Matched</span>
                        <span className="ml-auto text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">{data.jd_alignment.matched_requirements.length}</span>
                      </div>
                      <div className="p-4 bg-white space-y-2">
                        {data.jd_alignment.matched_requirements.map((r, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 size={11} className="text-green-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-700 leading-relaxed">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-100 overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-red-100 bg-red-50/60">
                        <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center">
                          <AlertCircle size={12} className="text-red-500" />
                        </div>
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Missing</span>
                        <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">{data.jd_alignment.missing_requirements.length}</span>
                      </div>
                      <div className="p-4 bg-white space-y-2">
                        {data.jd_alignment.missing_requirements.map((r, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertCircle size={11} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-700 leading-relaxed">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#ff6b35]/20 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#ff6b35]/15 bg-[#fff3ed]/60">
                      <div className="h-6 w-6 rounded-lg bg-[#ff6b35]/15 flex items-center justify-center">
                        <Sparkles size={12} className="text-[#ff6b35]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#ff6b35] uppercase tracking-wider">Tailoring Tips</span>
                    </div>
                    <div className="p-4 bg-white space-y-2">
                      {data.jd_alignment.tailoring_tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <ChevronRight size={11} className="text-[#ff6b35] shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-700 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function ResumeImprovementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (file: File, jd: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("resume", file);
      if (jd.trim()) form.append("jobDescription", jd.trim());

      const res = await fetch("/api/analyze-resume", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Analysis failed");
      setResult(json.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5]">

      {/* Navbar — matches landing page exactly */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-slate-900">SkillBridge</span>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/#features" className="text-slate-600 hover:text-[#ff6b35] font-medium transition-colors text-sm">Features</Link>
              <Link href="/#process" className="text-slate-600 hover:text-[#ff6b35] font-medium transition-colors text-sm">How It Works</Link>
              <Link href="/#testimonials" className="text-slate-600 hover:text-[#ff6b35] font-medium transition-colors text-sm">Testimonials</Link>
            </nav>
            <Link href="/onboard" className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg transition-all hover:shadow-lg text-xs">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium">Resume Improvement</span>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-5 items-start">

          {/* LEFT — sticky upload */}
          <div className="lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="h-px bg-linear-to-r from-[#ff6b35]/30 via-transparent to-transparent" />
              <div className="p-6">
                <UploadPanel onAnalyze={handleAnalyze} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* RIGHT — results */}
          <div className="min-h-150">
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="h-px bg-linear-to-r from-[#ff6b35]/30 via-transparent to-transparent" />
                <div className="p-6"><LoadingState /></div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="h-px bg-linear-to-r from-[#ff6b35]/30 via-transparent to-transparent" />
                <div className="p-6 flex flex-col items-center justify-center min-h-100 gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <AlertTriangle size={22} className="text-red-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-800 mb-1">Analysis Failed</p>
                    <p className="text-sm text-slate-500 max-w-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white text-sm font-semibold rounded-lg hover:bg-[#e55a28] transition-colors"
                  >
                    <RefreshCw size={13} /> Try Again
                  </button>
                </div>
              </div>
            ) : result ? (
              <ResultsPanel data={result} onReset={() => setResult(null)} />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="h-px bg-linear-to-r from-[#ff6b35]/30 via-transparent to-transparent" />
                <div className="p-6 flex flex-col items-center justify-center min-h-125 gap-5 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-[#fff3ed] border border-[#ff6b35]/15 flex items-center justify-center">
                    <FileText size={32} className="text-[#ff6b35]/50" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg mb-2">Your analysis will appear here</p>
                    <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                      Upload your resume on the left and click{" "}
                      <span className="font-semibold text-[#ff6b35]">Analyze Resume</span>{" "}
                      to get instant AI-powered feedback.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                    {[
                      { icon: Type,      label: "Bullet rewrites" },
                      { icon: Layout,    label: "Structure fixes" },
                      { icon: Search,    label: "Keyword gaps" },
                      { icon: BarChart3, label: "ATS score" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 font-medium">
                        <Icon size={12} className="text-slate-300" />{label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}