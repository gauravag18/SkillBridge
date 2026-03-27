"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  BarChart3,
  Target,
  MessageSquare,
  Sparkles,
  Award,
  Zap,
  PlayCircle,
  SkipForward
} from "lucide-react";
import { generateNextInterviewQuestion, generateFinalInterviewReport } from "@/app/actions/interview";

// Types 
interface InterviewQuestion {
  question: string;
  question_type: string;
  difficulty: string;
  category: string;
}

interface FinalReport {
  overall_score: number;
  technical_depth: number;
  communication: number;
  role_fit: number;
  strengths: string[];
  weaknesses: string[];
  improvement_tips: string[];
  summary: string;
}

// Sub-components 

function Navbar({ uuid }: { uuid?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <Link
          href="/"
          className="font-bold text-lg tracking-tight text-slate-900 hover:text-[#ff6b35] transition-colors"
        >
          SkillBridge
        </Link>

        {/* RIGHT: Only Full Analysis Button */}
        <Link
          href={uuid ? `/dashboard?uuid=${uuid}` : "/"}
          className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg transition-all hover:shadow-lg text-xs"
        >
          Full Analysis
        </Link>

      </div>
    </header>
  );
}

function ScoreRing({ score, max = 10, size = 64, label = "" }: { score: number; max?: number; size?: number; label?: string }) {
  const pct = (score / max) * 100;
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#ff6b35" : pct >= 50 ? "#f59e0b" : "#94a3b8"; // Brand aligned

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 drop-shadow-sm">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f5f9" strokeWidth={5} fill="none" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={color} strokeWidth={5} fill="none"
            strokeDasharray={`${circ} ${circ}`} strokeLinecap="round"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black text-base leading-none text-slate-800">{score}</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">/{max}</span>
        </div>
      </div>
      {label && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>}
    </div>
  );
}

//Main Page
export default function MockInterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const uuid = searchParams.get("uuid") || "";
  const role = searchParams.get("role") || "Software Engineer";
  const jobDescription = searchParams.get("jobDescription") || null;

  const TOTAL_QUESTIONS = 9;

  // State
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const hasLoadedFirst = useRef(false);

  // Init speech recognition 
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSR = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    const hasTTS = "speechSynthesis" in window;
    setVoiceSupported(hasSR);
    setTtsSupported(hasTTS);

    if (!hasSR) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      const text = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(text);
    };

    rec.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== "no-speech") {
        setError(`Mic error: ${event.error}. Please check permissions.`);
      }
    };

    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;

    return () => {
      try { rec.abort(); } catch {}
    };
  }, []);

  //  Load first question on mount
  useEffect(() => {
    if (!hasLoadedFirst.current && uuid) {
      hasLoadedFirst.current = true;
      loadQuestion(0, []);
    }
  }, [uuid]);

  //  Load a question
  const loadQuestion = useCallback(async (index: number, prevQuestions: InterviewQuestion[]) => {
    setIsLoadingQuestion(true);
    setTranscript("");
    setError(null);

    try {
      const res = await generateNextInterviewQuestion(
        uuid,
        role,
        jobDescription,
        prevQuestions.map((q) => q.question),
        index
      );

      if (!res.success || !res.question) {
        throw new Error(res.error || "Failed to load question");
      }

      const newQuestion = res.question as InterviewQuestion;
      setQuestions((prev) => [...prev, newQuestion]);
      setStarted(true);
      speakText(newQuestion.question);
    } catch (err: any) {
      setError(err.message || "Failed to load question. Please try again.");
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [uuid, role, jobDescription]);

  //speech
  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Toggle mic 
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      // Stop and move to next
      recognitionRef.current.stop();
      setIsListening(false);

      const answer = transcript.trim() || "(No answer spoken)";
      const updatedAnswers = [...allAnswers, answer];
      setAllAnswers(updatedAnswers);

      const nextIndex = currentIndex + 1;

      if (nextIndex < TOTAL_QUESTIONS) {
        setCurrentIndex(nextIndex);
        loadQuestion(nextIndex, questions);
      } else {
        finishInterview(updatedAnswers);
      }
    } else {
      setTranscript("");
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setError("Could not start microphone. Please check browser permissions.");
      }
    }
  }, [isListening, transcript, allAnswers, currentIndex, questions, loadQuestion]);

  //  Skip question 
  const skipQuestion = useCallback(() => {
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
    }

    const updatedAnswers = [...allAnswers, "(Skipped)"];
    setAllAnswers(updatedAnswers);
    const nextIndex = currentIndex + 1;

    if (nextIndex < TOTAL_QUESTIONS) {
      setCurrentIndex(nextIndex);
      loadQuestion(nextIndex, questions);
    } else {
      finishInterview(updatedAnswers);
    }
  }, [isListening, allAnswers, currentIndex, questions, loadQuestion]);

  // Replay question
  const replayQuestion = useCallback(() => {
    const current = questions[currentIndex];
    if (current) speakText(current.question);
  }, [questions, currentIndex, speakText]);

  // Finish
  const finishInterview = useCallback(async (answers: string[]) => {
    setIsGeneratingReport(true);
    window.speechSynthesis?.cancel();

    const qaPairs = questions.map((q, i) => ({
      question: q.question,
      answer: answers[i] || "(No answer provided)",
    }));

    try {
      const res = await generateFinalInterviewReport(uuid, role, jobDescription, qaPairs);

      if (!res.success || !res.report) {
        throw new Error(res.error || "Failed to generate report");
      }

      setFinalReport(res.report as FinalReport);
    } catch (err: any) {
      setError(err.message || "Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  }, [questions, uuid, role, jobDescription]);

  //  Restart 
  const restart = () => {
    window.speechSynthesis?.cancel();
    setQuestions([]);
    setAllAnswers([]);
    setCurrentIndex(0);
    setTranscript("");
    setIsListening(false);
    setIsSpeaking(false);
    setFinalReport(null);
    setError(null);
    hasLoadedFirst.current = false;
    setTimeout(() => {
      hasLoadedFirst.current = true;
      loadQuestion(0, []);
    }, 100);
  };

  const currentQuestion = questions[currentIndex];
  const progress = Math.round(((currentIndex) / TOTAL_QUESTIONS) * 100);

  //  REPORT VIEW 
  if (finalReport) {
    return (
      <div className="min-h-screen bg-[#faf9f8] selection:bg-[#ff6b35]/20 selection:text-[#ff6b35]">
        <Navbar uuid={uuid} />
        <main className="max-w-4xl mx-auto px-4 lg:px-6 py-10 space-y-10 relative">
          {/* Ambient background for report */}
          <div className="mt-[-80px] absolute top-10 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#ff8a5c]/10 to-[#ff6b35]/5 rounded-full blur-[80px] pointer-events-none -z-10" />

          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 font-bold bg-white px-3.5 py-1.5 rounded-lg shadow-sm border border-slate-200/60">Interview Report</span>
          </motion.div>

          {/* Hero Score Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.5, ease: "easeOut", type: "spring", bounce: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] overflow-hidden relative group"
          >
            <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gradient-to-br from-[#ff6b35]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="grid md:grid-cols-[auto_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-100/80 relative z-10">
              
              {/* Main overall score */}
              <div className="p-8 md:p-14 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-orange-50/20">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#ff6b35]/10 blur-2xl rounded-full" />
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90 drop-shadow-md" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="62" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                      <motion.circle
                        cx="70" cy="70" r="62"
                        stroke="url(#rgHero)" strokeWidth="12" fill="none"
                        strokeDasharray={`${389.55}`}
                        initial={{ strokeDashoffset: 389.55 }}
                        animate={{ strokeDashoffset: 389.55 - ((finalReport.overall_score / 10) * 389.55) }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="rgHero" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff8a5c" />
                          <stop offset="100%" stopColor="#ff6b35" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter mt-1">{finalReport.overall_score}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">/10</span>
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ff6b35] rounded-full text-white text-xs font-bold tracking-wider uppercase shadow-md shadow-[#ff6b35]/20">
                  <Award size={14} /> Overall Score
                </div>
              </div>

              {/* Header Info & Subscores */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Interview Evaluated</h1>
                <p className="text-base text-slate-500 font-medium mb-8 flex flex-wrap gap-2 items-center">
                   Role context: <span className="text-slate-800 font-bold px-3 py-1 bg-slate-100 rounded-md border border-slate-200">{role}</span>
                </p>

                <div className="grid grid-cols-3 gap-4 md:gap-8 mt-auto">
                  <ScoreRing score={finalReport.technical_depth} max={10} size={70} label="Technical" />
                  <ScoreRing score={finalReport.communication} max={10} size={70} label="Communication" />
                  <ScoreRing score={finalReport.role_fit} max={10} size={70} label="Role Fit" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed analysis grids */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
              {/* Summary */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-6 sm:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-blue-50/80 text-blue-600 border border-blue-100 shadow-sm">
                    <MessageSquare size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Summary</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-[15px]">{finalReport.summary}</p>
              </div>

              {/* Strengths */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-6 sm:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-50/80 text-teal-600 border border-teal-100 shadow-sm">
                      <Zap size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Key Strengths</h2>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full shadow-sm">{finalReport.strengths.length}</span>
                </div>
                <div className="space-y-3">
                  {finalReport.strengths.map((s, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100/80 shadow-sm">
                      <CheckCircle2 size={18} className="text-teal-500 mt-0.5 shrink-0" />
                      <p className="text-[14px] text-slate-700 leading-relaxed font-medium">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-6">
              
              {/* Weaknesses */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-6 sm:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/20 shadow-sm">
                      <AlertTriangle size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Areas to Improve</h2>
                  </div>
                  <span className="text-xs font-bold text-[#e55a28] bg-[#ff6b35]/10 border border-[#ff6b35]/20 px-3 py-1.5 rounded-full shadow-sm">{finalReport.weaknesses.length}</span>
                </div>
                <div className="space-y-3">
                  {finalReport.weaknesses.map((w, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100/80 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-[#ff6b35] mt-2 shrink-0 shadow-[0_0_8px_rgba(255,107,53,0.4)]" />
                      <p className="text-[14px] text-slate-700 leading-relaxed font-medium">{w}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement tips */}
              <div className="bg-gradient-to-br from-slate-900 to-[#1e293b] text-white rounded-3xl border border-slate-700 shadow-[0_20px_40px_rgba(0,0,0,0.15)] overflow-hidden p-6 sm:p-8 relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Target size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-[#ff6b35] border border-slate-700 shadow-sm">
                      <Target size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Actionable Advice</h2>
                  </div>
                  <div className="space-y-4">
                    {finalReport.improvement_tips.map((tip, i) => (
                      <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-700/50 last:border-0 last:pb-0">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                          <span className="text-xs font-black text-[#ff6b35]">{i + 1}</span>
                        </div>
                        <p className="text-[14px] text-slate-300 leading-relaxed font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Q&A Review */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_40px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
               <div className="p-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-sm mx-1">
                  <BarChart3 size={18} />
               </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Post-Interview Transcript</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {questions.map((q, i) => (
                <div key={i} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-black shadow-sm border border-slate-200 shrink-0">Q{i + 1}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{q.category} • {q.difficulty}</span>
                  </div>
                  <h3 className="text-[17px] font-extrabold text-slate-900 mb-5 leading-relaxed tracking-tight">{q.question}</h3>
                  <div className="relative pl-5 border-l-2 border-slate-200 group-hover:border-[#ff6b35]/40 transition-colors">
                    <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
                      {allAnswers[i] && allAnswers[i] !== "(No answer spoken)" && allAnswers[i] !== "(Skipped)" && allAnswers[i] !== "(No answer provided)" ? (
                        allAnswers[i]
                      ) : (
                        <span className="text-slate-400 italic">No articulated response.</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-5 pt-6 pb-12 relative z-10 w-full max-w-2xl mx-auto">
            <button
              onClick={restart}
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl text-[16px] hover:bg-slate-800 shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition-all active:scale-[0.98]"
            >
              <RotateCcw size={18} /> Take Another Interview
            </button>
            <Link
              href={uuid ? `/dashboard?uuid=${uuid}` : "/"}
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-white/80 backdrop-blur-md text-slate-700 font-bold rounded-2xl border-2 border-slate-200/80 hover:border-[#ff6b35] hover:text-[#ff6b35] text-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(255,107,53,0.1)] transition-all active:scale-[0.98]"
            >
              Back to Dashboard <ArrowRight size={18} />
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  //  GENERATING REPORT
  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-[#faf9f8] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/5 to-transparent z-0" />
        <Navbar uuid={uuid} />
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 relative z-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#ff6b35]/20 blur-[50px] rounded-full scale-150 animate-pulse" />
            <div className="relative w-32 h-32 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-slate-200/60 flex items-center justify-center rotate-45 overflow-hidden ring-1 ring-slate-900/5">
               <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-[#ff8a5c]/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
               />
               <BarChart3 size={46} className="text-[#ff6b35] -rotate-45 drop-shadow-sm" />
            </div>
          </motion.div>
          <div className="text-center space-y-3 relative z-10">
            <h2 className="text-[28px] font-black text-slate-900 tracking-tight">Compiling Results</h2>
            <p className="text-[15px] text-slate-500 font-medium">Analyzing <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shadow-sm mx-1">{questions.length}</span> recorded answers using AI...</p>
          </div>
        </div>
      </div>
    );
  }

  //  INTERVIEW VIEW 
  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col selection:bg-[#ff6b35]/20 selection:text-[#ff6b35] overflow-hidden">
      <Navbar uuid={uuid} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center relative">
        {/* Background ambient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-[#ff6b35]/10 to-transparent rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-[80px]" />
        </div>

        <div className="w-full space-y-6">
          
          {/* Progress Header */}
          <div className="flex items-end justify-between px-2 mb-2">
             <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Live Interview</span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Question <span className="text-[#ff6b35]">{currentIndex + 1}</span><span className="text-slate-400 text-xl">/{TOTAL_QUESTIONS}</span></h1>
             </div>
             <div className="text-right flex items-center gap-3">
                <span className="bg-white text-slate-700 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm hidden sm:inline-flex items-center gap-1.5">
                  <Target size={14} className="text-[#ff6b35]" /> {role}
                </span>
             </div>
          </div>

          <div className="h-2.5 bg-white border border-slate-100 rounded-full overflow-hidden shadow-sm p-0.5">
             <motion.div 
               className="h-full bg-gradient-to-r from-[#ff8a5c] to-[#ff6b35] rounded-full shadow-[0_0_10px_rgba(255,107,53,0.3)]"
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.5, ease: "easeOut" }}
             />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </motion.div>
          )}

          {!voiceSupported && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <AlertTriangle size={20} className="text-amber-500 shrink-0" />
              <p className="text-sm font-semibold text-amber-800">Voice input not supported. Please use Chrome or Edge.</p>
            </div>
          )}

          {/* Main Card */}
          <div className="relative group perspective">
            {isLoadingQuestion && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-white/50 shadow-2xl">
                  <div className="relative">
                     <div className="w-16 h-16 rounded-full border-4 border-slate-100/50" />
                     <div className="absolute inset-0 rounded-full border-4 border-l-[#ff6b35] border-t-[#ff6b35] border-r-transparent border-b-transparent animate-spin shadow-[0_0_15px_rgba(255,107,53,0.3)]" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Question...</p>
               </div>
            )}
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden min-h-[350px] flex flex-col relative z-10 ring-1 ring-slate-900/5 transition-all duration-500">
              <AnimatePresence mode="wait">
                {currentQuestion && (
                  <motion.div 
                     key={currentIndex}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     transition={{ duration: 0.4, ease: "easeOut" }}
                     className="flex-1 flex flex-col p-5 sm:p-8"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        {currentQuestion.category}
                      </span>
                      <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border uppercase tracking-widest shadow-sm ${
                        currentQuestion.difficulty === "hard"   ? "bg-rose-50 text-rose-600 border-rose-200/60" :
                        currentQuestion.difficulty === "medium" ? "bg-amber-50 text-amber-600 border-amber-200/60" :
                        "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                      <AnimatePresence>
                        {isSpeaking && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-[#ff6b35] font-bold uppercase tracking-widest bg-[#ff6b35]/10 px-3.5 py-1.5 rounded-full border border-[#ff6b35]/20 shadow-sm"
                          >
                            <Volume2 size={13} className="animate-pulse" /> AI Speaking
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mb-5 tracking-tight w-full">
                      {currentQuestion.question}
                    </h2>

                    <div className="mt-auto flex flex-col items-center">
                      
                      {/* Transcript Box */}
                      <AnimatePresence>
                        {(isListening || transcript) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            className="w-full mb-4 overflow-hidden"
                          >
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-red-500' : 'bg-slate-300'}`}></span>
                                </span>
                                Your Answer
                              </p>
                              <p className="text-[15px] sm:text-[16px] text-slate-700 font-medium leading-relaxed border-l-2 border-[#ff6b35]/20 pl-3">
                                {transcript || <span className="text-slate-400/70 italic">Listening for your response...</span>}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Mic Button Area */}
                      <div className="relative mb-4 flex justify-center w-full mt-2">
                        <button
                          onClick={toggleListening}
                          disabled={isLoadingQuestion || isSpeaking}
                          className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group ${
                            isListening
                              ? "bg-gradient-to-tr from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md scale-105"
                              : "bg-[#ff6b35] hover:bg-[#ff8a5c] hover:-translate-y-1 shadow-lg"
                          }`}
                        >
                          {isListening
                            ? <MicOff size={28} className="text-white drop-shadow-sm" />
                            : <Mic size={28} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                          }
                        </button>
                      </div>

                      <div className="h-6 mb-4 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          <motion.p 
                            key={isSpeaking ? "speaking" : isListening ? "listening" : "idle"}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[15px] font-semibold text-slate-500 text-center"
                          >
                            {isSpeaking
                              ? " AI is speaking..."
                              : isListening
                              ? <span className="text-red-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Recording your answer...</span>
                              : "Tap microphone to begin answering"}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      {/* Controls Footer */}
                      <div className="w-full flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                         <button
                           onClick={replayQuestion}
                           disabled={isSpeaking || isListening || isLoadingQuestion}
                           className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-40 shadow-sm"
                         >
                           <PlayCircle size={18} /> Replay
                         </button>
                         <button
                           onClick={skipQuestion}
                           disabled={isLoadingQuestion}
                           className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-40 shadow-sm"
                         >
                           Skip <SkipForward size={18} />
                         </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}