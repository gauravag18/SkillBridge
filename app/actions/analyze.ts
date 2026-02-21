"use server";

import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { extractText } from "unpdf";

export async function analyzeResume(uuid: string) {
  const supabase = await createClient();

  if (!uuid) return { success: false, error: "Missing UUID" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("target_role, skills, resume_text, resume_path, job_description")
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
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
      resumeText = text?.trim() || "";

      if (resumeText) {
        await supabase
          .from("profiles")
          .update({ resume_text: resumeText })
          .eq("uuid", uuid);
        console.log("Resume extracted, length:", resumeText.length);
      } else {
        console.warn("PDF extraction returned empty text");
      }
    } catch (extractErr: any) {
      console.error("PDF extraction failed:", extractErr.message);
    }
  }

  const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const targetRole = profile.target_role || "Software Engineer";
  const jobDescription = profile.job_description?.trim() || "";

  if (!process.env.GROQ_API_KEY) {
    return { success: false, error: "Server configuration error (missing API key)" };
  }

  if (!resumeText) {
    resumeText = "No resume content available for evaluation.";
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `
You are an expert technical recruiter and career coach specializing in software engineering roles.

Analyze the resume and profile below.

Target role: ${targetRole}
User-selected skills: ${userSkills.join(", ") || "None provided"}
${jobDescription ? `\nJob Description provided by user:\n"""\n${jobDescription}\n"""` : ""}

Resume content:
"""
${resumeText}
"""

Task:
Evaluate readiness for the target role on a scale of 0–100 (be strict and realistic).
${jobDescription ? "Since a job description is provided, weight the score heavily based on how well the resume matches that specific JD." : ""}

Prioritize:
- Match to technical skills${jobDescription ? " and JD requirements" : ""}
- Depth in DSA/problem-solving skills
- System design knowledge according to Job Description if provided
- Cloud/DevOps exposure if speicified in Job Description
- Project quality and real-world impact over quantity of projects

Return ONLY valid JSON with this exact structure:
{
  "readiness_score": number,
  "jd_match_score": number or null,
  "strengths": string[],
  "weaknesses": string[],
  "skill_gaps": [{ "skill": "string", "percentage": number }],
  "jd_missing_skills": string[],
  "summary": "string"
}

Rules:
- "jd_match_score": 0-100 score of how well resume matches the JD. Set to null if no JD was provided.
- "jd_missing_skills": list of skills/requirements from JD that are missing in resume. Empty array if no JD.
- strengths: 3-6 concise bullets
- weaknesses: 3-6 concise bullets
- skill_gaps: top 5-8 skills with gap percentage
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
        jd_match_score: parsed.jd_match_score ?? null,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        skill_gaps: parsed.skill_gaps,
        jd_missing_skills: parsed.jd_missing_skills ?? [],
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