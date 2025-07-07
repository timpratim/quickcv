"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface ProfileFormData {
  name: string;
  linkedinUrl: string;
  githubHandle: string;
  twitterHandle: string;
  personalWebsite: string;
}

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
  isLoading: boolean;
  error: string | null;
  isClient: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSubmit,
  isLoading,
  error,
  isClient,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    linkedinUrl: "",
    githubHandle: "",
    twitterHandle: "",
    personalWebsite: "",
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const hasAtLeastOneHandle = 
    formData.linkedinUrl.trim() || 
    formData.githubHandle.trim() || 
    formData.twitterHandle.trim() || 
    formData.personalWebsite.trim();

  const isFormValid = formData.name.trim() && hasAtLeastOneHandle;

  return (
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
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
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
                  value={formData.githubHandle}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubHandle: e.target.value }))}
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
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
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
                  value={formData.personalWebsite}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalWebsite: e.target.value }))}
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
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
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
  );
};

export type { ProfileFormData };
