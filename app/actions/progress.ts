"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateDayProgress(
  uuid: string,
  day: number,
  completedTasks: boolean[]
) {
  const supabase = await createClient();

  if (!uuid) return { error: "Missing UUID" };

  const { data: plan } = await supabase
    .from("plans")
    .select("progress")
    .eq("profile_uuid", uuid)
    .single();

  if (!plan) return { error: "Plan not found" };

  const updatedProgress = {
    ...plan.progress,
    [`day${day}`]: completedTasks,
  };

  const { error } = await supabase
    .from("plans")
    .update({ progress: updatedProgress })
    .eq("profile_uuid", uuid);

  if (error) {
    console.error("Progress update error:", error);
    return { error: "Failed to update progress" };
  }

  return { success: true };
}

export async function getOrCreatePlan(uuid: string) {
  const supabase = await createClient();

  if (!uuid) return { error: "Missing UUID" };

  let { data: existingPlan } = await supabase
    .from("plans")
    .select("*")
    .eq("profile_uuid", uuid)
    .maybeSingle();

  if (!existingPlan) {
    const { data, error } = await supabase
      .from("plans")
      .insert({
        profile_uuid: uuid,
        plan_data: {},
        progress: {},
        current_day: 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Plan creation error:", error);
      return { error: "Failed to create plan" };
    }

    existingPlan = data;
  }

  return { success: true, plan: existingPlan };
}