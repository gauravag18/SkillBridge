"use server";

import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// TYPES
type InterviewQuestion = {
  question: string;
  question_type: string;
  difficulty: string;
  category: string;
};

type FinalReport = {
  overall_score: number;
  technical_depth: number;
  communication: number;
  role_fit: number;
  strengths: string[];
  weaknesses: string[];
  improvement_tips: string[];
  summary: string;
};

//HELPERS
async function safeLLMCall(fn: () => Promise<any>, retries = 2): Promise<any> {
  try {
    return await fn();
  } catch (e) {
    if (retries > 0) return safeLLMCall(fn, retries - 1);
    throw e;
  }
}

// QUESTION GENERATION
export async function generateNextInterviewQuestion(
  uuid: string,
  targetRole: string,
  jobDescription: string | null,
  previousQuestions: string[],
  questionIndex: number
): Promise<{ success: boolean; question?: InterviewQuestion; error?: string }> {
  if (!uuid || !targetRole) {
    return { success: false, error: "Missing uuid or target role" };
  }

  const prompt =
    questionIndex === 0
      ? `You are a friendly but professional interviewer for a ${targetRole} position.
Start the interview by asking the candidate to introduce themselves.

Return ONLY valid JSON with no markdown:
{"question":"Tell me about yourself and what excites you about the ${targetRole} role.","question_type":"introductory","difficulty":"easy","category":"Introduction"}`
      : `You are a senior ${targetRole} interviewer at a top tech company.

Job description / role focus:
${jobDescription || "General " + targetRole + " role"}

Generate ONE realistic interview question (question number ${questionIndex + 1}).

Previous questions asked — do NOT repeat or be similar:
${previousQuestions.join("\n") || "None yet"}

Rules:
- Alternate between behavioral, technical, and role-specific
- Behavioral: STAR-method style
- Technical: relevant to ${targetRole}
- Open-ended and conversational

STRICT JSON ONLY (no markdown, no explanation):
{
  "question":"string",
  "question_type":"behavioral|technical|system-design|role-specific",
  "difficulty":"easy|medium|hard",
  "category":"string"
}`;

  try {
    const completion = await safeLLMCall(() =>
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      })
    );

    let content = completion.choices[0]?.message?.content?.trim() ?? "{}";

    console.log("RAW QUESTION:", content);

    let parsed: Partial<InterviewQuestion> = {};

    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Question JSON failed:", content);
    }

    // fallback (never break interview)
    if (!parsed.question) {
      return {
        success: true,
        question: {
          question: "Tell me about a project you recently worked on.",
          question_type: "behavioral",
          difficulty: "easy",
          category: "General",
        },
      };
    }

    return {
      success: true,
      question: {
        question: parsed.question,
        question_type: parsed.question_type ?? "general",
        difficulty: parsed.difficulty ?? "medium",
        category: parsed.category ?? "General",
      },
    };
  } catch (err) {
    console.error("Question generation failed:", err);

    return {
      success: true,
      question: {
        question: "What technologies are you most comfortable with?",
        question_type: "technical",
        difficulty: "easy",
        category: "General",
      },
    };
  }
}

//FINAL REPORT
export async function generateFinalInterviewReport(
  uuid: string,
  targetRole: string,
  jobDescription: string | null,
  questionsAndAnswers: Array<{ question: string; answer: string }>
): Promise<{ success: boolean; report?: FinalReport; error?: string }> {
  if (!uuid || !targetRole) {
    return { success: false, error: "Missing uuid or target role" };
  }

  if (questionsAndAnswers.length < 3) {
    return { success: false, error: "Not enough answers" };
  }

  const conversation = questionsAndAnswers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}`)
    .join("\n\n");

  const prompt = `You are a senior interviewer.

Evaluate this mock interview.

${conversation}

Return ONLY valid JSON.
No explanation, no markdown.

STRICT FORMAT:
{
  "overall_score": number,
  "technical_depth": number,
  "communication": number,
  "role_fit": number,
  "strengths": string[],
  "weaknesses": string[],
  "improvement_tips": string[],
  "summary": string
}`;

  try {
    const completion = await safeLLMCall(() =>
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 1500,
      })
    );

    let content = completion.choices[0]?.message?.content?.trim() ?? "{}";

    console.log("RAW REPORT:", content);

    let parsed: Partial<FinalReport> = {};

    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Report JSON failed:", content);
    }

    //SAFE FALLBACK (NO CRASH EVER)
    const report: FinalReport = {
      overall_score: Number(parsed.overall_score ?? 6),
      technical_depth: Number(parsed.technical_depth ?? 6),
      communication: Number(parsed.communication ?? 6),
      role_fit: Number(parsed.role_fit ?? 6),
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths
        : ["Good effort and communication"],
      weaknesses: Array.isArray(parsed.weaknesses)
        ? parsed.weaknesses
        : ["Needs more structured answers"],
      improvement_tips: Array.isArray(parsed.improvement_tips)
        ? parsed.improvement_tips
        : ["Practice STAR method and technical depth"],
      summary:
        parsed.summary ??
        "The candidate shows potential but can improve clarity and depth.",
    };

    // Save to DB (optional)
    try {
      const supabase = await createClient();
      await supabase.from("interview_reports").insert({
        profile_uuid: uuid,
        report,
      });
    } catch {}

    return { success: true, report };
  } catch (err) {
    console.error("Report generation failed:", err);

    return {
      success: true,
      report: {
        overall_score: 6,
        technical_depth: 6,
        communication: 6,
        role_fit: 6,
        strengths: ["Basic understanding shown"],
        weaknesses: ["Needs improvement"],
        improvement_tips: ["Practice more interviews"],
        summary: "Fallback report generated due to AI error.",
      },
    };
  }
}