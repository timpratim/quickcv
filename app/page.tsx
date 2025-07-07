"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  /* Github, Youtube, */ Search,
  Download,
  FileText,
  Edit,
  Save,
  X,
  GripVertical /*, Link as LinkIcon, Rss, Mic */,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  impact_summary?: string[];
}

const SortableRow: React.FC<{
  item: ProfileItem;
  index: number;
  sectionKey: keyof ProfileData;
  isEditing: boolean;
  onItemChange: (
    sectionKey: keyof ProfileData,
    itemIndex: number,
    field: keyof ProfileItem,
    value: string
  ) => void;
  onDeleteItem: (sectionKey: keyof ProfileData, itemIndex: number) => void;
}> = ({
  item,
  index,
  sectionKey,
  isEditing,
  onItemChange,
  onDeleteItem,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${String(sectionKey)}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "bg-gray-100" : ""}`}
      key={`${String(sectionKey)}-${index}`}
    >
      {isEditing && (
        <td className="px-2 py-4 w-8">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </td>
      )}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
        {isEditing ? (
          <Input
            value={item.date_or_year}
            onChange={(e) =>
              onItemChange(
                sectionKey,
                index,
                "date_or_year",
                e.target.value
              )
            }
            className="min-w-0 text-sm text-gray-700 border-0 bg-transparent p-1 focus:bg-white focus:border-gray-300"
          />
        ) : (
          item.date_or_year
        )}
      </td>
      <td className="px-4 py-4 text-sm font-medium text-gray-900 break-words">
        {isEditing ? (
          <Textarea
            value={item.item}
            onChange={(e) =>
              onItemChange(
                sectionKey,
                index,
                "item",
                e.target.value
              )
            }
            className="min-w-0 text-sm font-medium text-gray-900 border-0 bg-transparent p-1 focus:bg-white focus:border-gray-300 min-h-8"
            rows={1}
          />
        ) : (
          item.item
        )}
      </td>
      <td className="px-4 py-4 text-sm text-gray-700 break-words">
        {isEditing ? (
          <div className="flex items-start gap-2">
            <Textarea
              value={item.details}
              onChange={(e) =>
                onItemChange(
                  sectionKey,
                  index,
                  "details",
                  e.target.value
                )
              }
              className="min-w-0 text-sm text-gray-700 border-0 bg-transparent p-1 focus:bg-white focus:border-gray-300 min-h-8 flex-1"
              rows={2}
            />
            {sectionKey === "work_history" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteItem(sectionKey, index)}
                className="text-red-500 hover:text-red-700 p-1 h-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          item.details
        )}
      </td>
      {sectionKey !== "work_history" && (
        <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={item.source}
                onChange={(e) =>
                  onItemChange(
                    sectionKey,
                    index,
                    "source",
                    e.target.value
                  )
                }
                className="min-w-0 text-sm text-blue-600 border-0 bg-transparent p-1 focus:bg-white focus:border-gray-300"
                placeholder="URL"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteItem(sectionKey, index)}
                className="text-red-500 hover:text-red-700 p-1 h-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <a
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Link
            </a>
          )}
        </td>
      )}
    </tr>
  );
};

const SectionDisplay: React.FC<{
  title: string;
  items: ProfileItem[] | undefined;
  sectionKey: keyof ProfileData;
  isEditing: boolean;
  onItemChange: (
    sectionKey: keyof ProfileData,
    itemIndex: number,
    field: keyof ProfileItem,
    value: string
  ) => void;
  onDeleteItem: (sectionKey: keyof ProfileData, itemIndex: number) => void;
  onAddItem: (sectionKey: keyof ProfileData) => void;
  onReorderItems: (sectionKey: keyof ProfileData, oldIndex: number, newIndex: number) => void;
}> = ({
  title,
  items,
  sectionKey,
  isEditing,
  onItemChange,
  onDeleteItem,
  onAddItem,
  onReorderItems,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!items || items.length === 0) {
    // Optionally, render a message like:
    // return <p className="mt-4 text-gray-600">No {title.toLowerCase()} found for this profile.</p>;
    return null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && items) {
      const oldIndex = items.findIndex((_, i) => `${String(sectionKey)}-${i}` === active.id);
      const newIndex = items.findIndex((_, i) => `${String(sectionKey)}-${i}` === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderItems(sectionKey, oldIndex, newIndex);
      }
    }
  }

  return (
    <Card className="mt-6 w-full" id={`section-${String(sectionKey)}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isEditing && (
                    <th
                      scope="col"
                      className="px-2 py-3 w-8"
                    >
                      <span className="sr-only">Drag handle</span>
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date/Year
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                  {sectionKey !== "work_history" && (
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Source
                    </th>
                  )}
                </tr>
              </thead>
              <SortableContext
                items={items.map((_, i) => `${String(sectionKey)}-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <SortableRow
                      key={`${String(sectionKey)}-${index}`}
                      item={item}
                      index={index}
                      sectionKey={sectionKey}
                      isEditing={isEditing}
                      onItemChange={onItemChange}
                      onDeleteItem={onDeleteItem}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
        {isEditing && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddItem(sectionKey)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              + Add New Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AutoResumePage() {
  const [name, setName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [personalWebsite, setPersonalWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false); // Added state for PDF download
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false); // Added state for DOCX download
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalProfileData, setOriginalProfileData] =
    useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [contentItems, setContentItems] = useState<ContentItem[]>([]); // Old state
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGenerate = async () => {
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    // Validate that at least one social media handle is provided
    const hasAtLeastOneHandle = linkedinUrl.trim() || githubHandle.trim() || twitterHandle.trim() || personalWebsite.trim();
    if (!hasAtLeastOneHandle) {
      setError("Please provide at least one social media handle or website to identify the exact person.");
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
        body: JSON.stringify({ 
          name,
          linkedinUrl: linkedinUrl.trim(),
          githubHandle: githubHandle.trim(),
          twitterHandle: twitterHandle.trim(),
          personalWebsite: personalWebsite.trim()
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Profile data from backend:", data);

        // Convert impact_summary from string to array if needed
        if (data.impact_summary && typeof data.impact_summary === "string") {
          // Split by sentences that end with periods, keeping the periods
          const sentences = data.impact_summary
            .split(/(\.\s+)/)
            .reduce((acc: string[], part: string, index: number) => {
              if (index % 2 === 0) {
                // This is actual content
                if (part.trim()) {
                  acc.push(part.trim());
                }
              } else {
                // This is a separator (period + space)
                if (acc.length > 0) {
                  acc[acc.length - 1] += ".";
                }
              }
              return acc;
            }, [])
            .filter((sentence: string) => sentence.length > 0);

          data.impact_summary = sentences;
        }

        setProfileData(data);
        setOriginalProfileData(JSON.parse(JSON.stringify(data))); // Deep copy for editing
        setIsEditing(false);
      } else {
        const errorData = await res.json();
        setError(
          errorData.error ||
            "An error occurred while fetching profile data from the backend."
        );
        console.error("Backend error:", errorData);
        setProfileData(null);
      }
    } catch (err: unknown) {
      console.error("Frontend error calling /api/generate-resume:", err);
      setError(
        `Failed to fetch profile: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setProfileData(null);
    }

    setIsLoading(false);
  };

  const handleDownloadPdf = async () => {
    if (!profileData) return;

    setIsDownloadingPdf(true);
    const profileContentElement = document.getElementById("profile-content");
    if (!profileContentElement) {
      setError("Could not find profile content to download.");
      setIsDownloadingPdf(false);
      return;
    }

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
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
      const today = format(new Date(), "MMMM d, yyyy");
      pdf.text(`Generated on ${today}`, margin, margin + 20);

      let yPosition = margin + 50; // Starting y position after header

      // Add impact summary if available
      if (profileData.impact_summary && profileData.impact_summary.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(33, 33, 33);
        pdf.text("Impact Summary", margin, yPosition);
        yPosition += 20;

        pdf.setFontSize(11);
        pdf.setTextColor(66, 66, 66);

        // Add each bullet point
        profileData.impact_summary.forEach((point) => {
          if (point.trim()) {
            // Add bullet point
            pdf.text("•", margin, yPosition);

            // Remove markdown link formatting for PDF
            const plainText = point.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

            // Split text to fit within margins
            const splitText = pdf.splitTextToSize(
              plainText,
              pdfWidth - margin * 2 - 20
            );
            pdf.text(splitText, margin + 20, yPosition);
            yPosition += splitText.length * 14 + 5; // Add space after each point
          }
        });
        yPosition += 25; // Add extra space after impact summary
      }

      // Function to add a section to the PDF
      const addSection = async (
        title: string,
        items: ProfileItem[],
        sectionId: string
      ) => {
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
            removeContainer: true,
          });

          const imgData = canvas.toDataURL("image/png");
          const imgProps = pdf.getImageProperties(imgData);

          // Calculate dimensions to fit within page width
          const imgWidth = imgProps.width;
          const imgHeight = imgProps.height;
          const aspectRatio = imgWidth / imgHeight;

          const newImgWidth = pdfWidth - margin * 2;
          const newImgHeight = newImgWidth / aspectRatio;

          // Check if image will fit on current page
          if (yPosition + newImgHeight > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          // Add image to PDF
          pdf.addImage(
            imgData,
            "PNG",
            margin,
            yPosition,
            newImgWidth,
            newImgHeight
          );
          yPosition += newImgHeight + 30; // Add space after section
        }
      };

      // Add each section to the PDF
      const sections = [
        {
          title: "Work History",
          items: profileData.work_history,
          key: "work_history",
        },
        {
          title: "Blogs / Articles",
          items: profileData.blogs_articles,
          key: "blogs_articles",
        },
        {
          title: "Open Source / Code Projects",
          items: profileData.open_source_projects,
          key: "open_source_projects",
        },
        { title: "Videos", items: profileData.videos, key: "videos" },
        {
          title: "Conference / Meetup Talks",
          items: profileData.conference_meetup_talks,
          key: "conference_meetup_talks",
        },
        {
          title: "Awards and Honours",
          items: profileData.awards_honours,
          key: "awards_honours",
        },
        {
          title: "Public Praise on Social Media",
          items: profileData.public_praise_social_media,
          key: "public_praise_social_media",
        },
        {
          title: "Domain-Specific Contributions",
          items: profileData.domain_specific_contributions,
          key: "domain_specific_contributions",
        },
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
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pdfWidth - margin - 60,
          pdfHeight - 20
        );
        pdf.text("Generated with QuickCV", margin, pdfHeight - 20);
      }

      // Save the PDF
      let profileNameForFile = name.trim(); // Get the current name
      if (!profileNameForFile) {
        // If name is empty or just whitespace
        profileNameForFile = "Unnamed"; // Default to "Unnamed"
      }
      // Sanitize the profile name for use in a filename: remove non-alphanumeric (excluding hyphen/underscore), then replace spaces with underscores
      const sanitizedName = profileNameForFile
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_");
      const finalFilename = `${sanitizedName}_Profile.pdf`;

      console.log(`Attempting to save PDF as: ${finalFilename}`);
      pdf.save(finalFilename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. See console for details.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!profileData) return;

    setIsDownloadingDocx(true);

    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Header with name and date
              new Paragraph({
                text: `${name}'s Professional Profile`,
                heading: HeadingLevel.TITLE,
                spacing: {
                  after: 400,
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Generated on ${format(new Date(), "MMMM d, yyyy")}`,
                    size: 20,
                    color: "666666",
                  }),
                ],
                spacing: {
                  after: 600,
                },
              }),

              // Impact Summary
              ...(profileData.impact_summary &&
              profileData.impact_summary.length > 0
                ? [
                    new Paragraph({
                      text: "Impact Summary",
                      heading: HeadingLevel.HEADING_1,
                      spacing: {
                        before: 400,
                        after: 200,
                      },
                    }),
                    ...(profileData.impact_summary || []).map((point) => {
                      // Remove markdown link formatting for DOCX
                      const plainText = point.replace(
                        /\[([^\]]+)\]\([^)]+\)/g,
                        "$1"
                      );
                      return new Paragraph({
                        children: [
                          new TextRun({ text: "• ", color: "0066CC" }),
                          new TextRun({ text: plainText }),
                        ],
                        spacing: {
                          after: 100,
                        },
                      });
                    }),
                    new Paragraph({
                      text: "",
                      spacing: {
                        after: 400,
                      },
                    }),
                  ]
                : []),

              // Helper function to create sections
              ...createDocxSections(profileData),
            ],
          },
        ],
      });

      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      let profileNameForFile = name.trim();
      if (!profileNameForFile) {
        profileNameForFile = "Unnamed";
      }
      const sanitizedName = profileNameForFile
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_");
      const finalFilename = `${sanitizedName}_Profile.docx`;

      saveAs(blob, finalFilename);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      setError("Failed to generate DOCX. See console for details.");
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  // Helper function to create DOCX sections
  const createDocxSections = (data: ProfileData) => {
    const sections = [
      { title: "Work History", items: data.work_history },
      { title: "Blogs / Articles", items: data.blogs_articles },
      {
        title: "Open Source / Code Projects",
        items: data.open_source_projects,
      },
      { title: "Videos", items: data.videos },
      {
        title: "Conference / Meetup Talks",
        items: data.conference_meetup_talks,
      },
      { title: "Awards and Honours", items: data.awards_honours },
      {
        title: "Public Praise on Social Media",
        items: data.public_praise_social_media,
      },
      {
        title: "Domain-Specific Contributions",
        items: data.domain_specific_contributions,
      },
    ];

    const docxElements = [];

    for (const section of sections) {
      if (section.items && section.items.length > 0) {
        // Section heading
        docxElements.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_1,
            spacing: {
              before: 600,
              after: 200,
            },
          })
        );

        // Create table for section data
        const tableRows = [
          // Header row
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ text: "Date/Year", style: "tableHeader" }),
                ],
                width: { size: 15, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({ text: "Item", style: "tableHeader" }),
                ],
                width: { size: 30, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({ text: "Details", style: "tableHeader" }),
                ],
                width: { size: 40, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({ text: "Source", style: "tableHeader" }),
                ],
                width: { size: 15, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
          // Data rows
          ...section.items.map(
            (item) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: item.date_or_year })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: item.item })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: item.details })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Link",
                            color: "0066CC",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              })
          ),
        ];

        docxElements.push(
          new Table({
            rows: tableRows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }) // Space after table
        );
      }
    }

    return docxElements;
  };

  // Editing functions
  const handleItemChange = (
    sectionKey: keyof ProfileData,
    itemIndex: number,
    field: keyof ProfileItem,
    value: string
  ) => {
    if (!profileData) return;

    const newProfileData = { ...profileData };
    const sectionItems = newProfileData[sectionKey] as ProfileItem[];
    if (sectionItems && sectionItems[itemIndex]) {
      sectionItems[itemIndex] = {
        ...sectionItems[itemIndex],
        [field]: value,
      };
      setProfileData(newProfileData);
    }
  };

  const handleDeleteItem = (
    sectionKey: keyof ProfileData,
    itemIndex: number
  ) => {
    if (!profileData) return;

    const newProfileData = { ...profileData };
    const sectionItems = newProfileData[sectionKey] as ProfileItem[];
    if (sectionItems) {
      sectionItems.splice(itemIndex, 1);
      setProfileData(newProfileData);
    }
  };

  const handleAddItem = (sectionKey: keyof ProfileData) => {
    if (!profileData) return;

    const newProfileData = { ...profileData };
    const sectionItems = newProfileData[sectionKey] as ProfileItem[];
    if (sectionItems) {
      sectionItems.push({
        date_or_year: "",
        item: "",
        details: "",
        source: "",
      });
    } else {
      (newProfileData[sectionKey] as ProfileItem[]) = [
        {
          date_or_year: "",
          item: "",
          details: "",
          source: "",
        },
      ];
    }
    setProfileData(newProfileData);
  };

  const handleReorderItems = (
    sectionKey: keyof ProfileData,
    oldIndex: number,
    newIndex: number
  ) => {
    if (!profileData) return;

    const newProfileData = { ...profileData };
    const sectionItems = newProfileData[sectionKey] as ProfileItem[];
    if (sectionItems) {
      const reorderedItems = arrayMove(sectionItems, oldIndex, newIndex);
      (newProfileData[sectionKey] as ProfileItem[]) = reorderedItems;
      setProfileData(newProfileData);
    }
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    setOriginalProfileData(JSON.parse(JSON.stringify(profileData)));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setProfileData(JSON.parse(JSON.stringify(originalProfileData)));
    setIsEditing(false);
  };

  const handleImpactSummaryChange = (index: number, value: string) => {
    if (!profileData) return;
    const newImpactSummary = [...(profileData.impact_summary || [])];
    newImpactSummary[index] = value;
    setProfileData({
      ...profileData,
      impact_summary: newImpactSummary,
    });
  };

  const handleAddImpactSummaryPoint = () => {
    if (!profileData) return;
    const newImpactSummary = [...(profileData.impact_summary || []), ""];
    setProfileData({
      ...profileData,
      impact_summary: newImpactSummary,
    });
  };

  const handleDeleteImpactSummaryPoint = (index: number) => {
    if (!profileData) return;
    const newImpactSummary = [...(profileData.impact_summary || [])];
    newImpactSummary.splice(index, 1);
    setProfileData({
      ...profileData,
      impact_summary: newImpactSummary,
    });
  };

  // Helper function to render markdown links
  const renderTextWithLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {match[1]}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
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
          <p className="text-lg text-gray-600 mt-2">
            Find anyone&apos;s professional footprint online.
          </p>
        </header>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Generate a Professional Profile</CardTitle>
            <CardDescription>
              Enter a full name and social media handles to find their exact public work and projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                {isClient ? (
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="text-base mt-1"
                  />
                ) : (
                  <div className="h-10 bg-gray-100 border border-gray-300 rounded-md flex items-center px-3 text-gray-500 mt-1">
                    e.g., John Smith
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Social Media Handles <span className="text-red-500">* (at least one required)</span>
                </Label>
                
                <div>
                  <Label htmlFor="linkedin" className="text-xs text-gray-600">LinkedIn Profile URL</Label>
                  {isClient ? (
                    <Input
                      id="linkedin"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      disabled={isLoading}
                      className="text-sm mt-1"
                    />
                  ) : (
                    <div className="h-9 bg-gray-100 border border-gray-300 rounded-md flex items-center px-3 text-gray-500 text-sm mt-1">
                      https://linkedin.com/in/username
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="github" className="text-xs text-gray-600">GitHub Username</Label>
                  {isClient ? (
                    <Input
                      id="github"
                      value={githubHandle}
                      onChange={(e) => setGithubHandle(e.target.value)}
                      placeholder="github-username"
                      disabled={isLoading}
                      className="text-sm mt-1"
                    />
                  ) : (
                    <div className="h-9 bg-gray-100 border border-gray-300 rounded-md flex items-center px-3 text-gray-500 text-sm mt-1">
                      github-username
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="twitter" className="text-xs text-gray-600">X/Twitter Handle</Label>
                  {isClient ? (
                    <Input
                      id="twitter"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="@username"
                      disabled={isLoading}
                      className="text-sm mt-1"
                    />
                  ) : (
                    <div className="h-9 bg-gray-100 border border-gray-300 rounded-md flex items-center px-3 text-gray-500 text-sm mt-1">
                      @username
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="website" className="text-xs text-gray-600">Personal Website</Label>
                  {isClient ? (
                    <Input
                      id="website"
                      value={personalWebsite}
                      onChange={(e) => setPersonalWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      disabled={isLoading}
                      className="text-sm mt-1"
                    />
                  ) : (
                    <div className="h-9 bg-gray-100 border border-gray-300 rounded-md flex items-center px-3 text-gray-500 text-sm mt-1">
                      https://yourwebsite.com
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" /> Generate Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {profileData && (
          <div id="profile-content" className="mt-10 w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold text-gray-800">
                Public Profile for {name}
              </h2>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveChanges}
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-5 w-5 mr-2" /> Save Changes
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-5 w-5 mr-2" /> Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleToggleEdit}
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-5 w-5 mr-2" /> Edit Profile
                    </Button>
                    <Button
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf || !profileData}
                      variant="outline"
                    >
                      {isDownloadingPdf ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText className="h-5 w-5 mr-2" /> Export to PDF
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadDocx}
                      disabled={isDownloadingDocx || !profileData}
                      variant="outline"
                    >
                      {isDownloadingDocx ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Generating DOCX...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" /> Export to DOCX
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {(profileData.impact_summary?.length || isEditing) && (
              <Card
                className="mt-6 w-full bg-blue-50 border-blue-200"
                id="section-impact-summary"
              >
                <CardHeader>
                  <CardTitle className="text-blue-700">
                    Impact Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      {(profileData.impact_summary || []).map(
                        (point, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <span className="text-blue-600 mt-1 flex-shrink-0">
                              •
                            </span>
                            <div className="flex-1 flex items-start gap-2">
                              <Textarea
                                value={point}
                                onChange={(e) =>
                                  handleImpactSummaryChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                className="text-gray-700 border-0 bg-transparent p-1 focus:bg-white focus:border-gray-300 min-h-8 flex-1"
                                placeholder="Enter impact point..."
                                rows={1}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteImpactSummaryPoint(index)
                                }
                                className="text-red-500 hover:text-red-700 p-1 h-auto"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddImpactSummaryPoint}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        + Add Impact Point
                      </Button>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {profileData.impact_summary?.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-blue-600 mt-1 flex-shrink-0">
                            •
                          </span>
                          <span className="text-gray-700">
                            {renderTextWithLinks(point)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            <SectionDisplay
              title="Work History"
              items={profileData.work_history}
              sectionKey="work_history"
              isEditing={isEditing}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onReorderItems={handleReorderItems}
            />
            <SectionDisplay
              title="Blogs / Articles"
              items={profileData.blogs_articles}
              sectionKey="blogs_articles"
              isEditing={isEditing}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onReorderItems={handleReorderItems}
            />
            <SectionDisplay
              title="Open Source / Code Projects"
              items={profileData.open_source_projects}
              sectionKey="open_source_projects"
              isEditing={isEditing}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onReorderItems={handleReorderItems}
            />
            <SectionDisplay
              title="Videos"
              items={profileData.videos}
              sectionKey="videos"
              isEditing={isEditing}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onReorderItems={handleReorderItems}
            />
            <SectionDisplay
              title="Conference / Meetup Talks"
              items={profileData.conference_meetup_talks}
              sectionKey="conference_meetup_talks"
              isEditing={isEditing}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onReorderItems={handleReorderItems}
            />
            <SectionDisplay
              title="Awards and Honours"
              items={profileData.awards_honours}
              sectionKey="awards_honours"
              isEditing={isEditing}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onReorderItems={handleReorderItems}
            />
            <SectionDisplay
              title="Public Praise on Social Media"
              items={profileData.public_praise_social_media}
              sectionKey="public_praise_social_media"
              isEditing={isEditing}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onReorderItems={handleReorderItems}
            />
            <SectionDisplay
              title="Domain-Specific Contributions"
              items={profileData.domain_specific_contributions}
              sectionKey="domain_specific_contributions"
              isEditing={isEditing}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onReorderItems={handleReorderItems}
            />
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
