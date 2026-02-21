import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const uuid = formData.get("uuid") as string | null;

    if (!file || !uuid) {
      return NextResponse.json(
        { error: "Missing file or uuid" },
        { status: 400 }
      );
    }

    // Validate file (basic)
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit example
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `${uuid}-${Date.now()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true, // overwrite if same name (rare)
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Optional: Save path to profiles table immediately
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ resume_path: filePath })
      .eq("uuid", uuid);

    if (updateError) {
      console.warn("Could not update resume_path in profiles:", updateError);
      // not critical – can continue
    }

    // Get public/signed URL if you need it right away (optional)
    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: filePath,
      publicUrl: urlData.publicUrl, // only if bucket is public – otherwise use signed
      message: "Resume uploaded successfully",
    });
  } catch (err: any) {
    console.error("Upload route unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}