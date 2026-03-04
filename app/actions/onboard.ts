"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { analyzeResume, generatePersonalizedPlan } from "./analyze";
import { getOrCreatePlan } from "./progress";

export async function onboardUser(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const uuid = formData.get("uuid") as string;
  if (!uuid) {
    console.error("Onboard failed: Missing UUID");
    return { error: "Missing UUID" };
  }

  // Extract all fields from form
  const payload = {
    uuid,
    full_name: (formData.get("fullName") as string)?.trim() || null,
    target_role:
      (formData.get("targetRole") as string) ||
      (formData.get("customRole") as string)?.trim() ||
      null,
    // GitHub username — saved during onboarding
    github_username: (formData.get("githubUsername") as string)?.trim().toLowerCase() || null,
    college_year: (formData.get("year") as string) || null,
    cgpa: (formData.get("cgpa") as string)?.trim() || null,
    experience: (formData.get("experience") as string)?.trim() || null,
    job_description: (formData.get("jobDescription") as string)?.trim() || null,
    skills: (() => {
      try {
        const skillsStr = formData.get("skills") as string;
        return skillsStr ? JSON.parse(skillsStr) : [];
      } catch (e) {
        console.warn("Failed to parse skills JSON:", e);
        return [];
      }
    })(),
    resume_path: (formData.get("resume_path") as string) || null,
  };

  // Upsert profile (including github_username)
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "uuid" });

  if (upsertError) {
    console.error("Onboard upsert failed:", upsertError.message);
    return { error: upsertError.message || "Failed to save profile" };
  }

  // Ensure plan row exists
  const planCreation = await getOrCreatePlan(uuid);
  if (!planCreation.success) {
    console.warn("Plan creation failed during onboard:", planCreation.error);
  }

  // Run resume + GitHub analysis
  // (GitHub fetch happens inside analyzeResume if github_username exists)
  const analysisResult = await analyzeResume(uuid);

  if (!analysisResult.success || !analysisResult.analysis) {
    console.warn("Auto-analysis after onboard failed:", analysisResult.error);
    // Still redirect — user can see partial profile
    redirect(`/dashboard?uuid=${uuid}`);
  }

  // Generate 30-day personalized plan
  const planResult = await generatePersonalizedPlan(
    uuid,
    analysisResult.analysis,
    payload.target_role || "Software Engineer"
  );

  if (!planResult.success) {
    console.warn("Plan generation failed:", planResult.error);
    // Continue — plan failure shouldn't block onboarding
  }

  // Final redirect to dashboard
  redirect(`/dashboard?uuid=${uuid}`);
}