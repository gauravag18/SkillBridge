"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  RefreshCcw,
  Target,
  TrendingUp,
  AlertCircle,
  FileText,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Navbar() {
  return (
    <header className="border-b border-orange-100 bg-white/90 backdrop-blur-md sticky top-0 z-50 h-16 flex items-center shadow-sm">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 w-full flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
          SkillBridge
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-full hover:bg-orange-700 transition-all shadow-sm hover:shadow-md text-sm"
        >
          Back to Home
        </Link>
      </div>
    </header>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  const readiness = 72;
  const targetRole = "Software Engineer";

  const strengths = [
    "Strong problem-solving with 300+ LeetCode problems",
    "Full-stack experience with MERN stack",
    "Good understanding of REST APIs",
    "Active GitHub profile with 15+ projects",
  ];

  const weaknesses = [
    "Limited system design knowledge",
    "No experience with cloud platforms (AWS/Azure)",
    "Weak DSA fundamentals in graphs and DP",
    "Missing database optimization skills",
  ];

  const skillGaps = [
    { skill: "System Design", priority: "High", percentage: 80 },
    { skill: "Data Structures & Algorithms", priority: "High", percentage: 65 },
    { skill: "AWS/Cloud Computing", priority: "Medium", percentage: 55 },
    { skill: "Database Optimization", priority: "Medium", percentage: 45 },
    { skill: "Docker & Kubernetes", priority: "Low", percentage: 30 },
  ];

  const generatePlan = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/plan";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-sm font-medium text-orange-700 mb-5">
            <Zap size={16} className="fill-current" />
            AI-Powered Career Analysis
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Career Readiness Dashboard
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Your profile analysis for <strong className="text-orange-700">{targetRole}</strong> roles • India 2026 market
          </p>
        </div>

        {/* Top Stats – 3 equal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Readiness Score */}
          <div className="bg-white rounded-2xl border border-orange-100 p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-slate-600">Readiness Score</span>
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-extrabold text-orange-600">{readiness}</span>
              <span className="text-2xl font-bold text-orange-700/80">%</span>
            </div>
            <div className="w-full h-2.5 bg-orange-50 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-1000"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-auto">Industry benchmark: ~75%</p>
          </div>

          {/* Target Role */}
          <div className="bg-white rounded-2xl border border-orange-100 p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-slate-600">Target Role</span>
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-slate-900">{targetRole}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                Off-Campus 2026
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                India Market
              </span>
            </div>
          </div>

          {/* Resume Status */}
          <div className="bg-white rounded-2xl border border-orange-100 p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-slate-600">Resume</span>
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mb-4">
              <span className="text-sm text-slate-700">
                Last analyzed: <span className="font-semibold text-slate-900">Today</span>
              </span>
            </div>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11 rounded-full shadow-sm hover:shadow-md transition-all mt-auto"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </div>
        </div>

        {/* Main Content – Skill Gaps + Generate Plan */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 mb-12 items-stretch">
          {/* Skill Gaps – takes 3/5 */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-orange-100 p-7 lg:p-9 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-orange-50 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Skill Gap Analysis</h2>
                  <p className="text-sm text-slate-600">Priority areas to focus on</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-orange-50 text-orange-700 text-sm font-medium rounded-full border border-orange-200">
                Top 5 Priorities
              </span>
            </div>

            <div className="space-y-6 flex-1">
              {skillGaps.map((gap, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-700 text-sm font-semibold">
                        {i + 1}
                      </span>
                      <span className="text-lg font-semibold text-slate-900">{gap.skill}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">{gap.percentage}% gap</span>
                      <span
                        className={cn(
                          "px-3.5 py-1.5 text-xs font-semibold rounded-full",
                          gap.priority === "High"
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : gap.priority === "Medium"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        )}
                      >
                        {gap.priority}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-orange-50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        gap.priority === "High"
                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                          : gap.priority === "Medium"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                      )}
                      style={{ width: `${gap.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-orange-50/40 rounded-xl border border-orange-100">
              <p className="text-slate-700 leading-relaxed">
                <strong className="text-orange-800">Focus Recommendation:</strong> Start with High priority gaps.
                System Design and strong DSA skills are still among the top requirements in 2026 product company interviews.
              </p>
            </div>
          </div>

          {/* Generate Plan – takes 2/5 – sticky on large screens */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-gradient-to-br from-orange-50/80 to-white border-2 border-orange-200 rounded-2xl p-8 lg:p-10 shadow-md hover:shadow-lg transition-all lg:sticky lg:top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Generate Your 30-Day Plan</h2>
                  <p className="text-sm text-slate-600">AI-Personalized Roadmap</p>
                </div>
              </div>

              <p className="text-slate-700 mb-7 leading-relaxed">
                Receive a tailored 30-day roadmap to close your skill gaps and boost readiness to <strong className="text-orange-700">85%+</strong>.
              </p>

              <div className="space-y-4 mb-8 bg-white/70 rounded-xl p-6 border border-orange-100">
                {[
                  "Daily targeted LeetCode + DSA practice plan",
                  "Structured system design case studies & patterns",
                  "Hands-on cloud projects with real deployment",
                  "Hand-picked high-quality learning resources",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={generatePlan}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white h-14 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCcw className="mr-3 h-5 w-5 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    Create My 30-Day Plan
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="mt-6 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-orange-600" />
                <span>Powered by advanced AI • Tailored for {targetRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses – same height */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Strengths */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-7 lg:p-9 shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-7">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Your Key Strengths</h2>
            </div>

            <div className="space-y-4 flex-1">
              {strengths.map((strength, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-emerald-50/40 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">{strength}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-slate-700">
                <strong className="text-emerald-800">Keep building on these!</strong> These are your strongest assets in interviews and resume screening.
              </p>
            </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-2xl border border-rose-100 p-7 lg:p-9 shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-7">
              <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Areas to Improve</h2>
            </div>

            <div className="space-y-4 flex-1">
              {weaknesses.map((weakness, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-rose-50/40 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle size={16} className="text-rose-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">{weakness}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-rose-50 rounded-xl border border-rose-100">
              <p className="text-slate-700">
                <strong className="text-rose-800">Target these first:</strong> These gaps appear frequently in 2026 job descriptions for product-based companies.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}