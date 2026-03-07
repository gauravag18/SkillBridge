import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const jobDescription = (formData.get("jobDescription") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Extract text — same unpdf approach
    let resumeText = "";
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
      resumeText = text?.trim() || "";
    } catch (e: any) {
      return NextResponse.json(
        { error: "Failed to parse PDF: " + e.message },
        { status: 400 }
      );
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. Try a text-based PDF." },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
You are an elite resume coach and FAANG technical recruiter with 15+ years of experience.
Give brutally honest, highly specific, and actionable resume feedback.

${jobDescription ? `Target Job Description:\n"""\n${jobDescription}\n"""\n` : ""}

Resume Content:
"""
${resumeText}
"""

Analyze this resume and return ONLY valid JSON with this exact structure:

{
  "overall_score": number,
  "summary": "2-3 sentence executive summary of the resume's current state",
  "sections": {
    "bullet_improvements": [
      {
        "original": "exact original bullet text from resume",
        "improved": "rewritten version with strong action verb, metrics, and impact",
        "reason": "why this is better"
      }
    ],
    "structure_feedback": [
      {
        "category": "one of: Section Order | Formatting | Length | ATS Optimization | Contact Info | Summary/Objective | Skills Section | Education | Experience",
        "issue": "specific problem found",
        "fix": "exact action to take",
        "priority": "high | medium | low"
      }
    ],
    "missing_keywords": {
      "technical": ["missing technical skills or keywords"],
      "soft_skills": ["missing soft skill keywords"],
      "action_verbs": ["strong action verbs not currently used"]
    },
    "achievements_analysis": {
      "has_metrics": boolean,
      "metrics_score": number,
      "feedback": "specific feedback on quantification",
      "examples_to_quantify": ["existing bullets that could be quantified"]
    },
    "ats_analysis": {
      "score": number,
      "issues": ["ATS issues found"],
      "recommendations": ["ATS improvement recommendations"]
    }
  },
  ${
    jobDescription
      ? `"jd_alignment": {
    "match_score": number,
    "matched_requirements": ["JD requirements the resume addresses"],
    "missing_requirements": ["JD requirements missing in resume"],
    "tailoring_tips": ["specific tips to tailor resume for this JD"]
  },`
      : `"jd_alignment": null,`
  }
  "quick_wins": ["3-5 changes that can be made in under 10 minutes"],
  "top_issues": ["top 3 most critical problems holding this resume back"]
}

Rules:
- overall_score: 0-100, be strict and realistic
- bullet_improvements: pick the 4-6 WEAKEST bullets and rewrite them dramatically
- For improved bullets always add metrics where possible (%, $, time, scale)
- structure_feedback: reference actual content from the resume
- Return ONLY the JSON object, no markdown, no explanation
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const responseText = result.choices[0].message.content ?? "";

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Resume improvement error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}