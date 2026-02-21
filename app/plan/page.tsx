"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Flame,
  CalendarDays,
  Target,
  BookOpen,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateDayProgress } from "@/app/actions/progress";

const plan30 = [
  ["Time Complexity + Big O", "Solve 2 Easy Arrays", "Learn Binary Search"],
  ["Binary Search Practice", "2 Problems", "Revision"],
  ["Linked List Basics", "Reverse LL", "1 Problem"],
  ["Stacks & Queues", "Valid Parenthesis", "1 Problem"],
  ["Recursion Intro", "Factorial + Fibonacci", "1 Problem"],
  ["Sliding Window", "2 Problems", "Notes"],
  ["Weekly Revision", "Mock Practice", "Weak Areas"],

  ["DBMS Normalization", "SQL Joins", "1 Query Practice"],
  ["Operating System Basics", "Processes vs Threads", "Notes"],
  ["Memory Management", "Paging vs Segmentation", "Revise"],
  ["Computer Networks Intro", "OSI Model", "Ports"],
  ["HTTP & REST APIs", "Status Codes", "Hands-on"],
  ["Authentication", "JWT + Cookies", "Mini Task"],
  ["Weekly Revision", "Flashcards", "Quiz"],

  ["System Design Basics", "Scalability", "CAP Theorem"],
  ["Load Balancers", "Horizontal Scaling", "Notes"],
  ["Databases", "SQL vs NoSQL", "When to Use"],
  ["Caching", "Redis Concept", "Example"],
  ["Message Queues", "Kafka Basics", "Flow"],
  ["Design WhatsApp", "Architecture", "Draw Diagram"],
  ["Weekly Revision", "Explain to yourself", "Practice"],

  ["Build REST API", "CRUD Backend", "Test"],
  ["Deploy Project", "Render/EC2", "Live URL"],
  ["Docker Intro", "Containerize App", "Run"],
  ["Behavioral Prep", "HR Questions", "STAR Method"],
  ["Mock Interview", "DSA Round", "Review"],
  ["Resume Polish", "ATS Fix", "Projects Section"],
  ["Apply to Companies", "5 Applications", "Track"],
  ["Follow Ups", "LinkedIn Messages", "Referrals"],
  ["Second Mock", "System Design", "Improve"],
  ["Final Revision", "Important Notes", "Confidence"],
];

export default function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ uuid?: string }>;
}) {
  const resolvedParams = use(searchParams);

  const [day, setDay] = useState(1);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const [uuid, setUuid] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const paramUuid = resolvedParams.uuid;
    const storedUuid = localStorage.getItem("skillbridge_uuid");
    const finalUuid = paramUuid || storedUuid || "";

    if (finalUuid) {
      setUuid(finalUuid);
      if (!storedUuid) localStorage.setItem("skillbridge_uuid", finalUuid);
    }
  }, [resolvedParams.uuid]);

  const tasks = plan30[day - 1] || [];

  const toggle = async (i: number) => {
    if (!uuid) {
      setErrorMsg("No session found. Please start again.");
      return;
    }

    const updated = [...completed];
    updated[i] = !updated[i];
    setCompleted(updated);

    setSaving(true);
    setErrorMsg("");

    const result = await updateDayProgress(uuid, day, updated);

    setSaving(false);

    if (result?.error) {
      setErrorMsg(result.error);
      setCompleted(completed);
    }
  };

  const progress =
    (completed.filter((c) => c).length / completed.length) * 100;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* NAVBAR */}
      <header className="border-b border-soft bg-white/80 backdrop-blur sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="font-semibold text-[17px]">
            SkillBridge
          </Link>

          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* HEADER*/}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Day Tracker */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="text-brand" />
              <h3 className="font-semibold">Current Day</h3>
            </div>
            <div className="text-3xl font-semibold text-brand">
              Day {day} / 30
            </div>
            <p className="text-sm text-muted mt-2">
              Follow daily to reach interview readiness
            </p>
          </div>

          {/* Progress */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-brand" />
              <h3 className="font-semibold">Today's Completion</h3>
            </div>
            <div className="text-3xl font-semibold text-brand mb-2">
              {Math.round(progress)}%
            </div>

            <div className="progress h-2">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Motivation */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="text-orange-500" />
              <h3 className="font-semibold">Goal</h3>
            </div>
            <div className="text-2xl font-semibold">
              85% Job Ready
            </div>
            <p className="text-sm text-muted mt-2">
              Approx 3–4 weeks if consistent
            </p>
          </div>
        </div>

        {/* DAY SELECTOR*/}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Jump to Day</h2>
          <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
            {Array.from({ length: 30 }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDay(i + 1);
                  setCompleted(Array(plan30[i]?.length || 3).fill(false));
                }}
                className={`h-9 rounded-lg text-sm font-medium border 
                  ${day === i + 1
                    ? "bg-brand text-white border-brand"
                    : "bg-white hover:bg-brand-soft border-soft"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/*TODAY TASKS*/}
        <div className="card p-7">
          <h2 className="text-xl font-semibold mb-6">
            Today's Focus (Day {day})
          </h2>

          {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}

          <div className="space-y-4">
            {tasks.map((task, i) => (
              <div
                key={i}
                onClick={() => toggle(i)}
                className="flex items-center gap-4 p-4 rounded-xl border border-soft hover:bg-brand-soft cursor-pointer transition"
              >
                {completed[i] ? (
                  <CheckCircle2 className="text-green-500" />
                ) : (
                  <Circle className="text-muted" />
                )}

                <span
                  className={`${
                    completed[i]
                      ? "line-through text-muted"
                      : "text-slate-800"
                  }`}
                >
                  {task}
                </span>
              </div>
            ))}
          </div>

          <Button
            className="mt-6 bg-brand text-white w-full h-11"
            disabled={saving}
          >
            {saving ? "Saving..." : "Mark Day Complete"}
          </Button>
        </div>

        {/*WEEK PHASES*/}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            ["Week 1", "DSA Foundation"],
            ["Week 2", "Core CS Subjects"],
            ["Week 3", "System Design"],
            ["Week 4", "Projects & Interviews"],
          ].map((item, i) => (
            <div key={i} className="card p-5">
              <div className="text-brand font-semibold">{item[0]}</div>
              <div className="text-sm text-muted mt-1">{item[1]}</div>
            </div>
          ))}
        </div>

        {/*RESOURCE SECTION*/}
        <div className="card p-7">
          <h2 className="text-xl font-semibold mb-5">Recommended Resources</h2>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg border border-soft">
              <BookOpen className="text-brand mb-2" />
              Striver DSA Sheet
            </div>
            <div className="p-4 rounded-lg border border-soft">
              <BookOpen className="text-brand mb-2" />
              System Design Primer
            </div>
            <div className="p-4 rounded-lg border border-soft">
              <Trophy className="text-brand mb-2" />
              Blind 75 Problems
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}