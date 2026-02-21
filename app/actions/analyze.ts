"use server";

import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
const pdfParseLib = require("pdf-parse");
const pdfParse = pdfParseLib.default || pdfParseLib;

export async function analyzeResume(uuid: string) {
  const supabase = await createClient();

  if (!uuid) return { success: false, error: "Missing UUID" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("target_role, skills, resume_text, resume_path")
    .eq("uuid", uuid)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "Profile not found" };
  }

  let resumeText = profile.resume_text?.trim() || "";

  if (!resumeText && profile.resume_path) {
    try {
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(profile.resume_path);

      if (downloadError) throw downloadError;

      const buffer = Buffer.from(await fileBlob.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      resumeText = pdfData.text.trim();

      await supabase
        .from("profiles")
        .update({ resume_text: resumeText })
        .eq("uuid", uuid);

    } catch (extractErr: any) {
      console.error("PDF extraction failed:", extractErr.message);
      resumeText = "Failed to extract text from resume.";
    }
  }

  const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const targetRole = profile.target_role || "Software Engineer";

  if (!process.env.GROQ_API_KEY) {
    return { success: false, error: "Server configuration error (missing API key)" };
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `
You are an expert technical recruiter and career coach specializing in software engineering roles.

Analyze the resume text and profile below.

Target role: ${targetRole}
User-selected skills: ${userSkills.join(", ") || "None provided"}

Resume content:
"""
${resumeText || "No resume content was extracted."}
"""

Task:
Evaluate readiness for the target role on a scale of 0–100 (be strict and realistic).
Prioritize:
- Match to technical skills
- Depth in DSA/problem-solving
- System design knowledge
- Cloud/DevOps exposure
- Project quality and real-world impact

Return ONLY valid JSON with this exact structure:
{
  "readiness_score": number,
  "strengths": string[],
  "weaknesses": string[],
  "skill_gaps": [{ "skill": "string", "percentage": number }],
  "summary": "string"
}
`;

  try {
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const responseText = result.choices[0].message.content ?? "";
    const parsed = JSON.parse(responseText);

    if (
      typeof parsed.readiness_score !== "number" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.weaknesses) ||
      !Array.isArray(parsed.skill_gaps) ||
      typeof parsed.summary !== "string"
    ) {
      return { success: false, error: "Invalid AI response format" };
    }

    const { error: insertError } = await supabase
      .from("analyses")
      .insert({
        profile_uuid: uuid,
        readiness_score: parsed.readiness_score,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        skill_gaps: parsed.skill_gaps,
        summary: parsed.summary,
      });

    if (insertError) {
      return { success: false, error: "Failed to save analysis" };
    }

    return { success: true, analysis: parsed };
  } catch (err: any) {
    console.error("Groq analysis error:", err.message || err);
    return { success: false, error: err.message || "AI analysis failed" };
  }
}