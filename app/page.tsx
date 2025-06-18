"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { /* Github, Youtube, */ Search, Download, FileText /*, Link as LinkIcon, Rss, Mic */ } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false); // Added state for PDF download
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

  const handleDownloadPdf = async () => {
    if (!profileData) return;

    setIsDownloadingPdf(true);
    const profileContentElement = document.getElementById('profile-content');
    if (!profileContentElement) {
      setError('Could not find profile content to download.');
      setIsDownloadingPdf(false);
      return;
    }

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 40; // margin in points
      
      // Add header with name and date
      pdf.setFontSize(24);
      pdf.setTextColor(33, 33, 33);
      pdf.text(`${name}'s Professional Profile`, margin, margin);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const today = format(new Date(), 'MMMM d, yyyy');
      pdf.text(`Generated on ${today}`, margin, margin + 20);
      
      let yPosition = margin + 50; // Starting y position after header
      
      // Add impact summary if available
      if (profileData.impact_summary) {
        pdf.setFontSize(16);
        pdf.setTextColor(33, 33, 33);
        pdf.text('Impact Summary', margin, yPosition);
        yPosition += 20;
        
        pdf.setFontSize(11);
        pdf.setTextColor(66, 66, 66);
        
        // Split text to fit within margins
        const splitText = pdf.splitTextToSize(profileData.impact_summary, pdfWidth - (margin * 2));
        pdf.text(splitText, margin, yPosition);
        yPosition += (splitText.length * 14) + 30; // Add space after text
      }
      
      // Function to add a section to the PDF
      const addSection = async (title: string, items: ProfileItem[], sectionId: string) => {
        if (!items || items.length === 0) return;
        
        // Check if we need a new page
        if (yPosition > pdfHeight - 100) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Add section title
        pdf.setFontSize(16);
        pdf.setTextColor(33, 33, 33);
        pdf.text(title, margin, yPosition);
        yPosition += 20;
        
        // Get the section element and convert to image
        const sectionElement = document.getElementById(`section-${sectionId}`);
        if (sectionElement) {
          const canvas = await html2canvas(sectionElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            removeContainer: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          
          // Calculate dimensions to fit within page width
          const imgWidth = imgProps.width;
          const imgHeight = imgProps.height;
          const aspectRatio = imgWidth / imgHeight;
          
          let newImgWidth = pdfWidth - (margin * 2);
          let newImgHeight = newImgWidth / aspectRatio;
          
          // Check if image will fit on current page
          if (yPosition + newImgHeight > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Add image to PDF
          pdf.addImage(imgData, 'PNG', margin, yPosition, newImgWidth, newImgHeight);
          yPosition += newImgHeight + 30; // Add space after section
        }
      };
      
      // Add each section to the PDF
      const sections = [
        { title: 'Work History', items: profileData.work_history, key: 'work_history' },
        { title: 'Blogs / Articles', items: profileData.blogs_articles, key: 'blogs_articles' },
        { title: 'Open Source / Code Projects', items: profileData.open_source_projects, key: 'open_source_projects' },
        { title: 'Videos', items: profileData.videos, key: 'videos' },
        { title: 'Conference / Meetup Talks', items: profileData.conference_meetup_talks, key: 'conference_meetup_talks' },
        { title: 'Awards and Honours', items: profileData.awards_honours, key: 'awards_honours' },
        { title: 'Public Praise on Social Media', items: profileData.public_praise_social_media, key: 'public_praise_social_media' },
        { title: 'Domain-Specific Contributions', items: profileData.domain_specific_contributions, key: 'domain_specific_contributions' }
      ];
      
      // Process each section sequentially
      for (const section of sections) {
        if (section.items) {
          await addSection(section.title, section.items, section.key);
        }
      }
      
      // Add footer with page numbers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pdfWidth - margin - 60, pdfHeight - 20);
        pdf.text('Generated with QuickCV', margin, pdfHeight - 20);
      }
      
      // Save the PDF
      let profileNameForFile = name.trim(); // Get the current name
      if (!profileNameForFile) { // If name is empty or just whitespace
        profileNameForFile = "Unnamed"; // Default to "Unnamed"
      }
      // Sanitize the profile name for use in a filename: remove non-alphanumeric (excluding hyphen/underscore), then replace spaces with underscores
      const sanitizedName = profileNameForFile.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const finalFilename = `${sanitizedName}_Profile.pdf`;
      
      console.log(`Attempting to save PDF as: ${finalFilename}`);
      pdf.save(finalFilename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. See console for details.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

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
          <div id="profile-content" className="mt-10 w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold text-gray-800">Generated Profile for {name}</h2>
              <Button 
                onClick={handleDownloadPdf} 
                disabled={isDownloadingPdf || !profileData}
                variant="outline"
                className="ml-4"
              >
                {isDownloadingPdf ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <><FileText className="h-5 w-5 mr-2" /> Export to PDF</>
                )}
              </Button>
            </div>
            
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
