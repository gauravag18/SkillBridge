"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  BarChart3,
  Target,
  MessageSquare,
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

function Navbar({ uuid }: { uuid: string }) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 hover:text-[#ff6b35] transition-colors">
          SkillBridge
        </Link>
        <div className="flex items-center gap-3">
          {uuid && (
            <Link
              href={`/dashboard?uuid=${uuid}`}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors hidden sm:block"
            >
              Dashboard
            </Link>
          )}
          <Link href="/onboard" className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg hover:shadow-lg hover:bg-[#e55a28] transition-all text-xs">
            Full Analysis
          </Link>
        </div>
      </div>
    </header>
  );
}

function ScoreRing({ score, max = 10, size = 64 }: { score: number; max?: number; size?: number }) {
  const pct = (score / max) * 100;
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={6} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={6} fill="none"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-sm leading-none" style={{ color }}>{score}</span>
        <span className="text-[9px] text-slate-400">/{max}</span>
      </div>
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
    utterance.rate = 0.92;
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
  }, [isListening, transcript, allAnswers, currentIndex, questions]);

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
  }, [isListening, allAnswers, currentIndex, questions]);

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
    const scoreColor = (s: number, max = 10) => {
      const pct = (s / max) * 100;
      return pct >= 75 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
    };

    return (
      <div className="min-h-screen bg-[#f8f7f5]">
        <Navbar uuid={uuid} />
        <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600 font-medium">Interview Report</span>
          </div>

          {/* Score banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-[#ff6b35] via-[#ff8a5c] to-transparent" />
            <div className="grid sm:grid-cols-[auto_1fr]">
              {/* Main score */}
              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#fffaf7] to-[#fff3ed]/30 border-b sm:border-b-0 sm:border-r border-slate-100 min-w-[10rem]">
                <div className="relative h-24 w-24 flex items-center justify-center mb-3">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                    <circle
                      cx="48" cy="48" r="40"
                      stroke="url(#rg)" strokeWidth="8" fill="none"
                      strokeDasharray={`${(finalReport.overall_score / 10) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff8a5c" />
                        <stop offset="100%" stopColor="#ff6b35" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-[#ff6b35] leading-none">{finalReport.overall_score}</span>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">/10</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
              </div>

              {/* Sub-scores + summary */}
              <div className="p-6 flex flex-col justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-full text-[10px] font-bold text-[#ff6b35] uppercase tracking-wide mb-2">
                    Interview Complete
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Mock Interview Report</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Role: <span className="font-semibold text-slate-700">{role}</span></p>
                </div>

                {/* Sub-scores */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Technical", value: finalReport.technical_depth },
                    { label: "Communication", value: finalReport.communication },
                    { label: "Role Fit", value: finalReport.role_fit },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <ScoreRing score={value} max={10} size={52} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-[#fff3ed]/40">
              <div className="h-6 w-6 rounded-lg bg-[#ff6b35]/15 flex items-center justify-center">
                <MessageSquare size={12} className="text-[#ff6b35]" />
              </div>
              <h2 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Interview Summary</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed">{finalReport.summary}</p>
            </div>
          </div>

          {/* Strengths + Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-green-100 bg-green-50/50">
                <div className="h-6 w-6 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-green-600" />
                </div>
                <h2 className="text-[10px] font-bold text-green-800 uppercase tracking-wider">Strengths</h2>
                <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{finalReport.strengths.length}</span>
              </div>
              <div className="p-4 space-y-2">
                {finalReport.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={10} className="text-green-600" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-red-100 bg-red-50/50">
                <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle size={12} className="text-red-500" />
                </div>
                <h2 className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Areas to Improve</h2>
                <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">{finalReport.weaknesses.length}</span>
              </div>
              <div className="p-4 space-y-2">
                {finalReport.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle size={10} className="text-red-400" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement tips */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-[#fff3ed]/40">
              <div className="h-6 w-6 rounded-lg bg-[#ff6b35]/15 flex items-center justify-center">
                <Target size={12} className="text-[#ff6b35]" />
              </div>
              <h2 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Improvement Tips</h2>
            </div>
            <div className="p-5 space-y-2.5">
              {finalReport.improvement_tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#fff3ed] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-black text-[#ff6b35]">{i + 1}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A Review */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
              <div className="h-6 w-6 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                <BarChart3 size={12} className="text-[#ff6b35]" />
              </div>
              <h2 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Your Answers</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {questions.map((q, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-5 w-5 rounded-full bg-[#ff6b35] flex items-center justify-center text-white text-[9px] font-black shrink-0">{i + 1}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{q.category} · {q.difficulty}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mb-2 leading-relaxed">{q.question}</p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      {allAnswers[i] || "(No answer)"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4">
            <button
              onClick={restart}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6b35] text-white font-semibold rounded-xl text-sm hover:bg-[#e55a28] hover:shadow-lg transition-all"
            >
              <RotateCcw size={14} /> Practice Again
            </button>
            <Link
              href={uuid ? `/dashboard?uuid=${uuid}` : "/"}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-[#ff6b35] hover:text-[#ff6b35] text-sm transition-all"
            >
              Back to Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  //  GENERATING REPORT
  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-[#f8f7f5]">
        <Navbar uuid={uuid} />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#ff6b35]/20 animate-spin" style={{ borderTopColor: "#ff6b35" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 size={22} className="text-[#ff6b35]" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-900 text-lg mb-1">Generating Your Report</p>
            <p className="text-sm text-slate-500">Analyzing your {questions.length} answers...</p>
          </div>
        </div>
      </div>
    );
  }

  //  INTERVIEW VIEW 
  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Navbar uuid={uuid} />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium">Mock Interview</span>
        </div>

        {/* Progress header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-[#ff6b35] via-[#ff8a5c] to-transparent" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-full text-[10px] font-bold text-[#ff6b35] uppercase tracking-wide mb-1.5">
                  AI Mock Interview
                </div>
                <h1 className="text-base font-black text-slate-900">Question {currentIndex + 1} of {TOTAL_QUESTIONS}</h1>
                <p className="text-xs text-slate-500 mt-0.5">Role: <span className="font-semibold text-slate-700">{role}</span></p>
              </div>

              {/* Progress ring */}
              <div className="relative h-14 w-14 shrink-0">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                  <circle
                    cx="28" cy="28" r="22"
                    stroke="#ff6b35" strokeWidth="5" fill="none"
                    strokeDasharray={`${(currentIndex / TOTAL_QUESTIONS) * 138.2} 138.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#ff6b35]">{progress}%</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff6b35] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Voice not supported warning */}
        {!voiceSupported && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">Voice input not supported</p>
              <p className="text-xs text-amber-700">Please use Chrome or Edge for the best experience.</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Main question card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="h-px bg-gradient-to-r from-[#ff6b35]/20 via-transparent to-transparent" />
          <div className="p-6">

            {isLoadingQuestion ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 rounded-full border-4 border-[#ff6b35]/20 animate-spin" style={{ borderTopColor: "#ff6b35" }} />
                </div>
                <p className="text-sm text-slate-500">Loading question {currentIndex + 1}...</p>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-6">
                {/* Question meta */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="h-7 w-7 rounded-lg bg-[#ff6b35] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {currentIndex + 1}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentQuestion.category}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    currentQuestion.difficulty === "hard"   ? "bg-red-50 text-red-600 border-red-200" :
                    currentQuestion.difficulty === "medium" ? "bg-amber-50 text-amber-600 border-amber-200" :
                    "bg-green-50 text-green-600 border-green-200"
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  {isSpeaking && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-[#ff6b35] font-bold animate-pulse">
                      <Volume2 size={11} /> AI Speaking
                    </span>
                  )}
                </div>

                {/* Question text */}
                <div className="p-5 bg-[#fffaf7] border border-[#ff6b35]/15 rounded-xl">
                  <p className="text-base text-slate-900 font-semibold leading-relaxed">{currentQuestion.question}</p>
                </div>

                {/* Transcript live */}
                {(isListening || transcript) && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[4rem]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your answer</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {transcript || <span className="text-slate-400 italic">Listening...</span>}
                    </p>
                  </div>
                )}

                {/* Mic button */}
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={toggleListening}
                    disabled={isLoadingQuestion || isSpeaking}
                    className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                        : "bg-[#ff6b35] hover:bg-[#e55a28] hover:shadow-xl hover:-translate-y-0.5 shadow-[#ff6b35]/30"
                    }`}
                  >
                    {isListening && (
                      <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                    )}
                    {isListening
                      ? <MicOff size={32} className="text-white" />
                      : <Mic size={32} className="text-white" />
                    }
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    {isSpeaking
                      ? "Wait for AI to finish speaking..."
                      : isListening
                      ? "Tap to stop and submit your answer"
                      : "Tap the mic when ready to answer"}
                  </p>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={replayQuestion}
                      disabled={isSpeaking || isListening}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-40"
                    >
                      <Volume2 size={12} /> Replay
                    </button>
                    <button
                      onClick={skipQuestion}
                      disabled={isLoadingQuestion}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-40"
                    >
                      Skip <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Tips card */}
        {!isLoadingQuestion && currentQuestion && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Interview Tips</p>
            <div className="space-y-2">
              {[
                "Speak clearly and at a natural pace",
                "Use the STAR method for behavioral questions",
                "Take a moment to think before answering",
              ].map((tip) => (
                <div key={tip} className="flex items-center gap-2">
                  <CheckCircle2 size={11} className="text-[#ff6b35] shrink-0" />
                  <p className="text-xs text-slate-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}