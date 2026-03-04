"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchAndAnalyzeGithub(
  uuid: string,
  githubUsername: string | null,
  targetRole: string = "Software Engineer"
) {
  if (!githubUsername?.trim()) {
    return { success: false, message: "No GitHub username provided" };
  }

  const cleanUsername = githubUsername.trim().toLowerCase();

  const supabase = await createClient();

  // 1. Check cache — only refresh if older than 24 hours or no data
  const { data: profile } = await supabase
    .from("profiles")
    .select("github_data, github_last_fetched, github_error")
    .eq("uuid", uuid)
    .single();

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const lastFetched = profile?.github_last_fetched 
    ? new Date(profile.github_last_fetched).getTime() 
    : 0;

  if (
    profile?.github_data &&
    Date.now() - lastFetched < ONE_DAY_MS &&
    !profile.github_error?.includes("rate limit")
  ) {
    return { success: true, githubAnalysis: profile.github_data };
  }

  try {
    // Prepare headers – use token if available 
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
      console.log(`Using authenticated GitHub token for ${cleanUsername}`);
    } else {
      console.warn(
        `No GITHUB_TOKEN set – using unauthenticated requests (60 req/hour limit)`
      );
    }

    // 1. Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${cleanUsername}`, {
      headers,
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!userRes.ok) {
      if (userRes.status === 404) {
        await saveError(supabase, uuid, cleanUsername, "GitHub user not found");
        return { success: false, message: "GitHub user not found" };
      }
      if (userRes.status === 403 || userRes.status === 429) {
        await saveError(supabase, uuid, cleanUsername, "GitHub rate limit — try again later");
        return { success: false, message: "GitHub rate limit — try again later" };
      }
      throw new Error(`GitHub API error: ${userRes.status} ${userRes.statusText}`);
    }

    const user = await userRes.json();

    // 2. Fetch recent public repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=updated`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!reposRes.ok) {
      throw new Error(`Failed to fetch repositories: ${reposRes.status}`);
    }

    const repos: any[] = await reposRes.json();

    // Basic analysis 
    const languages = repos
      .filter((r) => r.language)
      .reduce((acc: Record<string, number>, r) => {
        acc[r.language] = (acc[r.language] || 0) + 1;
        return acc;
      }, {});

    const topLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lang, count]) => ({ language: lang, count }));

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

    const analysis = {
      username: cleanUsername,
      name: user.name || null,
      bio: user.bio || null,
      followers: user.followers || 0,
      following: user.following || 0,
      public_repos: repos.length,
      total_stars: totalStars,
      top_languages: topLanguages,
      avatar_url: user.avatar_url,
      profile_url: user.html_url,
      summary: `GitHub profile: ${repos.length} public repositories, ${totalStars} total stars. Primary languages: ${topLanguages.map(l => l.language).join(", ") || "none detected"}.`,
      suggestions: generateRoleSpecificSuggestions(topLanguages, targetRole),
      fetched_at: new Date().toISOString(),
    };

    // Save successful result
    await supabase
      .from("profiles")
      .update({
        github_username: cleanUsername,
        github_data: analysis,
        github_last_fetched: new Date().toISOString(),
        github_error: null,
      })
      .eq("uuid", uuid);

    return { success: true, githubAnalysis: analysis };
  } catch (err: any) {
    console.error("GitHub fetch failed:", err);
    const errorMsg = err.message || "Failed to fetch GitHub data";

    await saveError(supabase, uuid, cleanUsername, errorMsg);

    return { success: false, message: errorMsg };
  }
}

// Helper to save error state
async function saveError(
  supabase: any,
  uuid: string,
  username: string,
  message: string
) {
  await supabase
    .from("profiles")
    .update({
      github_username: username,
      github_error: message,
      github_last_fetched: new Date().toISOString(),
    })
    .eq("uuid", uuid);
}

// Role-specific suggestion logic (customize as needed)
function generateRoleSpecificSuggestions(languages: any[], targetRole: string): string[] {
  const suggestions: string[] = [];

  const roleLangMap: Record<string, string[]> = {
    frontend: ["JavaScript", "TypeScript", "HTML", "CSS", "React", "Vue", "Angular"],
    backend: ["Node.js", "Python", "Java", "Go", "Ruby", "PHP", "C#"],
    fullstack: ["JavaScript", "TypeScript", "Node.js", "React", "Python", "SQL"],
    "software engineer": ["Python", "Java", "JavaScript", "TypeScript", "C++", "Go"],
    devops: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
  };

  const expected = roleLangMap[targetRole.toLowerCase()] || ["JavaScript", "TypeScript", "Python"];

  expected.forEach((lang) => {
    if (!languages.some((l: any) => l.language === lang)) {
      suggestions.push(`Build more projects using **${lang}** — it's highly valued in ${targetRole} roles.`);
    }
  });

  if (suggestions.length === 0) {
    suggestions.push("Solid language coverage for your target role.");
    suggestions.push("Focus on writing clean READMEs, adding tests, and contributing to open-source projects.");
  }

  if (suggestions.length < 3) {
    suggestions.push("Consider adding meaningful commit messages and project documentation.");
  }

  return suggestions.slice(0, 5);
}