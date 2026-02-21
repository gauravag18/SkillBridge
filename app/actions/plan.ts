"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getOrCreatePlan(uuid: string) {
  const supabase = await createClient();

  if (!uuid) return { error: "Missing UUID" };

  // Check if plan already exists
  let { data: existingPlan } = await supabase
    .from("plans")
    .select("*")
    .eq("profile_uuid", uuid)
    .maybeSingle();

  if (!existingPlan) {
    // Create new plan 
    const newPlan = {
      profile_uuid: uuid,
      plan_data: {}, 
      progress: {},
      current_day: 1
    };

    const { data, error } = await supabase
      .from("plans")
      .insert(newPlan)
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

// Optional: redirect version for buttons
export async function generatePlanAndRedirect(uuid: string) {
  const result = await getOrCreatePlan(uuid);
  if (result.error) {
    // handle error (maybe return to dashboard with message)
    redirect("/dashboard?error=" + encodeURIComponent(result.error));
  }
  redirect("/plan");
}