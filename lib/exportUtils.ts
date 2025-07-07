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
import { ProfileData, ProfileItem } from "@/components/profile/SortableRow";

export const exportToPDF = async (profileData: ProfileData, name: string) => {
  const profileContentElement = document.getElementById("profile-content");
  if (!profileContentElement) {
    throw new Error("Could not find profile content to download.");
  }

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
  let profileNameForFile = name.trim();
  if (!profileNameForFile) {
    profileNameForFile = "Unnamed";
  }
  const sanitizedName = profileNameForFile
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_");
  const finalFilename = `${sanitizedName}_Profile.pdf`;

  pdf.save(finalFilename);
};

export const exportToDocx = async (profileData: ProfileData, name: string) => {
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
