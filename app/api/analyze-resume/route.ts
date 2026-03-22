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
You are the most ruthless, elite FAANG technical recruiter and resume reviewer in the industry. Your feedback is famously harsh, brutally honest, and extremely specific. Do NOT give generic AI advice like "use strong action verbs." Write like a senior engineer/recruiter who is tired of seeing bad resumes, providing concrete, exact edits.

${jobDescription ? `Target Job Description:\n"""\n${jobDescription}\n"""\n` : ""}

Resume Content:
"""
${resumeText}
"""

Analyze this resume and return ONLY valid JSON with this exact structure:

{
  "overall_score": number,
  "summary": "2-3 sentence executive summary of the resume's current state. Be brutally direct about its flaws and strengths.",
  "sections": {
    "bullet_improvements": [
      {
        "original": "exact original bullet text from resume",
        "improved": "High-tier rewritten version using the XYZ formula (Accomplished X as measured by Y, by doing Z). Use realistic placeholder metrics like [20%] if missing.",
        "reason": "Harsh, specific reason why the original was weak and why the new one is better"
      }
    ],
    "structure_feedback": [
      {
        "category": "one of: Section Order | Formatting | Length | ATS Optimization | Contact Info | Summary/Objective | Skills Section | Education | Experience",
        "issue": "specific problem found (no fluff)",
        "fix": "exact action to take",
        "priority": "high | medium | low"
      }
    ],
    "missing_keywords": {
      "technical": ["specific missing technical skills or frameworks appropriate for their level"],
      "soft_skills": ["specific missing soft skill combinations"],
      "action_verbs": ["specific strong action verbs relevant to their specific bullet points"]
    },
    "achievements_analysis": {
      "has_metrics": boolean,
      "metrics_score": number,
      "feedback": "brutally honest feedback on their ability to quantify impact",
      "examples_to_quantify": ["existing bullets that MUST be quantified"]
    },
    "ats_analysis": {
      "score": number,
      "issues": ["Exact ATS failure reasons"],
      "recommendations": ["Exact technical fixes for ATS parsability"]
    }
  },
  ${
    jobDescription
      ? `"jd_alignment": {
    "match_score": number,
    "matched_requirements": ["Actual JD requirements they met perfectly"],
    "missing_requirements": ["Crucial JD requirements they missed entirely"],
    "tailoring_tips": ["Exact phrase changes they need to make to pass this specific JD's screening"]
  },`
      : `"jd_alignment": null,`
  }
  "quick_wins": ["3-5 concrete changes that can be made in under 10 minutes to instantly boost appeal"],
  "top_issues": ["Top 3 most critical, fatal problems holding this resume back from interviews"]
}

Rules:
- overall_score: 0-100. Be extremely strict. 80+ is rare. Average should be 40-60.
- bullet_improvements: pick the 4-6 most generic, unimpressive bullets. Do not sugarcoat.
- No generic AI fluff. Be brutally direct and professional.
- Return ONLY the JSON object, absolutely NO markdown, NO explanation.
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