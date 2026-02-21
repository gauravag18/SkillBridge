"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const pdfParseLib = require("pdf-parse");
const pdfParse = pdfParseLib.default || pdfParseLib;

export async function analyzeResume(uuid: string) {
  const supabase = await createClient();

  if (!uuid) {
    return { success: false, error: "Missing UUID" };
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("target_role, skills, resume_text, resume_path")
    .eq("uuid", uuid)
    .single();

  if (profileError || !profile) {
    console.error("Profile fetch failed:", profileError?.message);
    return { success: false, error: "Profile not found" };
  }

  let resumeText = profile.resume_text?.trim() || "";

  // If no text saved yet but file exists → extract now
  if (!resumeText && profile.resume_path) {
    try {
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(profile.resume_path);

      if (downloadError) {
        console.error("Download resume failed:", downloadError.message);
        throw downloadError;
      }

      const buffer = Buffer.from(await fileBlob.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      resumeText = pdfData.text.trim();

      // Save extracted text back to DB for future use
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ resume_text: resumeText })
        .eq("uuid", uuid);

      if (updateError) {
        console.warn("Failed to save extracted resume_text:", updateError.message);
      }
    } catch (extractErr: any) {
      console.error("PDF extraction failed:", extractErr.message);
      resumeText = "Failed to extract text from resume.";
    }
  }

  const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const targetRole = profile.target_role || "Software Engineer";

  // Gemini setup
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in environment variables");
    return { success: false, error: "Server configuration error (missing API key)" };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

Return **ONLY valid JSON** — no markdown, no extra text, no explanations. Use this exact structure:

{
  "readiness_score": number,
  "strengths": string[],          // 3–6 concise bullets
  "weaknesses": string[],         // 3–6 concise bullets
  "skill_gaps": [
    {
      "skill": "Exact skill name",
      "percentage": number          // 0–100, higher = bigger gap
    }
  ],
  "summary": "1–2 sentence overall assessment"
}

Be professional, specific, and honest. Base judgment on mid-to-senior level expectations.
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    const cleaned = responseText
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate
    if (
      typeof parsed.readiness_score !== "number" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.weaknesses) ||
      !Array.isArray(parsed.skill_gaps) ||
      typeof parsed.summary !== "string"
    ) {
      return { success: false, error: "Invalid AI response format" };
    }

    // Save
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
      console.error("Save analysis failed:", insertError.message);
      return { success: false, error: "Failed to save analysis" };
    }

    return { success: true, analysis: parsed };
  } catch (err: any) {
    console.error("Gemini analysis error:", err.message || err);
    return { success: false, error: err.message || "AI analysis failed" };
  }
}