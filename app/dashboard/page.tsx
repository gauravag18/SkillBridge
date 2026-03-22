"use server";

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

function Navbar() {
  return (
    <header className="clean-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 hover:text-brand transition-colors">
          SkillBridge
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg transition-all hover:shadow-lg text-xs">
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

  const config = {
    critical: {
      bar: "#ef4444",
      bg: "bg-white",
      border: "border-red-100",
      badge: "bg-red-50 text-red-600 border-red-200",
      track: "bg-red-100",
      label: "Critical",
      hint: "Prioritize immediately",
      numBg: "bg-red-500",
      icon: <AlertTriangle size={9} />,
    },
    high: {
      bar: "#f59e0b",
      bg: "bg-white",
      border: "border-amber-100",
      badge: "bg-amber-50 text-amber-600 border-amber-200",
      track: "bg-amber-100",
      label: "High",
      hint: "Address this week",
      numBg: "bg-amber-500",
      icon: <TrendingUp size={9} />,
    },
    medium: {
      bar: "#3b82f6",
      bg: "bg-white",
      border: "border-blue-100",
      badge: "bg-blue-50 text-blue-600 border-blue-200",
      track: "bg-blue-100",
      label: "Medium",
      hint: "Schedule for later",
      numBg: "bg-blue-500",
      icon: null,
    },
  }[tier];

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
        <div className="h-7 w-7 rounded-lg bg-[#fff3ed] flex items-center justify-center shrink-0">
          <Icon size={13} className="text-[#ff6b35]" />
        </div>
        {title}
      </h2>
      {badge}
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
          <Link href="/" className="block w-full px-4 py-2.5 bg-[#ff6b35] text-white font-semibold rounded-lg text-sm text-center hover:bg-[#e55a28] transition-all">
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
      <div className="min-h-screen flex items-center justify-center bg-[#fffcfa]">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-full bg-[#fff3ed] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-[#ff6b35]" size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Profile not found</h2>
          <p className="text-slate-500 text-sm mb-6">Please complete onboarding first.</p>
          <Link href="/onboard" className="block w-full px-4 py-2.5 bg-[#ff6b35] text-white font-semibold rounded-lg text-sm text-center hover:bg-[#e55a28] transition-all">
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

  const readinessLabel =
    readiness === null ? null
    : readiness >= 80 ? "Interview Ready"
    : readiness >= 60 ? "Almost There"
    : "Needs Work";

  const readinessColor =
    readiness === null ? "#94a3b8"
    : readiness >= 80 ? "#16a34a"
    : readiness >= 60 ? "#ca8a04"
    : "#ef4444";

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
          <div className="h-0.5 bg-linear-to-r from-[#ff6b35] via-[#ff8a5c] to-transparent" />
          <div className="grid lg:grid-cols-[200px_1fr_240px]">
            {/* Score ring */}
            <div className="flex flex-col items-center justify-center p-8 bg-linear-to-br from-[#fffaf7] to-[#fff3ed]/30 border-b lg:border-b-0 lg:border-r border-slate-100">
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
                      <stop offset="0%" stopColor="#ff8a5c" />
                      <stop offset="100%" stopColor="#ff6b35" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-[#ff6b35] leading-none tabular-nums">
                    {readiness ?? "—"}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">score</span>
                </div>
              </div>
              {readinessLabel && (
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border"
                  style={{ color: readinessColor, borderColor: readinessColor + "44", backgroundColor: readinessColor + "11" }}
                >
                  {readinessLabel}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-full text-[10px] font-bold text-[#ff6b35] uppercase tracking-wide">
                  AI Analysis Complete
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight text-blue-900">Career Readiness Report</h1>
              <p className="text-sm text-slate-400 mb-5">
                Analyzed against <span className="font-semibold text-slate-600 capitalize">{targetRole}</span> role expectations
              </p>

              <div className="flex flex-wrap gap-2">
                {hasJD && jdMatchScore !== null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fff3ed] border border-[#ff6b35]/20 rounded-lg">
                    <FileSearch size={12} className="text-[#ff6b35]" />
                    <span className="text-xs font-bold text-[#ff6b35]">{jdMatchScore}% JD Match</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-600 font-semibold">~{estimatedTime} to ready</span>
                </div>
                {criticalCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle size={12} className="text-red-500" />
                    <span className="text-xs font-bold text-red-600">
                      {criticalCount} critical gap{criticalCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA panel */}
            <div className="border-t lg:border-t-0 lg:border-l border-slate-100 bg-[#1a1a1a] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 rounded-md bg-[#ff6b35]/20 flex items-center justify-center">
                    <Activity size={10} className="text-[#ff6b35]" />
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
                <div className="w-full bg-[#ff6b35] hover:bg-[#e55a28] text-white font-bold py-2.5 rounded-xl text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2">
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
                <m.icon size={11} className="text-[#ff6b35]" />
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{m.label}</p>
              </div>
              <p className="text-xl font-black text-slate-900 mb-2 tabular-nums">{m.value}</p>
              {m.bar !== null && (
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6b35] rounded-full" style={{ width: `${m.bar}%` }} />
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
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        jdMatchScore >= 70 ? "bg-green-100 text-green-700"
                          : jdMatchScore >= 40 ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}>
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
                        <span key={i} className="px-2.5 py-1 bg-red-50 border border-red-200/80 text-red-700 rounded-lg text-xs font-semibold">
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> {criticalCount} Critical
                        </span>
                      )}
                      {highCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> {highCount} High
                        </span>
                      )}
                      {mediumCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> {mediumCount} Medium
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
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-green-50/50">
                  <div className="h-6 w-6 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-green-600" />
                  </div>
                  <h2 className="text-xs font-bold text-green-800 uppercase tracking-wide">Strengths</h2>
                  {strengths.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                      {strengths.length}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {strengths.length > 0 ? (
                    <div className="space-y-2">
                      {strengths.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 group">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                            <CheckCircle2 size={10} className="text-green-600" />
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pt-0.5">{s}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <CheckCircle2 size={14} className="text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400">Complete analysis to see strengths.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="clean-card overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-red-50/50">
                  <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle size={12} className="text-red-500" />
                  </div>
                  <h2 className="text-xs font-bold text-red-800 uppercase tracking-wide">Areas to Improve</h2>
                  {weaknesses.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                      {weaknesses.length}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {weaknesses.length > 0 ? (
                    <div className="space-y-2">
                      {weaknesses.map((w: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 group">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                            <AlertCircle size={10} className="text-red-400" />
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pt-0.5">{w}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <AlertCircle size={14} className="text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400">Complete analysis to see areas to improve.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">

            {/* Recommendation */}
            <div className="clean-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                  <Activity size={11} className="text-[#ff6b35]" />
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
                  <div className="h-6 w-6 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                    <Target size={11} className="text-[#ff6b35]" />
                  </div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">JD Targeting</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">Analysis tailored to your provided job description.</p>
                {jdMatchScore !== null && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-500 font-medium">Match Score</span>
                    <span className={`font-black text-xl tabular-nums ${
                      jdMatchScore >= 70 ? "text-green-600"
                        : jdMatchScore >= 40 ? "text-amber-600"
                        : "text-red-500"
                    }`}>
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
                    <div className="h-6 w-6 rounded-lg bg-[#fff3ed] flex items-center justify-center">
                      <Github size={11} className="text-[#ff6b35]" />
                    </div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GitHub Profile</h3>
                  </div>
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#ff6b35] hover:underline flex items-center gap-0.5 font-bold"
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
                    <div key={label} className="bg-white px-4 py-3.5 flex flex-col gap-1 hover:bg-[#fffaf7] transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Icon size={10} className="text-[#ff6b35]" />
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
                <Link href="/onboard" className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#fff3ed] text-[#ff6b35] rounded-lg text-xs font-bold hover:bg-[#ffe8d9] transition-colors">
                  Add GitHub Username <ArrowRight size={10} />
                </Link>
              </div>
            )}

            {/* 30-Day CTA */}
            <div className="bg-[#1a1a1a] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 rounded-md bg-[#ff6b35]/20 flex items-center justify-center">
                  <Activity size={10} className="text-[#ff6b35]" />
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
                <div className="w-full bg-[#ff6b35] hover:bg-[#e55a28] text-white font-bold py-2.5 rounded-xl text-xs transition-all hover:shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide">
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