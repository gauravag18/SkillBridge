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
  ArrowRight,
  Zap,
} from "lucide-react";
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

  useEffect(() => {
    const paramUuid = resolvedParams.uuid;
    const storedUuid = localStorage.getItem("skillbridge_uuid");
    const finalUuid = paramUuid || storedUuid || "";
    if (finalUuid) {
      setUuid(finalUuid);
      if (!storedUuid) localStorage.setItem("skillbridge_uuid", finalUuid);
    }
  }, [resolvedParams.uuid]);

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
    if (!uuid) { setErrorMsg("No session found. Please start again."); return; }
    const updated = [...completed];
    updated[i] = !updated[i];
    setCompleted(updated);
    setAllProgress((prev) => ({ ...prev, [`day${day}`]: updated }));
    setSaving(true);
    setErrorMsg("");
    const result = await updateDayProgress(uuid, day, updated);
    setSaving(false);
    if (result?.error) { setErrorMsg(result.error); setCompleted(completed); }
  };

  const progress =
    completed.length > 0
      ? (completed.filter((c) => c).length / completed.length) * 100
      : 0;

  const totalCompleted = Object.values(allProgress).filter(
    (d) => Array.isArray(d) && d.length > 0 && d.every(Boolean)
  ).length;

  const overallPct = Math.round((totalCompleted / 30) * 100);

  // Streak: consecutive completed days ending at current day
  const streak = (() => {
    let s = 0;
    for (let d = day; d >= 1; d--) {
      const dp = allProgress[`day${d}`];
      if (Array.isArray(dp) && dp.length > 0 && dp.every(Boolean)) s++;
      else break;
    }
    return s;
  })();

  // Daily tips rotating by day
  const tips = [
    "Focus beats multitasking, one concept deeply understood beats three skimmed.",
    "Code what you learn today. Reading alone doesn't stick.",
    "Struggle with a problem for 20 min before looking up — that's how intuition forms.",
    "Review yesterday's notes for 5 min before starting today.",
    "Teach it back: explain the concept out loud as if teaching someone else.",
    "Take a 5 min walk between tasks. Your brain consolidates learning at rest.",
    "Consistency beats intensity. 2 solid hours daily beats 10 hours on weekends.",
  ];
  const todayTip = tips[(day - 1) % tips.length];

  // Confetti on day completion
  const [showConfetti, setShowConfetti] = useState(false);
  const isDayDone = completed.length > 0 && completed.every(Boolean);

  const toggleWithConfetti = async (i: number) => {
    const updated = [...completed];
    updated[i] = !updated[i];
    const allDone = updated.length > 0 && updated.every(Boolean);
    if (allDone && !isDayDone) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
    await toggle(i);
  };

  return (
    <div className="min-h-screen bg-[#fffcfa] relative">

      {/* Confetti burst */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-999 overflow-hidden">
          {Array.from({ length: 48 }).map((_, i) => {
            const colors = ["#ff6b35","#ff8a5c","#ffd700","#22c55e","#3b82f6","#a855f7","#ec4899"];
            const color = colors[i % colors.length];
            const shapes = ["rounded-sm","rounded-full",""];
            const shape = shapes[i % 3];
            return (
              <div
                key={i}
                className={"absolute top-0 " + shape}
                style={{
                  left: (Math.random() * 100).toFixed(1) + "%",
                  width: (6 + (i % 8)) + "px",
                  height: (6 + (i % 8)) + "px",
                  backgroundColor: color,
                  animation: "confettiFall " + (1.2 + (i % 6) * 0.15).toFixed(2) + "s " + (i * 0.04).toFixed(2) + "s ease-in forwards",
                }}
              />
            );
          })}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-2xl border-2 border-[#ff6b35] shadow-2xl px-8 py-5 text-center">
              <div className="text-3xl mb-1">🎉</div>
              <p className="text-base font-bold text-slate-900">Day {day} Complete!</p>
              <p className="text-xs text-slate-500 mt-0.5">Keep the streak going!</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
        }
      `}</style>

      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-slate-900">SkillBridge</span>
          <Link
            href={`/dashboard?uuid=${uuid}`}
            className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg hover:shadow-lg transition-all text-xs"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10 space-y-6">

        {/* ── HERO BANNER ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_auto]">
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-full text-xs font-medium text-[#ff6b35]">
                  <Zap size={10} className="fill-current" /> 30-Day Roadmap
                </span>
                {streak >= 2 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 border border-orange-200 rounded-full text-xs font-bold text-orange-600">
                    🔥 {streak}-day streak
                  </span>
                )}
                {streak >= 7 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 border border-yellow-200 rounded-full text-xs font-bold text-yellow-700">
                    🏆 On fire!
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Your Learning Plan</h1>
              <p className="text-sm text-slate-500 mb-5">
                {currentDayPlan?.focus
                  ? <>Today: <span className="font-semibold text-slate-700">{currentDayPlan.focus}</span></>
                  : "Follow daily tasks to reach interview readiness"}
              </p>

              {/* Overall progress bar */}
              <div className="max-w-md">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400">Overall progress</span>
                  <span className="text-xs font-bold text-[#ff6b35]">{totalCompleted}/30 days</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff6b35] rounded-full transition-all"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stat trio — with streak */}
            <div className="border-t lg:border-t-0 lg:border-l border-slate-100 grid grid-cols-3 lg:grid-cols-1 divide-x lg:divide-x-0 lg:divide-y divide-slate-100">
              {[
                { icon: CalendarDays, label: "Current Day", value: `${day} / 30`, color: "text-[#ff6b35]" },
                { icon: Target, label: "Today", value: `${Math.round(progress)}%`, color: "text-[#ff6b35]" },
                { icon: Flame, label: "Streak", value: streak > 0 ? `${streak} days` : "—", color: "text-orange-500" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="p-5 flex flex-col items-center lg:items-start gap-1 min-w-30">
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} className={color} />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                  <span className={`text-xl font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 30-DAY VISUAL TIMELINE ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays size={14} className="text-[#ff6b35]" />
              30-Day Map
            </h2>
            <div className="flex items-center gap-3">
              {[
                { color: "bg-[#ff6b35]", label: "Today" },
                { color: "bg-green-400", label: "Done" },
                { color: "bg-slate-200", label: "Upcoming" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 30 }, (_, i) => {
              const d = i + 1;
              const dp = allProgress[`day${d}`];
              const isDone = Array.isArray(dp) && dp.length > 0 && dp.every(Boolean);
              const isCurrent = d === day;
              const isPartial = Array.isArray(dp) && dp.some(Boolean) && !isDone;
              return (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  title={`Day ${d}`}
                  className="relative flex-1 group"
                >
                  <div
                    className={`h-8 rounded transition-all ${
                      isCurrent
                        ? "bg-[#ff6b35] shadow-md scale-y-110"
                        : isDone
                        ? "bg-green-400"
                        : isPartial
                        ? "bg-orange-200"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  />
                  {/* Day label — show every 5 */}
                  {d % 5 === 0 && (
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400">{d}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6" />
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">

          {/* Left — Day selector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-20">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarDays size={14} className="text-[#ff6b35]" />
              Jump to Day
            </h2>

            {/* Week groups */}
            {[
              { label: "Week 1", days: [1,2,3,4,5,6,7] },
              { label: "Week 2", days: [8,9,10,11,12,13,14] },
              { label: "Week 3", days: [15,16,17,18,19,20,21] },
              { label: "Week 4", days: [22,23,24,25,26,27,28,29,30] },
            ].map(({ label, days }) => (
              <div key={label} className="mb-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {days.map((d) => {
                    const dp = allProgress[`day${d}`];
                    const isDone = Array.isArray(dp) && dp.length > 0 && dp.every(Boolean);
                    const isCurrent = day === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setDay(d)}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold border transition-all
                          ${isCurrent
                            ? "bg-[#ff6b35] text-white border-[#ff6b35] shadow-sm"
                            : isDone
                            ? "bg-green-100 border-green-300 text-green-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-[#ff6b35]/40 hover:bg-[#fff3ed]"
                          }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5">
              {[
                { color: "bg-[#ff6b35]", label: "Current day" },
                { color: "bg-green-400", label: "Completed" },
                { color: "bg-slate-200", label: "Not started" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Tasks + extras */}
          <div className="space-y-6">

            {/* Task card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              {/* Day header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 w-7 rounded-lg bg-[#ff6b35] flex items-center justify-center text-white text-xs font-bold">
                      {day}
                    </div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Day {day} of 30</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentDayPlan?.focus || (planLoading ? "Loading..." : "Tasks")}
                  </h2>
                </div>

                {/* Today's mini progress ring */}
                <div className="relative h-12 w-12 shrink-0">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                    <circle
                      cx="20" cy="20" r="16"
                      stroke="#ff6b35"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${progress * 1.005} 100.5`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#ff6b35]">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <p className="text-red-600 text-sm mb-4 px-3 py-2 bg-red-50 rounded-lg border border-red-100">{errorMsg}</p>
              )}

              {planLoading ? (
                <div className="flex items-center gap-3 text-slate-400 py-12 justify-center">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-sm">Loading your personalized plan...</span>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <BookOpen size={22} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">No personalized plan found</p>
                  <p className="text-xs text-slate-300">Please re-onboard to generate your plan.</p>
                  <Link
                    href="/onboard"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg text-sm hover:bg-[#e55a28] transition-all"
                  >
                    Re-analyze Resume <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task, i) => (
                    <div
                      key={i}
                      onClick={() => toggleWithConfetti(i)}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all
                        ${completed[i]
                          ? "bg-green-50 border-green-200"
                          : "bg-slate-50 border-slate-200 hover:border-[#ff6b35]/40 hover:bg-[#fff3ed]"
                        }`}
                    >
                      {completed[i] ? (
                        <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle size={18} className="text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm leading-relaxed ${
                          completed[i] ? "line-through text-slate-400" : "text-slate-700"
                        }`}
                      >
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Daily tip */}
              <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-[#fff3ed] border border-[#ff6b35]/20">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <p className="text-xs font-semibold text-[#ff6b35] mb-0.5">Tip for Day {day}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{todayTip}</p>
                </div>
              </div>

              {tasks.length > 0 && (
                <button
                  disabled={saving || planLoading}
                  className="mt-5 w-full bg-[#ff6b35] hover:bg-[#e55a28] disabled:opacity-50 text-white font-semibold h-11 rounded-xl text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <>Mark Day Complete <ArrowRight size={14} /></>
                  )}
                </button>
              )}
            </div>

            {/* Week phases */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#fff3ed] flex items-center justify-center">
                  <CalendarDays size={13} className="text-[#ff6b35]" />
                </div>
                30-Day Phases
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { week: "Week 1", focus: "Address Top Skill Gaps", days: "Days 1–7" },
                  { week: "Week 2", focus: "Deep Dive & Practice", days: "Days 8–14" },
                  { week: "Week 3", focus: "System Design & Architecture", days: "Days 15–21" },
                  { week: "Week 4", focus: "Projects, Mocks & Applications", days: "Days 22–30" },
                ].map(({ week, focus, days }) => {
                  const weekNum = parseInt(week.split(" ")[1]);
                  const startDay = (weekNum - 1) * 7 + 1;
                  const endDay = weekNum === 4 ? 30 : weekNum * 7;
                  const weekDays = Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);
                  const weekDone = weekDays.filter((d) => {
                    const dp = allProgress[`day${d}`];
                    return Array.isArray(dp) && dp.length > 0 && dp.every(Boolean);
                  }).length;
                  const weekPct = Math.round((weekDone / weekDays.length) * 100);
                  const isCurrentWeek = day >= startDay && day <= endDay;

                  return (
                    <div
                      key={week}
                      className={`rounded-xl border p-4 transition-all ${
                        isCurrentWeek
                          ? "border-[#ff6b35]/40 bg-[#fff3ed]"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wide ${isCurrentWeek ? "text-[#ff6b35]" : "text-slate-400"}`}>
                          {week}
                        </span>
                        <span className="text-xs text-slate-400">{days}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mb-2">{focus}</p>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ff6b35] rounded-full transition-all"
                          style={{ width: `${weekPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{weekDone}/{weekDays.length} days done</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 text-white shadow-lg">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#ff6b35]/20 flex items-center justify-center">
                  <BookOpen size={13} className="text-[#ff6b35]" />
                </div>
                Recommended Resources
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: BookOpen, label: "Striver DSA Sheet" },
                  { icon: BookOpen, label: "System Design Primer" },
                  { icon: Trophy, label: "Blind 75 Problems" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <Icon size={15} className="text-[#ff6b35] shrink-0" />
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}