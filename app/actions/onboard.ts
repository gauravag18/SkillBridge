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

  const payload = {
    uuid,
    full_name: (formData.get("fullName") as string)?.trim() || null,
    target_role:
      (formData.get("targetRole") as string) ||
      (formData.get("customRole") as string)?.trim() ||
      null,
    college_year: (formData.get("year") as string) || null,
    cgpa: (formData.get("cgpa") as string)?.trim() || null,
    experience: (formData.get("experience") as string)?.trim() || null,
    job_description: (formData.get("jobDescription") as string)?.trim() || null,
    skills: (() => {
      try {
        return JSON.parse(formData.get("skills") as string || "[]");
      } catch {
        return [];
      }
    })(),
    resume_path: (formData.get("resume_path") as string) || null,
  };

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "uuid" });

  if (upsertError) {
    console.error("Onboard upsert failed:", upsertError.message);
    return { error: upsertError.message || "Failed to save profile" };
  }

  // Create plan row first
  await getOrCreatePlan(uuid);

  // Run analysis
  const analysisResult = await analyzeResume(uuid);
  if (!analysisResult.success || !analysisResult.analysis) {
    console.warn("Auto-analysis after onboard failed:", analysisResult.error);
    redirect(`/dashboard?uuid=${uuid}`);
  }

  // Generate personalized plan based on analysis
  const planResult = await generatePersonalizedPlan(
    uuid,
    analysisResult.analysis,
    payload.target_role || "Software Engineer"
  );

  if (!planResult.success) {
    console.warn("Plan generation failed:", planResult.error);
  }

  redirect(`/dashboard?uuid=${uuid}`);
}