"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
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
import {
  generateNextInterviewQuestion,
  generateFinalInterviewReport
} from "@/app/actions/interview";


// WRAPPER 
export default function PageWrapper() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading interview...</div>}>
      <MockInterviewPage />
    </Suspense>
  );
}


//---------------- TYPES ----------------
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


//---------------- NAVBAR ----------------
function Navbar({ uuid }: { uuid?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-slate-900">
          SkillBridge
        </Link>

        <Link
          href={uuid ? `/dashboard?uuid=${uuid}` : "/"}
          className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg text-xs"
        >
          Full Analysis
        </Link>
      </div>
    </header>
  );
}


//---------------- MAIN PAGE ----------------
function MockInterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const uuid = searchParams.get("uuid") || "";
  const role = searchParams.get("role") || "Software Engineer";
  const jobDescription = searchParams.get("jobDescription") || null;

  const TOTAL_QUESTIONS = 9;

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const hasLoadedFirst = useRef(false);


  // INIT MIC
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(text);
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
  }, []);


  // LOAD FIRST QUESTION
  useEffect(() => {
    if (!hasLoadedFirst.current && uuid) {
      hasLoadedFirst.current = true;
      loadQuestion(0, []);
    }
  }, [uuid]);


  const loadQuestion = async (index: number, prev: InterviewQuestion[]) => {
    setIsLoadingQuestion(true);

    try {
      const res = await generateNextInterviewQuestion(
        uuid,
        role,
        jobDescription,
        prev.map((q) => q.question),
        index
      );

      if (!res.success || !res.question) {
        throw new Error("Failed to load question");
      }

      const newQuestion: InterviewQuestion = res.question;

      setQuestions((p) => [...p, newQuestion]);
      speakText(res.question.question);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoadingQuestion(false);
    }
  };


  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;

    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  };


  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();

      const answer = transcript || "(No answer)";
      const updated = [...allAnswers, answer];
      setAllAnswers(updated);

      const next = currentIndex + 1;

      if (next < TOTAL_QUESTIONS) {
        setCurrentIndex(next);
        loadQuestion(next, questions);
      } else {
        finishInterview(updated);
      }
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };


  const finishInterview = async (answers: string[]) => {
    setIsGeneratingReport(true);

    try {
      const res = await generateFinalInterviewReport(
        uuid,
        role,
        jobDescription,
        questions.map((q, i) => ({
          question: q.question,
          answer: answers[i]
        }))
      );
      if (!res.success || !res.report) {
        throw new Error("Failed to generate report");
      }

      setFinalReport(res.report as FinalReport);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };


  // LOADING
  if (isGeneratingReport) {
    return <div className="p-10 text-center">Generating Report...</div>;
  }

  // REPORT
  if (finalReport) {
    return (
      <div>
        <Navbar uuid={uuid} />
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold">Score: {finalReport.overall_score}/10</h1>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];


  return (
    <div className="min-h-screen bg-[#faf9f8]">
      <Navbar uuid={uuid} />

      <main className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4">
          Question {currentIndex + 1}/{TOTAL_QUESTIONS}
        </h2>

        {currentQuestion && (
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="mb-6">{currentQuestion.question}</p>

            <button
              onClick={toggleListening}
              className="bg-[#ff6b35] text-white px-6 py-3 rounded-full"
            >
              {isListening ? "Stop" : "Start Speaking"}
            </button>

            {transcript && (
              <p className="mt-4 text-gray-600">{transcript}</p>
            )}
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </main>
    </div>
  );
}