import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Session expired or missing</h2>
          <p className="mb-6">Please start from the home page.</p>
          <Link href="/">
            <Button>Go to Home</Button>
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

  // If no profile exists yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <p className="mb-6">Please complete onboarding first.</p>
          <Link href="/onboard">
            <Button>Go to Onboarding</Button>
          </Link>
        </div>
      </div>
    );
  }

  const readiness = analysis?.readiness_score ?? null;
  const targetRole = profile.target_role ?? "Not specified";
  const strengths = analysis?.strengths ?? [];
  const weaknesses = analysis?.weaknesses ?? [];
  const skillGaps = analysis?.skill_gaps ?? [];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* TOP DASHBOARD ROW */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch mb-10">

          {/* LEFT: MATCH SCORE */}
          <div className="lg:col-span-2 card p-8 flex flex-col lg:flex-row items-center justify-between gap-10">

            <div className="flex items-center gap-8">

              {/* Score Circle */}
              <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" stroke="#f1f5f9" strokeWidth="10" fill="none"/>
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="url(#grad)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(readiness ?? 0) * 3.27} 327`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="grad">
                      <stop offset="0%" stopColor="#ff8a5c" />
                      <stop offset="100%" stopColor="#ff6b35" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span className="text-[44px] font-semibold text-brand tracking-tight mb-6 translate-y-[2px]">
                    {readiness ?? "—"}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                  Career Readiness
                </h1>
                <p className="text-muted">
                  Based on your profile vs {targetRole} expectations
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full lg:w-60">
              <Button className="bg-brand text-white h-11 rounded-lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>

              <Button variant="outline" className="h-11 rounded-lg border-soft">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Re-analyze
              </Button>

              <Link href={`/plan?uuid=${uuid}`}>
                <Button
                  className="h-11 rounded-lg"
                  variant="outline"
                >
                  View Learning Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: QUICK SUMMARY */}
          <div className="card p-6 flex flex-col justify-between">

            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Summary</h3>

              <div className="space-y-4 text-sm">

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Interview Readiness</span>
                    <span className="text-brand font-medium">
                      {readiness !== null ? `${readiness}%` : "Not analyzed yet"}
                    </span>
                  </div>
                  <div className="progress h-2">
                    <div
                      className="progress-fill"
                      style={{ width: readiness !== null ? `${readiness}%` : "0%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Top Gap</span>
                    <span className="text-brand font-medium">
                      {skillGaps[0]?.skill || "None detected yet"}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Estimated Ready Time</span>
                    <span className="text-muted">
                      {readiness !== null
                        ? readiness < 60
                          ? "~ 6-8 Weeks"
                          : readiness < 80
                          ? "~ 3-5 Weeks"
                          : "~ 1-3 Weeks"
                        : "Pending analysis"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <Button className="mt-6 bg-brand text-white h-11 rounded-lg">
              Start Preparation
            </Button>

          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">

            {/* Skill Gap */}
            {skillGaps.length > 0 ? (
              <div className="card p-7">
                <h2 className="text-xl font-semibold flex items-center gap-3 mb-6">
                  <BarChart3 className="text-brand" />
                  Skill Gap Analysis
                </h2>

                <div className="space-y-5">
                  {skillGaps.map((gap: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{gap.skill}</span>
                        <span className="text-muted">{gap.percentage}% gap</span>
                      </div>

                      <div className="progress h-2">
                        <div className="progress-fill" style={{ width: `${gap.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-7">
                <h2 className="text-xl font-semibold flex items-center gap-3 mb-6">
                  <BarChart3 className="text-brand" />
                  Skill Gap Analysis
                </h2>
                <p className="text-muted">No skill gaps detected yet. Complete analysis to see results.</p>
              </div>
            )}

            {/* Strengths */}
            {strengths.length > 0 ? (
              <div className="card p-7">
                <h2 className="text-xl font-semibold flex items-center gap-3 mb-5">
                  <CheckCircle2 className="text-green-500" />
                  Strengths
                </h2>

                <div className="space-y-3">
                  {strengths.map((s: string, i: number) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-7">
                <h2 className="text-xl font-semibold flex items-center gap-3 mb-5">
                  <CheckCircle2 className="text-green-500" />
                  Strengths
                </h2>
                <p className="text-muted">No strengths detected yet. Complete analysis to see results.</p>
              </div>
            )}

            {/* Weaknesses */}
            {weaknesses.length > 0 ? (
              <div className="card p-7">
                <h2 className="text-xl font-semibold flex items-center gap-3 mb-5">
                  <AlertCircle className="text-red-500" />
                  Areas to Improve
                </h2>

                <div className="space-y-3">
                  {weaknesses.map((w: string, i: number) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm">
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-7">
                <h2 className="text-xl font-semibold flex items-center gap-3 mb-5">
                  <AlertCircle className="text-red-500" />
                  Areas to Improve
                </h2>
                <p className="text-muted">No areas to improve detected yet. Complete analysis to see results.</p>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-3">Recommendation</h3>
              <p className="text-sm text-muted">
                {readiness !== null
                  ? readiness < 70
                    ? "Prioritize top skill gaps and daily DSA practice."
                    : "You're close — focus on projects and behavioral prep."
                  : "Complete analysis to get personalized recommendations."}
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Next Step</h3>
              <p className="text-sm text-muted mb-4">
                {analysis
                  ? "Follow your personalized 30-day roadmap."
                  : "Upload and analyze your resume to get started."}
              </p>
              <Link href={`/plan?uuid=${uuid}`}>
                <Button className="w-full bg-brand text-white">
                  {analysis ? "View 30-Day Plan" : "Generate 30-Day Plan"}
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}