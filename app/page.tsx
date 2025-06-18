"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { /* Github, Youtube, */ Search /*, Link as LinkIcon, Rss, Mic */ } from "lucide-react"

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

const SectionDisplay: React.FC<{ title: string; items: ProfileItem[] | undefined; sectionKey: keyof ProfileData }> = ({ title, items, sectionKey }) => {
  if (!items || items.length === 0) {
    // Optionally, render a message like:
    // return <p className="mt-4 text-gray-600">No {title.toLowerCase()} found for this profile.</p>;
    return null;
  }
  return (
    <Card className="mt-6 w-full" id={`section-${String(sectionKey)}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Year</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={`${String(sectionKey)}-${index}`}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{item.date_or_year}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 break-words">{item.item}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 break-words">{item.details}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">
                    <a href={item.source} target="_blank" rel="noopener noreferrer" className="hover:underline">Link</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AutoResumePage() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  // const [contentItems, setContentItems] = useState<ContentItem[]>([]); // Old state
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    setIsLoading(true);
    setError(null);
    // setContentItems([]); // Old state update
    setProfileData(null); // Reset new state

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Profile data from backend:", data);
        setProfileData(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "An error occurred while fetching profile data from the backend.");
        console.error("Backend error:", errorData);
        setProfileData(null);
      }
    } catch (err: any) {
      console.error("Frontend error calling /api/generate-resume:", err);
      setError(`Failed to fetch profile: ${err.message || 'Unknown error'}`);
      setProfileData(null);
    }

    setIsLoading(false);
  };

  // const getContentIcon = (type: ContentItem['type']) => { // Old function
  //   switch (type) {
  //     case 'github': return <Github className="h-5 w-5 text-gray-500" />;
  //     case 'video': return <Youtube className="h-5 w-5 text-red-600" />;
  //     case 'blog': return <Rss className="h-5 w-5 text-orange-500" />;
  //     case 'talk': return <Mic className="h-5 w-5 text-blue-500" />;
  //     default: return <LinkIcon className="h-5 w-5 text-gray-400" />;
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">QuickCV</h1>
          <p className="text-lg text-gray-600 mt-2">Find anyone's professional footprint online.</p>
        </header>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Generate a Professional Profile</CardTitle>
            <CardDescription>Enter a full name to find their public work and projects using Exa Research API.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <Label htmlFor="name" className="sr-only">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., 'Will Bryk'"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <Button onClick={handleGenerate} disabled={isLoading} className="sm:w-auto w-full">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Researching...
                  </>
                ) : (
                  <><Search className="h-5 w-5 mr-2" /> Find Content</>
                )}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </CardContent>
        </Card>

        {profileData && (
          <div className="mt-10 w-full">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Generated Profile for {name}</h2>
            
            {profileData.impact_summary && (
              <Card className="mt-6 w-full bg-blue-50 border-blue-200" id="section-impact-summary">
                <CardHeader>
                  <CardTitle className="text-blue-700">Impact Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{profileData.impact_summary}</p>
                </CardContent>
              </Card>
            )}

            <SectionDisplay title="Work History" items={profileData.work_history} sectionKey="work_history" />
            <SectionDisplay title="Blogs / Articles" items={profileData.blogs_articles} sectionKey="blogs_articles" />
            <SectionDisplay title="Open Source / Code Projects" items={profileData.open_source_projects} sectionKey="open_source_projects" />
            <SectionDisplay title="Videos" items={profileData.videos} sectionKey="videos" />
            <SectionDisplay title="Conference / Meetup Talks" items={profileData.conference_meetup_talks} sectionKey="conference_meetup_talks" />
            <SectionDisplay title="Awards and Honours" items={profileData.awards_honours} sectionKey="awards_honours" />
            <SectionDisplay title="Public Praise on Social Media" items={profileData.public_praise_social_media} sectionKey="public_praise_social_media" />
            <SectionDisplay title="Domain-Specific Contributions" items={profileData.domain_specific_contributions} sectionKey="domain_specific_contributions" />
          </div>
        )}

        {/* {contentItems.length > 0 && ( // Old display logic
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Discovered Content</h2>
            <div className="space-y-4">
              {contentItems.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getContentIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">{item.title || 'Untitled'}</h3>
                      <p className="text-sm text-blue-600 hover:underline truncate">{item.url}</p>
                      {item.publishedDate && (
                        <p className="text-xs text-gray-500 mt-1">Published on: {new Date(item.publishedDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </a>
                </Card>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
