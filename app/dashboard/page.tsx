import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Target,
  FileSearch,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight text-slate-900">SkillBridge</span>
        <Link
          href="/"
          className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg hover:shadow-lg transition-all text-xs"
        >
          Back to Home
        </Link>
      </div>
    </header>
  );
}

function GapPriorityBadge({ pct }: { pct: number }) {
  if (pct >= 70)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <AlertTriangle size={10} /> Critical
      </span>
    );
  if (pct >= 40)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        <TrendingUp size={10} /> High
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
      Medium
    </span>
  );
}

function GapCard({ gap, index }: { gap: any; index: number }) {
  const pct: number = gap.percentage;

  const barColor =
    pct >= 70 ? "#ef4444" : pct >= 40 ? "#f59e0b" : "#3b82f6";

  const bgClass =
    pct >= 70
      ? "bg-red-50 border-red-100"
      : pct >= 40
      ? "bg-yellow-50 border-yellow-100"
      : "bg-blue-50 border-blue-100";

  const hint =
    pct >= 70
      ? "Significant gap — prioritize immediately"
      : pct >= 40
      ? "Moderate gap — address this week"
      : "Minor gap — schedule for later";

  return (
    <div className={`rounded-xl border p-4 ${bgClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: barColor }}
          >
            {index + 1}
          </div>
          <span className="font-semibold text-slate-900 text-sm">{gap.skill}</span>
        </div>
        <GapPriorityBadge pct={pct} />
      </div>

      {/* Segmented bar */}
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 10 }).map((_, i) => {
          const active = pct >= (i + 1) * 10 - 5;
          return (
            <div
              key={i}
              className="flex-1 h-2 rounded-sm"
              style={{ backgroundColor: active ? barColor : "#e2e8f0" }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{hint}</span>
        <span className="text-xs font-bold" style={{ color: barColor }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ uuid?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const uuid = resolvedSearchParams.uuid || "";

  const supabase = await createClient();

  if (!uuid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffcfa]">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-full bg-[#fff3ed] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-[#ff6b35]" size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Session expired</h2>
          <p className="text-slate-500 text-sm mb-6">Please start from the home page.</p>
          <Link
            href="/"
            className="block w-full px-4 py-2.5 bg-[#ff6b35] text-white font-semibold rounded-lg text-sm text-center hover:bg-[#e55a28] transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  await supabase.rpc("set_my_uuid", { p_uuid: uuid });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("uuid", uuid)
    .single();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("profile_uuid", uuid)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffcfa]">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-full bg-[#fff3ed] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-[#ff6b35]" size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Profile not found</h2>
          <p className="text-slate-500 text-sm mb-6">Please complete onboarding first.</p>
          <Link
            href="/onboard"
            className="block w-full px-4 py-2.5 bg-[#ff6b35] text-white font-semibold rounded-lg text-sm text-center hover:bg-[#e55a28] transition-all"
          >
            Go to Onboarding
          </Link>
        </div>
      </div>
    );
  }

  const readiness = analysis?.readiness_score ?? null;
  const jdMatchScore = analysis?.jd_match_score ?? null;
  const targetRole = profile.target_role ?? "Not specified";
  const strengths = analysis?.strengths ?? [];
  const weaknesses = analysis?.weaknesses ?? [];
  const skillGaps = analysis?.skill_gaps ?? [];
  const jdMissingSkills = analysis?.jd_missing_skills ?? [];
  const hasJD = !!profile.job_description;

  const readinessLabel =
    readiness === null
      ? null
      : readiness >= 80
      ? "Interview Ready"
      : readiness >= 60
      ? "Almost There"
      : "Needs Work";

  const readinessColor =
    readiness === null
      ? "#94a3b8"
      : readiness >= 80
      ? "#16a34a"
      : readiness >= 60
      ? "#ca8a04"
      : "#ef4444";

  const estimatedTime =
    readiness === null
      ? "Pending"
      : readiness < 60
      ? "6–8 Weeks"
      : readiness < 80
      ? "3–5 Weeks"
      : "1–3 Weeks";

  const sortedGaps = [...skillGaps].sort(
    (a: any, b: any) => b.percentage - a.percentage
  );
  const criticalCount = sortedGaps.filter((g: any) => g.percentage >= 70).length;

  return (
    <div className="min-h-screen bg-[#fffcfa]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10 space-y-6">

        {/* ── HERO BANNER ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-[180px_1fr_220px]">

            {/* Score ring panel */}
            <div className="flex items-center justify-center p-8 bg-[#fffaf7] border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                  <circle
                    cx="60" cy="60" r="50"
                    stroke="url(#sg)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(readiness ?? 0) * 3.14} 314`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff8a5c" />
                      <stop offset="100%" stopColor="#ff6b35" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-[#ff6b35] leading-none">
                    {readiness ?? "—"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">score</span>
                </div>
              </div>
            </div>

            {/* Info panel */}
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-full text-xs font-medium text-[#ff6b35]">
                  <Zap size={10} className="fill-current" /> AI Analysis
                </span>
                {readinessLabel && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{
                      color: readinessColor,
                      borderColor: readinessColor + "44",
                      backgroundColor: readinessColor + "11",
                    }}
                  >
                    {readinessLabel}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 mb-1">Career Readiness</h1>
              <p className="text-sm text-slate-500 mb-5">
                Analyzed against{" "}
                <span className="font-semibold text-slate-700">{targetRole}</span> expectations
              </p>

              <div className="flex flex-wrap gap-2">
                {hasJD && jdMatchScore !== null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fff3ed] border border-[#ff6b35]/30 rounded-lg">
                    <FileSearch size={13} className="text-[#ff6b35]" />
                    <span className="text-xs font-semibold text-[#ff6b35]">
                      {jdMatchScore}% JD Match
                    </span>
                  </div>
                )}
                {hasJD && jdMatchScore === null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                    <FileSearch size={13} className="text-slate-400" />
                    <span className="text-xs text-slate-400">Analyzing JD...</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <Clock size={13} className="text-slate-400" />
                  <span className="text-xs text-slate-600 font-medium">~{estimatedTime}</span>
                </div>
                {criticalCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
                    <AlertTriangle size={13} className="text-red-500" />
                    <span className="text-xs font-semibold text-red-600">
                      {criticalCount} critical gap{criticalCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA panel */}
            <div className="border-t lg:border-t-0 lg:border-l border-slate-100 bg-[#1a1a1a] p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Your next step</p>
                <p className="text-white font-bold text-sm mb-2">
                  {analysis ? "30-Day Learning Plan" : "Generate Your Plan"}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {analysis
                    ? "Follow your roadmap to close skill gaps fast."
                    : "Complete onboarding to generate your roadmap."}
                </p>
              </div>
              <Link href={`/plan?uuid=${uuid}`} className="block mt-6">
                <div className="w-full bg-[#ff6b35] hover:bg-[#e55a28] text-white font-semibold py-2.5 rounded-xl text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2">
                  {analysis ? "View Plan" : "Get Started"}
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>

          </div>
        </div>

        {/* ── METRIC STRIP ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Interview Readiness",
              value: readiness !== null ? `${readiness}%` : "—",
              bar: readiness,
            },
            {
              label: "JD Match Score",
              value: hasJD
                ? jdMatchScore !== null
                  ? `${jdMatchScore}%`
                  : "Pending"
                : "No JD",
              bar: hasJD ? jdMatchScore : null,
            },
            {
              label: "Skill Gaps Found",
              value: skillGaps.length > 0 ? `${skillGaps.length}` : "—",
              bar: null,
            },
            {
              label: "Est. Ready In",
              value: estimatedTime,
              bar: null,
            },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-400 mb-1">{m.label}</p>
              <p className="text-lg font-bold text-slate-900 mb-2">{m.value}</p>
              {m.bar !== null && (
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff6b35] rounded-full"
                    style={{ width: `${m.bar}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Left */}
          <div className="space-y-6">

            {/* JD Match */}
            {hasJD && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                      <FileSearch size={15} className="text-[#ff6b35]" />
                    </div>
                    JD Match Analysis
                  </h2>
                  {jdMatchScore !== null && (
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        jdMatchScore >= 70
                          ? "bg-green-100 text-green-700"
                          : jdMatchScore >= 40
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {jdMatchScore}% match
                    </span>
                  )}
                </div>
                {jdMissingSkills.length > 0 ? (
                  <>
                    <p className="text-sm text-slate-500 mb-4">
                      These skills from the job description are missing or weak in your resume:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {jdMissingSkills.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    {jdMatchScore !== null
                      ? "Your resume covers all key requirements from the job description."
                      : "JD analysis pending."}
                  </p>
                )}
              </div>
            )}

            {/* ── SKILL GAP ANALYSIS ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                    <BarChart3 size={15} className="text-[#ff6b35]" />
                  </div>
                  Skill Gap Analysis
                </h2>
                {sortedGaps.length > 0 && (
                  <span className="text-xs text-slate-400 font-medium">
                    {sortedGaps.length} gap{sortedGaps.length > 1 ? "s" : ""} · by severity
                  </span>
                )}
              </div>

              {sortedGaps.length > 0 ? (
                <>
                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-2 mb-5">
                    {[
                      { color: "#ef4444", label: "Critical ≥70%" },
                      { color: "#f59e0b", label: "High ≥40%" },
                      { color: "#3b82f6", label: "Medium <40%" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: l.color }}
                        />
                        <span className="text-xs text-slate-400">{l.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {sortedGaps.map((gap: any, i: number) => (
                      <GapCard key={i} gap={gap} index={i} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <BarChart3 size={22} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">No skill gaps detected yet</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Complete your resume analysis to see results
                  </p>
                </div>
              )}
            </div>

            {/* Strengths + Weaknesses */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Strengths
                </h2>
                {strengths.length > 0 ? (
                  <div className="space-y-2">
                    {strengths.map((s: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2"
                      >
                        <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Complete analysis to see your strengths.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <AlertCircle size={16} className="text-red-400" />
                  Areas to Improve
                </h2>
                {weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {weaknesses.map((w: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                      >
                        <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                        {w}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Complete analysis to see areas to improve.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Recommendation */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                <div className="h-6 w-6 rounded-md bg-[#fff3ed] flex items-center justify-center">
                  <Zap size={12} className="text-[#ff6b35] fill-current" />
                </div>
                Recommendation
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {readiness !== null
                  ? readiness < 70
                    ? "Prioritize top skill gaps and daily DSA practice."
                    : "You're close — focus on projects and behavioral prep."
                  : "Complete analysis to get personalized recommendations."}
              </p>
            </div>

            {/* JD Targeting */}
            {hasJD && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                  <div className="h-6 w-6 rounded-md bg-[#fff3ed] flex items-center justify-center">
                    <Target size={12} className="text-[#ff6b35]" />
                  </div>
                  JD Targeting
                </h3>
                <p className="text-sm text-slate-500 mb-3">
                  Analysis tailored to the job description you provided.
                </p>
                {jdMatchScore !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Match Score</span>
                    <span
                      className={`font-bold text-lg ${
                        jdMatchScore >= 70
                          ? "text-green-600"
                          : jdMatchScore >= 40
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {jdMatchScore}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 30-Day CTA */}
            <div className="bg-[#1a1a1a] rounded-2xl p-5 text-white shadow-lg">
              <h3 className="font-bold mb-1 text-sm">Next Step</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {analysis
                  ? "Follow your personalized 30-day roadmap to close skill gaps fast."
                  : "Complete onboarding to generate your roadmap."}
              </p>
              <Link href={`/plan?uuid=${uuid}`} className="block">
                <div className="w-full bg-[#ff6b35] hover:bg-[#e55a28] text-white font-semibold py-2.5 rounded-lg text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2">
                  {analysis ? "View 30-Day Plan" : "Generate 30-Day Plan"}
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}