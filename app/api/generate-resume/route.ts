import { NextResponse } from 'next/server';

// Define a type for the profile data structure, mirroring frontend if possible
// This helps ensure the dummy data matches what the frontend expects.
interface ProfileItem {
  date_or_year: string;
  item: string;
  details: string;
  source: string;
}

interface ProfileData {
  work_history?: ProfileItem[];
  blogs_articles?: ProfileItem[];
  open_source_projects?: ProfileItem[];
  videos?: ProfileItem[];
  conference_meetup_talks?: ProfileItem[];
  awards_honours?: ProfileItem[];
  public_praise_social_media?: ProfileItem[];
  domain_specific_contributions?: ProfileItem[];
  impact_summary?: string;
}

const DUMMY_ELON_MUSK_PROFILE_DATA: ProfileData = {
  impact_summary: "Elon Musk is a visionary entrepreneur known for co-founding Tesla, SpaceX, Neuralink, and The Boring Company. This is DUMMY DATA for testing.",
  work_history: [
    { date_or_year: "2002-Present", item: "SpaceX", details: "Founder, CEO, CTO. Revolutionizing space technology. (Dummy Data)", source: "https://www.spacex.com/dummy" },
    { date_or_year: "2004-Present", item: "Tesla, Inc.", details: "Co-founder, CEO, Product Architect. Accelerating sustainable energy. (Dummy Data)", source: "https://www.tesla.com/dummy" },
    { date_or_year: "2016-Present", item: "Neuralink", details: "Co-founder. Developing brain-machine interfaces. (Dummy Data)", source: "https://www.neuralink.com/dummy" },
  ],
  open_source_projects: [
    { date_or_year: "2015", item: "OpenAI (initial involvement)", details: "Co-founded, aiming for safe AGI. (Dummy Data)", source: "https://openai.com/dummy" },
  ],
  blogs_articles: [], // Leaving some sections empty for testing UI robustness
  videos: [
    { date_or_year: "Various", item: "Tesla AI Day Presentations", details: "Showcasing Tesla's AI advancements. (Dummy Data)", source: "https://youtube.com/dummy/teslai" }
  ],
  conference_meetup_talks: [],
  awards_honours: [
    { date_or_year: "2021", item: "Time Person of the Year", details: "Awarded by Time Magazine. (Dummy Data)", source: "https://time.com/dummy" }
  ],
  public_praise_social_media: [],
  domain_specific_contributions: [
    { date_or_year: "Ongoing", item: "Reusable Rocket Technology", details: "Pioneered by SpaceX, significantly reducing launch costs. (Dummy Data)", source: "https://spacex.com/dummy/reusablerockets"}
  ]
};
import Exa from 'exa-js';

const EXASEARCH_API_KEY = process.env.EXASEARCH_API_KEY;

if (!EXASEARCH_API_KEY) {
  console.error('EXASEARCH_API_KEY environment variable is not set');
  // Potentially return an error response here if you want to handle it gracefully at runtime
  // For now, it will throw an error during server startup if the key is missing.
  throw new Error('EXASEARCH_API_KEY environment variable is not set');
}

const exa = new Exa(EXASEARCH_API_KEY);

const researchOutputSchema = {
  type: "object",
  required: [
    "work_history",
    "blogs_articles",
    "open_source_projects",
    "videos",
    "conference_meetup_talks",
    "awards_honours",
    "public_praise_social_media",
    "domain_specific_contributions",
    "impact_summary"
  ],
  properties: {
    work_history: {
      type: "array",
      description: "Employer, role, start-end month-year.",
      items: {
        type: "object",
        required: ["date_or_year", "item", "details", "source"],
        properties: {
          date_or_year: { type: "string", description: "Date or year, mark 'approx.' if unclear." },
          item: { type: "string", description: "Main identifier (e.g., Employer, Title, Repo)." },
          details: { type: "string", description: "Specifics (e.g., Role, Platform, Purpose)." },
          source: { type: "string", description: "Inline citation URL." }
        }
      }
    },
    blogs_articles: {
      type: "array",
      description: "Title, platform, date.",
      items: {
        type: "object",
        required: ["date_or_year", "item", "details", "source"],
        properties: {
          date_or_year: { type: "string", description: "Date or year, mark 'approx.' if unclear." },
          item: { type: "string", description: "Main identifier (e.g., Employer, Title, Repo)." },
          details: { type: "string", description: "Specifics (e.g., Role, Platform, Purpose)." },
          source: { type: "string", description: "Inline citation URL." }
        }
      }
    },
    open_source_projects: {
      type: "array",
      description: "Repo, purpose, the person’s role (owner, maintainer, contributor).",
      items: {
        type: "object",
        required: ["date_or_year", "item", "details", "source"],
        properties: {
          date_or_year: { type: "string", description: "Date or year, mark 'approx.' if unclear." },
          item: { type: "string", description: "Main identifier (e.g., Employer, Title, Repo)." },
          details: { type: "string", description: "Specifics (e.g., Role, Platform, Purpose)." },
          source: { type: "string", description: "Inline citation URL." }
        }
      }
    },
    videos: {
      type: "array",
      description: "Title, platform or event, date.",
      items: {
        type: "object",
        required: ["date_or_year", "item", "details", "source"],
        properties: {
          date_or_year: { type: "string", description: "Date or year, mark 'approx.' if unclear." },
          item: { type: "string", description: "Main identifier (e.g., Employer, Title, Repo)." },
          details: { type: "string", description: "Specifics (e.g., Role, Platform, Purpose)." },
          source: { type: "string", description: "Inline citation URL." }
        }
      }
    },
    conference_meetup_talks: {
      type: "array",
      description: "Event name, city or online, talk title, date, the person’s role (speaker, host).",
      items: {
        type: "object",
        required: ["date_or_year", "item", "details", "source"],
        properties: {
          date_or_year: { type: "string", description: "Date or year, mark 'approx.' if unclear." },
          item: { type: "string", description: "Main identifier (e.g., Employer, Title, Repo)." },
          details: { type: "string", description: "Specifics (e.g., Role, Platform, Purpose)." },
          source: { type: "string", description: "Inline citation URL." }
        }
      }
    },
    awards_honours: {
      type: "array",
      description: "Award name, year, awarding body, short reason if given.",
      items: {
        type: "object",
        required: ["date_or_year", "item", "details", "source"],
        properties: {
          date_or_year: { type: "string", description: "Date or year, mark 'approx.' if unclear." },
          item: { type: "string", description: "Main identifier (e.g., Employer, Title, Repo)." },
          details: { type: "string", description: "Specifics (e.g., Role, Platform, Purpose)." },
          source: { type: "string", description: "Inline citation URL." }
        }
      }
    },
    public_praise_social_media: {
      type: "array",
      description: "Platform, date, who praised, one-line quote or paraphrase, context.",
      items: {
        type: "object",
        required: ["date_or_year", "item", "details", "source"],
        properties: {
          date_or_year: { type: "string", description: "Date or year, mark 'approx.' if unclear." },
          item: { type: "string", description: "Main identifier (e.g., Employer, Title, Repo)." },
          details: { type: "string", description: "Specifics (e.g., Role, Platform, Purpose)." },
          source: { type: "string", description: "Inline citation URL." }
        }
      }
    },
    domain_specific_contributions: {
      type: "array",
      description: "Major technical or creative work. Include blogs, code, docs, demos, and talks.",
      items: {
        type: "object",
        required: ["date_or_year", "item", "details", "source"],
        properties: {
          date_or_year: { type: "string", description: "Date or year, mark 'approx.' if unclear." },
          item: { type: "string", description: "Main identifier (e.g., Employer, Title, Repo)." },
          details: { type: "string", description: "Specifics (e.g., Role, Platform, Purpose)." },
          source: { type: "string", description: "Inline citation URL." }
        }
      }
    },
    impact_summary: {
      type: "string",
      description: "One short paragraph that sums up impact."
    }
  },
  additionalProperties: false
};

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    // Check for dummy data request
    if (name && typeof name === 'string' && name.trim().toLowerCase() === 'elon musk') {
      console.log("Returning DUMMY profile data for Elon Musk.");
      return NextResponse.json(DUMMY_ELON_MUSK_PROFILE_DATA);
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required and must be a non-empty string' }, { status: 400 });
    }

    const instructions = `Build a full public profile for ${name}. 
Use only data that is public as of TODAY.

SCOPE – produce these eight sections, in order

1. **Work history**
   • Employer, role, start-end month-year.

2. **Blogs / articles**
   • Title, platform, date.

3. **Open-source / code projects**
   • Repo, purpose, the person’s role (owner, maintainer, contributor).

4. **Videos**
   • Title, platform or event, date.

5. **Conference / meetup talks**
   • Event name, city or online, talk title, date, the person’s role (speaker, host).

6. **Awards and honours**
   • Award name, year, awarding body, short reason if given.

7. **Public praise on social media**
   • Platform, date, who praised, one-line quote or paraphrase, context.

8. **Domain-specific contributions**
   • Summarise major technical or creative work in the person’s main fields.
   • Group by sub-topics if helpful (for example, “full-text search”, “vector search”, “hybrid search”).
   • Include blogs, code, docs, demos, and talks that teach or advance these areas.

METHOD
• Search LinkedIn, GitHub, personal blogs, tech blogs, Dev.to, Hashnode, YouTube, X/Twitter, Meetup.com, Luma, conference sites, and news.
• Prefer primary sources.
• After each item in the tables, provide an inline citation URL in the 'source' field of the JSON object for that item.
• Mark dates as “approx.” if unclear in the 'date_or_year' field.
• Skip speculation and duplicates.

OUTPUT RULES
• For each of the first eight sections, structure the output as an array of objects, where each object corresponds to a row in a table. Each object must have the fields: "date_or_year", "item", "details", and "source".
• The 'item' field should contain the primary piece of information (e.g., Employer for work history, Title for blogs/videos, Repo name for projects).
• The 'details' field should contain supplementary information (e.g., Role for work history, Platform for blogs, Purpose for projects).
• The 'date_or_year' field should capture the relevant date or year.
• The 'source' field must be a valid URL pointing to the source of the information.
• After the eight sections, provide a single string for "impact_summary". This summary should be a short paragraph that sums up the person's impact.
• Use short sentences. Choose simple words. Write in active voice. Avoid adverbs where you can.
• Check grammar and spelling.
• Do not add flattery.
END`;

    console.log(`Creating Exa research task for: ${name}`);
    const task = await exa.research.createTask({
      model: "exa-research-pro",
      instructions: instructions,
      output: {
        schema: researchOutputSchema as any, // Cast to any to bypass strict JSONSchema type issues
      },
    });
    console.log(`Exa task created, ID: ${task.id} for name: ${name}`);
    
    console.log(`Polling for Exa research results for task ID: ${task.id}`);
    const result = await exa.research.pollTask(task.id);
    console.log(`Exa Research result for ${name}:`, result);

    // Return only the data field from the Exa research result
    if (result.status === 'completed' && result.data) {
      return NextResponse.json(result.data);
    } else {
      // Handle cases where the task didn't complete successfully or data is missing
      console.error('Exa research task did not complete successfully or data is missing:', result);
      return NextResponse.json({ error: 'Failed to retrieve profile data from Exa.', details: result.status }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in Exa Research API call (/api/generate-resume):', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch profile using Exa Research API.', details: errorMessage }, { status: 500 });
  }
}
