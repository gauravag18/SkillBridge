"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateDayProgress(
  uuid: string,
  day: number,
  completedTasks: boolean[]
) {
  const supabase = await createClient();

  if (!uuid) return { error: "Missing UUID" };

  // Get current progress
  const { data: plan } = await supabase
    .from("plans")
    .select("progress")
    .eq("profile_uuid", uuid)
    .single();

  if (!plan) return { error: "Plan not found" };

  // Merge new day progress
  const updatedProgress = {
    ...plan.progress,
    [`day${day}`]: completedTasks
  };

  const { error } = await supabase
    .from("plans")
    .update({
      progress: updatedProgress,
    })
    .eq("profile_uuid", uuid);

  if (error) {
    console.error("Progress update error:", error);
    return { error: "Failed to update progress" };
  }

  return { success: true };
}