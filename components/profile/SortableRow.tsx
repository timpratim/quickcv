"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, X } from "lucide-react";

export interface ProfileItem {
  date_or_year: string;
  item: string;
  details: string;
  source: string;
}

export interface ProfileData {
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

interface SortableRowProps {
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
}

export const SortableRow: React.FC<SortableRowProps> = ({
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
