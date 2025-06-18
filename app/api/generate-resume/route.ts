import { NextResponse } from 'next/server';
import Exa from 'exa-js';
import OpenAI from 'openai';

// Define the expected request body structure (mirroring UserInput + jobPostingUrl)
interface GenerateResumeRequest {
  name: string;
  description: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  role?: string;
  companyWebsite?: string;
  jobPostingUrl?: string; // Added job posting URL
  jobs: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
}

// Define the structure for content items found by Exa
interface DiscoveredContentItem {
  id: string;
  title: string;
  type: "github" | "blog" | "video" | "talk" | "other" | "linkedin" | "company" | "job_posting";
  url: string;
  date?: string; // Exa results might not always have a date
  description: string; // We'll use Exa's 'highlights' or 'text' here
  relevanceScore: number; // Exa's 'score'
}

// Define the expected response body structure
interface GenerateResumeResponse {
  generatedResumeText: string;
  discoveredContentItems: DiscoveredContentItem[];
}

const EXA_API_KEY = process.env.EXASEARCH_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const exa = new Exa(EXA_API_KEY);

export async function POST(request: Request) {
  if (!EXA_API_KEY) {
    return NextResponse.json({ error: 'Exa API key is not configured.' }, { status: 500 });
  }
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key is not configured.' }, { status: 500 });
  }

  try {
    const body: GenerateResumeRequest = await request.json();
    console.log("Received user input:", body);

    let discoveredItems: DiscoveredContentItem[] = [];

    // --- Exa AI Integration --- 
    try {
      // 1. Fetch content related to user's public profiles
      if (body.linkedin) {
        console.log(`Searching Exa for similar content to LinkedIn: ${body.linkedin}`);
        const linkedinResults = await exa.findSimilar(body.linkedin, { numResults: 3 });
        linkedinResults.results.forEach(result => {
          discoveredItems.push({
            id: result.id || result.url,
            title: result.title || 'LinkedIn Related Content',
            type: 'linkedin',
            url: result.url,
            date: result.publishedDate,
            description: result.text || '',
            relevanceScore: result.score || 0,
          });
        });
      }

      if (body.github) {
        console.log(`Searching Exa for similar content to GitHub: ${body.github}`);
        const githubResults = await exa.findSimilar(body.github, { numResults: 3 });
        githubResults.results.forEach(result => {
          discoveredItems.push({
            id: result.id || result.url,
            title: result.title || 'GitHub Related Content',
            type: 'github',
            url: result.url,
            date: result.publishedDate,
            description: result.text || '',
            relevanceScore: result.score || 0,
          });
        });
      }

      // 2. Fetch content related to job/company context
      let jobContextQuery = `Information about the role of ${body.role}`;
      if (body.companyWebsite) jobContextQuery += ` at company ${body.companyWebsite}`;
      if (body.jobPostingUrl) jobContextQuery += ` and job posting ${body.jobPostingUrl}`;
      else if (body.companyWebsite && !body.jobPostingUrl) jobContextQuery += `. Focus on company culture, products, and recent news.`;
      
      console.log(`Searching Exa with query: ${jobContextQuery}`);
      const jobContextResults = await exa.search(jobContextQuery, { 
        numResults: 5, 
        useAutoprompt: true, 
        type: 'neural' // Prefer neural search for broader context
      });
      jobContextResults.results.forEach(result => {
        discoveredItems.push({
          id: result.id || result.url,
          title: result.title || 'Job/Company Context',
          type: body.jobPostingUrl && result.url.includes(new URL(body.jobPostingUrl).hostname) ? 'job_posting' : 'company',
          url: result.url,
          date: result.publishedDate,
          description: result.text || '',
          relevanceScore: result.score || 0,
        });
      });

    } catch (exaError) {
      console.error('Exa AI API Error:', exaError);
      // Don't fail the whole request, proceed with what we have or mock data
      // Or, return an error if Exa data is critical and couldn't be fetched
      // For now, we'll add a placeholder item indicating the error.
      discoveredItems.push({
        id: 'exa-error',
        title: 'Error fetching data from Exa AI',
        type: 'other',
        url: '',
        description: exaError instanceof Error ? exaError.message : String(exaError),
        relevanceScore: 0
      });
    }
    
    // Deduplicate items by URL to avoid sending same content to OpenAI multiple times
    const uniqueUrls = new Set<string>();
    const uniqueDiscoveredItems = discoveredItems.filter(item => {
      if (!uniqueUrls.has(item.url)) {
        uniqueUrls.add(item.url);
        return true;
      }
      return false;
    });

    // --- TODO: OpenAI Integration --- 
    // 1. Take info from Exa (uniqueDiscoveredItems) and user input (body).
    // 2. Construct a prompt for OpenAI to generate resume sections.
    // 3. Generate the resume text.

    // Mock OpenAI response for now, using the fetched Exa items
    const mockResumeText = `
# ${body.name || 'Your Name'}
${body.description || 'A passionate developer.'}

## Experience
${body.jobs.map(job => `### ${job.title} at ${job.company}\n${job.startDate} - ${job.endDate}\n${job.description || ''}`).join('\n\n')}

## Discovered Online Presence & Job Context (from Exa AI)
This section highlights content found online related to your profile and the target job/company:
${uniqueDiscoveredItems.map(item => `- **${item.title}** (${item.type}, Score: ${item.relevanceScore.toFixed(2)})\n  URL: ${item.url}\n  Highlights: ${item.description.substring(0, 200)}...`).join('\n\n')}

This resume needs to be tailored for the ${body.role || 'New Role'} at ${body.companyWebsite || 'Target Company'}.
Job Posting: ${body.jobPostingUrl || 'N/A'}
`;

    const response: GenerateResumeResponse = {
      generatedResumeText: mockResumeText,
      discoveredContentItems: uniqueDiscoveredItems.length > 0 ? uniqueDiscoveredItems : [{
        id: 'no-exa-results',
        title: 'No specific content found by Exa AI or an error occurred.',
        type: 'other',
        url: '',
        description: 'Could not retrieve specific items from Exa AI. The resume will be based on your manual inputs.',
        relevanceScore: 0
      }],
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
