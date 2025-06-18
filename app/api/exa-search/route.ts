import { NextResponse } from "next/server";

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
  linkedin?: string;
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
      return NextResponse.json({ error: text }, { status: searchRes.status });
    }

    const data = await searchRes.json();
    const items: ContentItem[] = (data.results || []).map((r: any) => ({
      id: r.id ?? r.url,
      title: r.title ?? "Untitled",
      url: r.url,
      type: detectTypeFromUrl(r.url ?? ""),
      date: r.publishedDate ?? r.date ?? "",
      description: r.snippet ?? r.content ?? "",
      confidence: r.score ?? r.confidence ?? 0,
    }));

    return NextResponse.json(items);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch from Exa" }, { status: 500 });
  }
}
