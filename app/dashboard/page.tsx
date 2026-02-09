"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Calendar,
} from "lucide-react";

/* ---------------- NAVBAR ---------------- */

function Navbar() {
  return (
    <header className="border-b border-soft bg-white/80 backdrop-blur sticky top-0 z-50 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        <Link href="/" className="font-semibold text-[17px] tracking-tight text-slate-900">
          SkillBridge
        </Link>

        <Link
          href="/"
          className="px-4 py-2 bg-brand-soft text-brand font-medium rounded-lg hover:bg-brand-soft-2 transition-all text-sm"
        >
          Back to Home
        </Link>
      </div>
    </header>
  );
}

/* ---------------- PAGE ---------------- */

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
    "No cloud deployment experience",
    "Weak DSA fundamentals in graphs and DP",
    "Missing database optimization skills",
  ];

  const skillGaps = [
    { skill: "System Design", percentage: 80 },
    { skill: "Data Structures & Algorithms", percentage: 65 },
    { skill: "AWS / Cloud", percentage: 55 },
    { skill: "Database Optimization", percentage: 45 },
  ];

  const generatePlan = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/plan";
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ---------------- HERO SCORE ---------------- */}
        <div className="card p-8 lg:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-10 mb-10">

          {/* Score Circle */}
          <div className="flex items-center gap-8">
            <div className="relative h-40 w-40 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="url(#grad)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${readiness * 3.27} 327`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad">
                    <stop offset="0%" stopColor="#ff8a5c" />
                    <stop offset="100%" stopColor="#ff6b35" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="text-center">
                <div className="text-5xl font-semibold text-brand">{readiness}</div>
                <div className="text-sm text-muted">Match Score</div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                Career Readiness
              </h1>
              <p className="text-muted">
                Based on your profile vs {targetRole} role expectations
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full lg:w-[240px]">
            <Button className="bg-brand text-white h-11 rounded-lg">
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </Button>

            <Button variant="outline" className="h-11 rounded-lg border-soft">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Re-analyze
            </Button>

            <Button
              onClick={generatePlan}
              className="h-11 rounded-lg"
              variant="outline"
            >
              View Learning Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ---------------- MAIN GRID ---------------- */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">

            {/* Skill Gap */}
            <div className="card p-7">
              <h2 className="text-xl font-semibold flex items-center gap-3 mb-6">
                <BarChart3 className="text-brand" />
                Skill Gap Analysis
              </h2>

              <div className="space-y-5">
                {skillGaps.map((gap, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{gap.skill}</span>
                      <span className="text-muted">{gap.percentage}% gap</span>
                    </div>

                    <div className="progress h-2">
                      <div
                        className="progress-fill"
                        style={{ width: `${gap.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="card p-7">
              <h2 className="text-xl font-semibold flex items-center gap-3 mb-5">
                <CheckCircle2 className="text-green-500" />
                Strengths
              </h2>

              <div className="space-y-3">
                {strengths.map((s, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="card p-7">
              <h2 className="text-xl font-semibold flex items-center gap-3 mb-5">
                <AlertCircle className="text-red-500" />
                Areas to Improve
              </h2>

              <div className="space-y-3">
                {weaknesses.map((w, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm">
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            {/* Insight */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-3">Insight</h3>
              <p className="text-sm text-muted leading-relaxed">
                You're close to interview-ready. Improving System Design and DSA
                could significantly increase your interview success rate.
              </p>
            </div>

            {/* Top Gap */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Top Skill Gap</h3>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>System Design</span>
                  <span className="text-brand font-medium">High</span>
                </div>

                <div className="progress h-2">
                  <div className="progress-fill" style={{ width: "80%" }} />
                </div>
              </div>
            </div>

            {/* Reminder */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-3">Recommendation</h3>
              <p className="text-sm text-muted">
                Practice 2 DSA problems daily and study 1 system design concept
                per day to reach 85% readiness within ~3 weeks.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
