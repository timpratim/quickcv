import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

interface JobEntry {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface UserInput {
  name: string;
  description: string;
  github?: string;
  twitter?: string;
  linkedin: string;
  youtube?: string;
  role?: string;
  companyWebsite?: string;
  jobs: JobEntry[];
}

interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: "github" | "blog" | "video" | "talk";
  date: string;
  description: string;
  confidence: number;
}

function detectTypeFromUrl(url: string): ContentItem["type"] {
  if (url.includes("github.com")) return "github";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "video";
  return "blog";
}

function parseLinkedInExperience(text: string): JobEntry[] {
  const jobs: JobEntry[] = [];

  // Normalize whitespace and dashes for easier pattern matching
  const clean = text
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  const months = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";

  // Common pattern: "Title at Company Jan 2020 - Present"
  const pattern1 = new RegExp(
    `([A-Za-z0-9 ,.&()\/-]+?) at ([A-Za-z0-9 ,.&()\/-]+?) ((?:${months}) ?\\d{4})\s*-\s*(Present|(?:${months}) ?\\d{4})`,
    "gi"
  );
  // Alternate pattern: "Company - Title Jan 2020 - Dec 2022"
  const pattern2 = new RegExp(
    `([A-Za-z0-9 ,.&()\/-]+?) - ([A-Za-z0-9 ,.&()\/-]+?) ((?:${months}) ?\\d{4})\s*-\s*(Present|(?:${months}) ?\\d{4})`,
    "gi"
  );

  let match: RegExpExecArray | null;
  while ((match = pattern1.exec(clean))) {
    jobs.push({
      id: randomUUID(),
      title: match[1].trim(),
      company: match[2].trim(),
      startDate: match[3].trim(),
      endDate: match[4].trim(),
    });
  }

  while ((match = pattern2.exec(clean))) {
    jobs.push({
      id: randomUUID(),
      title: match[2].trim(),
      company: match[1].trim(),
      startDate: match[3].trim(),
      endDate: match[4].trim(),
    });
  }

  // Fallback: detect sequential lines "Company", "Title", "Jan 2020 - Mar 2023"
  if (jobs.length === 0) {
    const linePattern = new RegExp(
      `(${months}) ?\\d{4}\\s*-\\s*(Present|(?:${months}) ?\\d{4})`,
      "i"
    );
    const lines = clean.split(/\n+/);
    for (let i = 2; i < lines.length; i++) {
      const dates = lines[i].match(linePattern);
      if (dates) {
        jobs.push({
          id: randomUUID(),
          title: lines[i - 1].trim(),
          company: lines[i - 2].trim(),
          startDate: dates[1] + " " + dates[0].split("-")[0].split(/\s+/)[1],
          endDate: dates[2],
        });
      }
    }
  }

  return jobs;
}

async function fetchLinkedInJobs(url: string, token: string): Promise<JobEntry[]> {
  try {
    if (url && !/^https?:\/\//i.test(url)) {
      url = `https://${url.replace(/^\/*/, "")}`;
    }
    const res = await fetch("https://api.exa.ai/webcrawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const text = data.text || data.content || "";
    return parseLinkedInExperience(text);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as UserInput;

  const token = process.env.EXASEARCH_API_KEY;
  if (!token) {
    return NextResponse.json({ error: "Missing EXASEARCH_API_KEY" }, { status: 500 });
  }

  try {
    const searchRes = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `${body.name} ${body.role} ${body.description}`,
        num_results: 20,
      }),
    });

    if (!searchRes.ok) {
      const text = await searchRes.text();
      return NextResponse.json({ items: [], jobs: [], error: text }, { status: searchRes.status });
    }

    const data = await searchRes.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: ContentItem[] = (data.results || []).map((r: any) => ({
      id: r.id ?? r.url,
      title: r.title ?? "Untitled",
      url: r.url,
      type: detectTypeFromUrl(r.url ?? ""),
      date: r.publishedDate ?? r.date ?? "",
      description: r.snippet ?? r.content ?? "",
      confidence: r.score ?? r.confidence ?? 0,
    }));

    const jobs = await fetchLinkedInJobs(body.linkedin, token);

    return NextResponse.json({ items, jobs });
  } catch {
    return NextResponse.json({ items: [], jobs: [], error: "Failed to fetch from Exa" }, { status: 500 });
  }
}
