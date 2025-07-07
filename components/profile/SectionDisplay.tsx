"use client";

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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableRow, ProfileItem, ProfileData } from "./SortableRow";

interface SectionDisplayProps {
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
}

export const SectionDisplay: React.FC<SectionDisplayProps> = ({
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
