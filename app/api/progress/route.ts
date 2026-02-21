import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { uuid, day, completedTasks } = body;

    if (!uuid || typeof day !== "number" || !Array.isArray(completedTasks)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    // Get current plan to merge progress
    const { data: plan, error: fetchError } = await supabase
      .from("plans")
      .select("progress")
      .eq("profile_uuid", uuid)
      .single();

    if (fetchError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const updatedProgress = {
      ...plan.progress,
      [`day${day}`]: completedTasks,
    };

    const { error: updateError } = await supabase
      .from("plans")
      .update({
        progress: updatedProgress,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_uuid", uuid);

    if (updateError) {
      console.error("Progress update failed:", updateError);
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Progress API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}