"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X } from "lucide-react";
import { SectionDisplay } from "./SectionDisplay";
import { ExportButtons } from "./ExportButtons";
import { ProfileData, ProfileItem } from "./SortableRow";
import { arrayMove } from "@dnd-kit/sortable";

interface ProfileDisplayProps {
  profileData: ProfileData;
  originalProfileData: ProfileData;
  name: string;
  onProfileDataChange: (data: ProfileData) => void;
  onOriginalProfileDataChange: (data: ProfileData) => void;
}

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({
  profileData,
  originalProfileData,
  name,
  onProfileDataChange,
  onOriginalProfileDataChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);

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
      onProfileDataChange(newProfileData);
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
      onProfileDataChange(newProfileData);
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
    onProfileDataChange(newProfileData);
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
      onProfileDataChange(newProfileData);
    }
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    onOriginalProfileDataChange(JSON.parse(JSON.stringify(profileData)));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    onProfileDataChange(JSON.parse(JSON.stringify(originalProfileData)));
    setIsEditing(false);
  };

  const handleImpactSummaryChange = (index: number, value: string) => {
    if (!profileData) return;
    const newImpactSummary = [...(profileData.impact_summary || [])];
    newImpactSummary[index] = value;
    onProfileDataChange({
      ...profileData,
      impact_summary: newImpactSummary,
    });
  };

  const handleAddImpactSummaryPoint = () => {
    if (!profileData) return;
    const newImpactSummary = [...(profileData.impact_summary || []), ""];
    onProfileDataChange({
      ...profileData,
      impact_summary: newImpactSummary,
    });
  };

  const handleDeleteImpactSummaryPoint = (index: number) => {
    if (!profileData) return;
    const newImpactSummary = [...(profileData.impact_summary || [])];
    newImpactSummary.splice(index, 1);
    onProfileDataChange({
      ...profileData,
      impact_summary: newImpactSummary,
    });
  };

  return (
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
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="sm"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={handleToggleEdit}
              variant="outline"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <ExportButtons profileData={profileData} name={name} />

      {/* Impact Summary */}
      {profileData.impact_summary && profileData.impact_summary.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Impact Summary
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {isEditing ? (
              <div className="space-y-3">
                {profileData.impact_summary.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-2">•</span>
                    <Textarea
                      value={point}
                      onChange={(e) => handleImpactSummaryChange(index, e.target.value)}
                      className="flex-1 min-h-[60px] bg-white"
                      placeholder="Enter impact point..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteImpactSummaryPoint(index)}
                      className="text-red-500 hover:text-red-700 mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddImpactSummaryPoint}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  + Add Impact Point
                </Button>
              </div>
            ) : (
              <ul className="list-none space-y-2">
                {profileData.impact_summary.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span className="text-gray-700">
                      {renderTextWithLinks(point)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Profile Sections */}
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
  );
};
