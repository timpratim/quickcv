"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { ProfileData } from "./SortableRow";
import { exportToPDF, exportToDocx } from "@/lib/exportUtils";

interface ExportButtonsProps {
  profileData: ProfileData;
  name: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  profileData,
  name,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await exportToPDF(profileData, name);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    try {
      await exportToDocx(profileData, name);
    } catch (error) {
      console.error("Error generating DOCX:", error);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        onClick={handleDownloadPdf}
        disabled={isDownloadingPdf}
        variant="outline"
        className="flex-1"
      >
        {isDownloadingPdf ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </>
        )}
      </Button>
      <Button
        onClick={handleDownloadDocx}
        disabled={isDownloadingDocx}
        variant="outline"
        className="flex-1"
      >
        {isDownloadingDocx ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            Generating DOCX...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Download DOCX
          </>
        )}
      </Button>
    </div>
  );
};
