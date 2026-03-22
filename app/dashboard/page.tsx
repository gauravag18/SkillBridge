"use server";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Target,
  FileSearch,
  Clock,
  TrendingUp,
  AlertTriangle,
  Github,
  Users,
  Star,
  Code,
  BookOpen,
  Activity,
  ChevronRight,
} from "lucide-react";

const tierConfig = {
  critical: {
    bar: "#EA580C",     
    bg: "bg-white",
    border: "border-orange-100",
    badge: "bg-[#FFF7ED] text-[#EA580C] border-[#EA580C]/20",
    track: "bg-orange-100",
    label: "Critical",
    hint: "Prioritize immediately",
    numBg: "bg-[#EA580C]",
    icon: <AlertTriangle size={9} />,
  },
  high: {
    bar: "#D97706",        // warm amber
    bg: "bg-white",
    border: "border-amber-100",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    track: "bg-amber-100",
    label: "High",
    hint: "Address this week",
    numBg: "bg-amber-600",
    icon: <TrendingUp size={9} />,
  },
  medium: {
    bar: "#1E3A8A",        // navy blue (brand secondary)
    bg: "bg-white",
    border: "border-blue-100",
    badge: "bg-[#EFF6FF] text-[#1E3A8A] border-[#1E3A8A]/20",
    track: "bg-blue-100",
    label: "Medium",
    hint: "Schedule for later",
    numBg: "bg-[#1E3A8A]",
    icon: null,
  },
} as const;

function Navbar() {
  return (
    <header className="clean-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 hover:text-[#EA580C] transition-colors">
          SkillBridge
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/resume-improve" className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors hidden sm:block">
            Resume Coach
          </Link>
          <Link href="/" className="px-4 py-2 bg-[#EA580C] text-white font-semibold rounded-lg transition-all hover:bg-[#C2410C] text-xs">
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}

function GapCard({ gap, index }: { gap: any; index: number }) {
  const pct: number = gap.percentage;
  const tier =
    pct >= 70 ? "critical"
    : pct >= 40 ? "high"
    : "medium";

  const config = tierConfig[tier];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 hover:shadow-sm transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${config.numBg}`}>
            {index + 1}
          </div>
          <span className="font-semibold text-slate-800 text-sm">{gap.skill}</span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${config.badge}`}>
          {config.icon} {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className={`h-2 ${config.track} rounded-full overflow-hidden mb-2`}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: config.bar }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{config.hint}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color: config.bar }}>{pct}%</span>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badge }: { icon: any; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2.5 uppercase tracking-wide">
        <div className="h-7 w-7 rounded-lg bg-[#FFF7ED] flex items-center justify-center shrink-0">
          <Icon size={13} className="text-[#EA580C]" />
        </div>
        {title}
      </h2>
      {badge}
    </div>
  );
}

/* ─── Score tier helper ────────────────────────────────────────────── */
function getScoreTier(score: number | null) {
  if (score === null) return { label: null, color: "#94a3b8", bg: "transparent", border: "transparent" };
  if (score >= 80) return { label: "Interview Ready", color: "#1E3A8A", bg: "#EFF6FF", border: "#1E3A8A33" };
  if (score >= 60) return { label: "Almost There", color: "#D97706", bg: "#FFFBEB", border: "#D9770633" };
  return { label: "Needs Work", color: "#EA580C", bg: "#FFF7ED", border: "#EA580C33" };
}

function getMatchTier(score: number) {
  if (score >= 70) return "bg-[#EFF6FF] text-[#1E3A8A]";
  if (score >= 40) return "bg-amber-50 text-amber-700";
  return "bg-[#FFF7ED] text-[#EA580C]";
}

function getMatchColor(score: number) {
  if (score >= 70) return "text-[#1E3A8A]";
  if (score >= 40) return "text-amber-600";
  return "text-[#EA580C]";
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
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-full bg-[#FFF7ED] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-[#EA580C]" size={22} />
          </div>
          <h2 className="text-xl font-bold text-blue-900 mb-2">Session expired</h2>
          <p className="text-slate-500 text-sm mb-6">Please start from the home page.</p>
          <Link href="/" className="block w-full px-4 py-2.5 bg-[#EA580C] text-white font-semibold rounded-lg text-sm text-center hover:bg-[#C2410C] transition-all">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  await supabase.rpc("set_my_uuid", { p_uuid: uuid });

  const { data: profile } = await supabase.from("profiles").select("*").eq("uuid", uuid).single();
  const { data: analysis } = await supabase.from("analyses").select("*").eq("profile_uuid", uuid).order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-full bg-[#FFF7ED] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-[#EA580C]" size={22} />
          </div>
          <h2 className="text-xl font-bold text-blue-900 mb-2">Profile not found</h2>
          <p className="text-slate-500 text-sm mb-6">Please complete onboarding first.</p>
          <Link href="/onboard" className="block w-full px-4 py-2.5 bg-[#EA580C] text-white font-semibold rounded-lg text-sm text-center hover:bg-[#C2410C] transition-all">
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
  const githubData = profile.github_data ?? null;
  const hasGithub = !!profile.github_username && !!githubData;

  const scoreTier = getScoreTier(readiness);

  const estimatedTime =
    readiness === null ? "Pending"
    : readiness < 60 ? "6–8 Weeks"
    : readiness < 80 ? "3–5 Weeks"
    : "1–3 Weeks";

  const sortedGaps = [...skillGaps].sort((a: any, b: any) => b.percentage - a.percentage);
  const criticalCount = sortedGaps.filter((g: any) => g.percentage >= 70).length;
  const highCount = sortedGaps.filter((g: any) => g.percentage >= 40 && g.percentage < 70).length;
  const mediumCount = sortedGaps.filter((g: any) => g.percentage < 40).length;

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-12 space-y-8">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium">Dashboard</span>
        </div>

        {/* HERO BANNER */}
        <div className="clean-card overflow-hidden">
          <div className="h-0.5 bg-linear-to-r from-[#EA580C] via-[#EA580C]/40 to-transparent" />
          <div className="grid lg:grid-cols-[200px_1fr_240px]">
            {/* Score ring */}
            <div className="flex flex-col items-center justify-center p-8 bg-linear-to-br from-[#FFF7ED] to-[#FFF7ED]/30 border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="relative h-28 w-28 flex items-center justify-center mb-3">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                  <circle
                    cx="60" cy="60" r="50"
                    stroke="url(#scoreGrad)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(readiness ?? 0) * 3.14} 314`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EA580C" />
                      <stop offset="100%" stopColor="#C2410C" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-[#EA580C] leading-none tabular-nums">
                    {readiness ?? "—"}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">score</span>
                </div>
              </div>
              {scoreTier.label && (
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border"
                  style={{ color: scoreTier.color, borderColor: scoreTier.border, backgroundColor: scoreTier.bg }}
                >
                  {scoreTier.label}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF7ED] border border-[#EA580C]/20 rounded-full text-[10px] font-bold text-[#EA580C] uppercase tracking-wide">
                  AI Analysis Complete
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight text-blue-900">Career Readiness Report</h1>
              <p className="text-sm text-slate-400 mb-5">
                Analyzed against <span className="font-semibold text-slate-600 capitalize">{targetRole}</span> role expectations
              </p>

              <div className="flex flex-wrap gap-2">
                {hasJD && jdMatchScore !== null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF7ED] border border-[#EA580C]/20 rounded-lg">
                    <FileSearch size={12} className="text-[#EA580C]" />
                    <span className="text-xs font-bold text-[#EA580C]">{jdMatchScore}% JD Match</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-600 font-semibold">~{estimatedTime} to ready</span>
                </div>
                {criticalCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF7ED] border border-[#EA580C]/20 rounded-lg">
                    <AlertTriangle size={12} className="text-[#EA580C]" />
                    <span className="text-xs font-bold text-[#EA580C]">
                      {criticalCount} critical gap{criticalCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA panel */}
            <div className="border-t lg:border-t-0 lg:border-l border-slate-100 bg-[#0F172A] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 rounded-md bg-[#EA580C]/20 flex items-center justify-center">
                    <Activity size={10} className="text-[#EA580C]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Step</span>
                </div>
                <p className="text-white font-bold text-base mb-2 leading-snug">
                  {analysis ? "Your 30-Day Learning Plan" : "Generate Your Plan"}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {analysis
                    ? "Daily tasks tailored to close your exact skill gaps fast."
                    : "Complete onboarding to generate your personalized roadmap."}
                </p>
              </div>
              <Link href={`/plan?uuid=${uuid}`} className="block mt-6">
                <div className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-2.5 rounded-xl text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2">
                  {analysis ? "View Plan" : "Get Started"}
                  <ArrowRight size={13} />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* METRIC STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Interview Readiness", value: readiness !== null ? `${readiness}%` : "—", bar: readiness, icon: Target },
            {
              label: "JD Match Score",
              value: hasJD ? (jdMatchScore !== null ? `${jdMatchScore}%` : "Pending") : "No JD",
              bar: hasJD ? jdMatchScore : null,
              icon: FileSearch,
            },
            { label: "Skill Gaps Found", value: skillGaps.length > 0 ? `${skillGaps.length}` : "—", bar: null, icon: BarChart3 },
            { label: "Est. Ready In", value: estimatedTime, bar: null, icon: Clock },
          ].map((m, i) => (
            <div key={i} className="clean-card p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <m.icon size={11} className="text-[#EA580C]" />
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{m.label}</p>
              </div>
              <p className="text-xl font-black text-slate-900 mb-2 tabular-nums">{m.value}</p>
              {m.bar !== null && (
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#EA580C] rounded-full" style={{ width: `${m.bar}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* LEFT COLUMN */}
          <div className="space-y-5">

            {/* JD Match */}
            {hasJD && (
              <div className="clean-card p-6">
                <SectionHeader
                  icon={FileSearch}
                  title="JD Match Analysis"
                  badge={
                    jdMatchScore !== null ? (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getMatchTier(jdMatchScore)}`}>
                        {jdMatchScore}% match
                      </span>
                    ) : undefined
                  }
                />
                {jdMissingSkills.length > 0 ? (
                  <>
                    <p className="text-xs text-slate-400 mb-4 font-medium">
                      Skills from the job description missing or weak in your resume:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {jdMissingSkills.map((skill: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-[#FFF7ED] border border-[#EA580C]/15 text-[#EA580C] rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    {jdMatchScore !== null
                      ? "Your resume covers all key requirements from the job description."
                      : "JD analysis pending."}
                  </p>
                )}
              </div>
            )}

            {/* Skill Gap Analysis */}
            <div className="clean-card p-6">
              <SectionHeader
                icon={BarChart3}
                title="Skill Gap Analysis"
                badge={
                  sortedGaps.length > 0 ? (
                    <div className="flex items-center gap-2">
                      {criticalCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] inline-block" /> {criticalCount} Critical
                        </span>
                      )}
                      {highCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> {highCount} High
                        </span>
                      )}
                      {mediumCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EFF6FF] text-[#1E3A8A] border border-[#1E3A8A]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] inline-block" /> {mediumCount} Medium
                        </span>
                      )}
                    </div>
                  ) : undefined
                }
              />
              {sortedGaps.length > 0 ? (
                <div className="space-y-2.5">
                  {sortedGaps.map((gap: any, i: number) => (
                    <GapCard key={i} gap={gap} index={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <BarChart3 size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">No skill gaps detected yet</p>
                  <p className="text-xs text-slate-300 mt-1">Complete your resume analysis to see results</p>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">

              {/* Strengths */}
              <div className="clean-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Strengths</h2>
                  {strengths.length > 0 && (
                    <span className="text-[10px] font-bold text-[#1E3A8A] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                      {strengths.length} found
                    </span>
                  )}
                </div>
                <div className="p-1.5">
                  {strengths.length > 0 ? (
                    <div>
                      {strengths.map((s: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 shrink-0 mt-px">
                            <span className="h-5 w-5 rounded-md bg-[#EFF6FF] flex items-center justify-center text-[10px] font-bold text-[#1E3A8A] tabular-nums">
                              {i + 1}
                            </span>
                            <div className="w-0.5 h-4 rounded-full bg-[#1E3A8A]/20" />
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <p className="text-xs text-slate-400 font-medium">Complete analysis to see strengths.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="clean-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Areas to Improve</h2>
                  {weaknesses.length > 0 && (
                    <span className="text-[10px] font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full">
                      {weaknesses.length} found
                    </span>
                  )}
                </div>
                <div className="p-1.5">
                  {weaknesses.length > 0 ? (
                    <div>
                      {weaknesses.map((w: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 shrink-0 mt-px">
                            <span className="h-5 w-5 rounded-md bg-[#FFF7ED] flex items-center justify-center text-[10px] font-bold text-[#EA580C] tabular-nums">
                              {i + 1}
                            </span>
                            <div className="w-0.5 h-4 rounded-full bg-[#EA580C]/20" />
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{w}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <p className="text-xs text-slate-400 font-medium">Complete analysis to see areas to improve.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">

            {/* AI Recommendation */}
            <div className="clean-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                  <Activity size={11} className="text-[#EA580C]" />
                </div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Recommendation</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {readiness !== null
                  ? readiness < 70
                    ? "Prioritize top skill gaps and daily DSA practice. Focus on depth over breadth."
                    : "You're close — focus on projects and behavioral prep. Polish your GitHub profile."
                  : "Complete analysis to get personalized recommendations."}
              </p>
            </div>

            {/* JD Targeting */}
            {hasJD && (
              <div className="clean-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                    <Target size={11} className="text-[#EA580C]" />
                  </div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">JD Targeting</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">Analysis tailored to your provided job description.</p>
                {jdMatchScore !== null && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-500 font-medium">Match Score</span>
                    <span className={`font-black text-xl tabular-nums ${getMatchColor(jdMatchScore)}`}>
                      {jdMatchScore}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Github Analysis */}
            {hasGithub ? (
              <div className="clean-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                      <Github size={11} className="text-[#EA580C]" />
                    </div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GitHub Profile</h3>
                  </div>
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#EA580C] hover:underline flex items-center gap-0.5 font-bold"
                  >
                    @{profile.github_username} <ArrowRight size={9} />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-px bg-slate-100/50">
                  {[
                    { icon: Users, label: "Followers", value: githubData.followers?.toLocaleString() },
                    { icon: Code, label: "Repos", value: githubData.public_repos?.toLocaleString() },
                    { icon: Star, label: "Stars", value: githubData.total_stars?.toLocaleString() },
                    { icon: BookOpen, label: "Top Language", value: githubData.top_languages?.[0]?.language },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white px-4 py-3.5 flex flex-col gap-1 hover:bg-[#FFF7ED]/30 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Icon size={10} className="text-[#EA580C]" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                      </div>
                      <span className="text-base font-black text-slate-900 leading-tight">{value ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="clean-card border-dashed p-5 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Github size={16} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">Connect GitHub</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Link your profile to get portfolio insights and suggestions.
                </p>
                <Link href="/onboard" className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFF7ED] text-[#EA580C] rounded-lg text-xs font-bold hover:bg-[#FFEDD5] transition-colors">
                  Add GitHub Username <ArrowRight size={10} />
                </Link>
              </div>
            )}

            {/* 30-Day CTA */}
            <div className="bg-[#0F172A] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 rounded-md bg-[#EA580C]/20 flex items-center justify-center">
                  <Activity size={10} className="text-[#EA580C]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Roadmap</span>
              </div>
              <p className="text-white font-bold text-sm mb-1">
                {analysis ? "30-Day Learning Plan" : "Generate Your Plan"}
              </p>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {analysis
                  ? "Follow your personalized plan to close skill gaps fast."
                  : "Complete onboarding to generate your roadmap."}
              </p>
              <Link href={`/plan?uuid=${uuid}`} className="block">
                <div className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-2.5 rounded-xl text-xs transition-all hover:shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide">
                  {analysis ? "View 30-Day Plan" : "Generate 30-Day Plan"}
                  <ArrowRight size={12} />
                </div>
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}