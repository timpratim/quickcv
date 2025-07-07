"use client";

import { useState, useEffect } from "react";
import { ProfileForm, ProfileFormData } from "@/components/profile/ProfileForm";
import { ProfileDisplay } from "@/components/profile/ProfileDisplay";
import { LoadingProgress } from "@/components/profile/LoadingProgress";
import { ProfileData } from "@/components/profile/SortableRow";

type LoadingStage = 'searching' | 'analyzing' | 'formatting' | 'complete';

export default function AutoResumePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('searching');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentName, setCurrentName] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const simulateProgressUpdates = () => {
    const stages = [
      { stage: 'searching' as LoadingStage, message: 'Searching social media profiles and online presence...', progress: 25 },
      { stage: 'analyzing' as LoadingStage, message: 'Analyzing professional data and contributions...', progress: 60 },
      { stage: 'formatting' as LoadingStage, message: 'Formatting comprehensive profile...', progress: 90 },
      { stage: 'complete' as LoadingStage, message: 'Profile generation complete!', progress: 100 },
    ];

    let currentStageIndex = 0;
    const updateStage = () => {
      if (currentStageIndex < stages.length) {
        const currentStage = stages[currentStageIndex];
        setLoadingStage(currentStage.stage);
        setLoadingMessage(currentStage.message);
        setProgress(currentStage.progress);
        currentStageIndex++;
        
        // Don't schedule next update if this is the last stage or if loading stopped
        if (currentStageIndex < stages.length) {
          setTimeout(updateStage, 15000); // 15 seconds between stages
        }
      }
    };

    // Start the first stage immediately
    updateStage();
  };

  const handleFormSubmit = async (formData: ProfileFormData) => {
    if (!formData.name.trim()) {
      setError("Please enter a name.");
      return;
    }

    const hasAtLeastOneHandle = 
      formData.linkedinUrl.trim() || 
      formData.githubHandle.trim() || 
      formData.twitterHandle.trim() || 
      formData.personalWebsite.trim();
    
    if (!hasAtLeastOneHandle) {
      setError("Please provide at least one social media handle or website to identify the exact person.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProfileData(null);
    setCurrentName(formData.name);
    
    // Start progress simulation
    setLoadingStage('searching');
    setLoadingMessage('Initializing research process...');
    setProgress(0);
    simulateProgressUpdates();

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          linkedinUrl: formData.linkedinUrl.trim(),
          githubHandle: formData.githubHandle.trim(),
          twitterHandle: formData.twitterHandle.trim(),
          personalWebsite: formData.personalWebsite.trim()
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Profile data from backend:", data);

        // Convert impact_summary from string to array if needed
        if (data.impact_summary && typeof data.impact_summary === "string") {
          const sentences = data.impact_summary
            .split(/(\.\s+)/)
            .reduce((acc: string[], part: string, index: number) => {
              if (index % 2 === 0) {
                if (part.trim()) {
                  acc.push(part.trim());
                }
              } else {
                if (acc.length > 0) {
                  acc[acc.length - 1] += ".";
                }
              }
              return acc;
            }, [])
            .filter((sentence: string) => sentence.length > 0);

          data.impact_summary = sentences;
        }

        // Complete the loading process
        setLoadingStage('complete');
        setLoadingMessage('Profile generated successfully!');
        setProgress(100);
        
        setTimeout(() => {
          setProfileData(data);
          setOriginalProfileData(JSON.parse(JSON.stringify(data)));
          setIsLoading(false);
        }, 1000); // Brief delay to show completion
      } else {
        const errorData = await res.json();
        setError(
          errorData.error ||
            "An error occurred while fetching profile data from the backend."
        );
        console.error("Backend error:", errorData);
        setProfileData(null);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error("Frontend error calling /api/generate-resume:", err);
      setError(
        `Failed to fetch profile: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setProfileData(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">QuickCV</h1>
          <p className="text-lg text-gray-600 mt-2">
            Internet is the new RESUME.
          </p>
        </header>

        {!isLoading && !profileData && (
          <ProfileForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            error={error}
            isClient={isClient}
          />
        )}

        {isLoading && (
          <LoadingProgress
            stage={loadingStage}
            message={loadingMessage}
            progress={progress}
          />
        )}

        {profileData && originalProfileData && (
          <ProfileDisplay
            profileData={profileData}
            originalProfileData={originalProfileData}
            name={currentName}
            onProfileDataChange={setProfileData}
            onOriginalProfileDataChange={setOriginalProfileData}
          />
        )}
      </div>
    </div>
  );
}
