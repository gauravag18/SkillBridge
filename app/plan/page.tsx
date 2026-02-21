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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateDayProgress, getOrCreatePlan } from "@/app/actions/progress";

type DayPlan = {
  day: number;
  focus: string;
  tasks: string[];
};

export default function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ uuid?: string }>;
}) {
  const resolvedParams = use(searchParams);

  const [day, setDay] = useState(1);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [uuid, setUuid] = useState("");
  const [saving, setSaving] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [allProgress, setAllProgress] = useState<Record<string, boolean[]>>({});
  const [planData, setPlanData] = useState<DayPlan[]>([]);

  // Set UUID on mount
  useEffect(() => {
    const paramUuid = resolvedParams.uuid;
    const storedUuid = localStorage.getItem("skillbridge_uuid");
    const finalUuid = paramUuid || storedUuid || "";
    if (finalUuid) {
      setUuid(finalUuid);
      if (!storedUuid) localStorage.setItem("skillbridge_uuid", finalUuid);
    }
  }, [resolvedParams.uuid]);

  // Load plan + progress from Supabase
  useEffect(() => {
    if (!uuid) return;

    const load = async () => {
      setPlanLoading(true);
      const result = await getOrCreatePlan(uuid);
      setPlanLoading(false);

      if (result.plan) {
        if (Array.isArray(result.plan.plan_data) && result.plan.plan_data.length > 0) {
          setPlanData(result.plan.plan_data);
        }

        if (result.plan.progress) {
          setAllProgress(result.plan.progress);
          const saved = result.plan.progress[`day1`];
          if (Array.isArray(saved)) setCompleted(saved);
        }
      }
    };

    load();
  }, [uuid]);

  // When day changes load saved progress for that day
  useEffect(() => {
    if (planData.length === 0) return;
    const currentDayPlan = planData.find((d) => d.day === day);
    const taskCount = currentDayPlan?.tasks.length || 3;
    const saved = allProgress[`day${day}`];
    if (Array.isArray(saved)) {
      setCompleted(saved);
    } else {
      setCompleted(Array(taskCount).fill(false));
    }
  }, [day, allProgress, planData]);

  const currentDayPlan = planData.find((d) => d.day === day);
  const tasks = currentDayPlan?.tasks || [];

  const toggle = async (i: number) => {
    if (!uuid) {
      setErrorMsg("No session found. Please start again.");
      return;
    }

    const updated = [...completed];
    updated[i] = !updated[i];
    setCompleted(updated);
    setAllProgress((prev) => ({ ...prev, [`day${day}`]: updated }));

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
    completed.length > 0
      ? (completed.filter((c) => c).length / completed.length) * 100
      : 0;

  const totalCompleted = Object.values(allProgress).filter(
    (d) => Array.isArray(d) && d.length > 0 && d.every(Boolean)
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* NAVBAR */}
      <header className="border-b border-soft bg-white/80 backdrop-blur sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="font-semibold text-[17px]">SkillBridge</Link>
          <Link href={`/dashboard?uuid=${uuid}`}>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* HEADER STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="text-brand" />
              <h3 className="font-semibold">Current Day</h3>
            </div>
            <div className="text-3xl font-semibold text-brand">Day {day} / 30</div>
            <p className="text-sm text-muted mt-2">
              {currentDayPlan?.focus || "Follow daily to reach interview readiness"}
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-brand" />
              <h3 className="font-semibold">Today's Completion</h3>
            </div>
            <div className="text-3xl font-semibold text-brand mb-2">{Math.round(progress)}%</div>
            <div className="progress h-2">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="text-orange-500" />
              <h3 className="font-semibold">Overall Progress</h3>
            </div>
            <div className="text-2xl font-semibold">{totalCompleted} / 30 Days</div>
            <p className="text-sm text-muted mt-2">
              {totalCompleted === 0
                ? "Start your journey today"
                : totalCompleted < 10
                ? "Great start, keep going!"
                : totalCompleted < 20
                ? "Making solid progress!"
                : "Almost there, finish strong!"}
            </p>
          </div>
        </div>

        {/* DAY SELECTOR */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Jump to Day</h2>
          <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const dayProgress = allProgress[`day${i + 1}`];
              const isDone =
                Array.isArray(dayProgress) &&
                dayProgress.length > 0 &&
                dayProgress.every(Boolean);
              return (
                <button
                  key={i}
                  onClick={() => setDay(i + 1)}
                  className={`h-9 rounded-lg text-sm font-medium border
                    ${day === i + 1
                      ? "bg-brand text-white border-brand"
                      : isDone
                      ? "bg-green-100 border-green-400 text-green-700"
                      : "bg-white hover:bg-brand-soft border-soft"}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* TODAY TASKS */}
        <div className="card p-7">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Day {day} — {currentDayPlan?.focus || "..."}</h2>
          </div>

          {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}

          {planLoading ? (
            <div className="flex items-center gap-3 text-muted py-8 justify-center">
              <Loader2 className="animate-spin" size={20} />
              <span>Loading your personalized plan...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted">No personalized plan found.</p>
              <p className="text-sm text-muted">Please re-onboard to generate your plan.</p>
              <Link href="/onboard">
                <Button className="bg-brand text-white mt-2">Re-analyze Resume</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, i) => (
                <div
                  key={i}
                  onClick={() => toggle(i)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-soft hover:bg-brand-soft cursor-pointer transition"
                >
                  {completed[i] ? (
                    <CheckCircle2 className="text-green-500 shrink-0" />
                  ) : (
                    <Circle className="text-muted shrink-0" />
                  )}
                  <span className={completed[i] ? "line-through text-muted" : "text-slate-800"}>
                    {task}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button
            className="mt-6 bg-brand text-white w-full h-11"
            disabled={saving || planLoading || tasks.length === 0}
          >
            {saving ? "Saving..." : "Mark Day Complete"}
          </Button>
        </div>

        {/* WEEK PHASES */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            ["Week 1", "Address Top Skill Gaps"],
            ["Week 2", "Deep Dive & Practice"],
            ["Week 3", "System Design & Architecture"],
            ["Week 4", "Projects, Mocks & Applications"],
          ].map((item, i) => (
            <div key={i} className="card p-5">
              <div className="text-brand font-semibold">{item[0]}</div>
              <div className="text-sm text-muted mt-1">{item[1]}</div>
            </div>
          ))}
        </div>

        {/* RESOURCES */}
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