"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search, Database, FileText, CheckCircle } from "lucide-react";

interface LoadingProgressProps {
  stage: 'searching' | 'analyzing' | 'formatting' | 'complete';
  message: string;
  progress: number;
}

const stages = [
  { key: 'searching', label: 'Searching Online', icon: Search },
  { key: 'analyzing', label: 'Analyzing Data', icon: Database },
  { key: 'formatting', label: 'Formatting Profile', icon: FileText },
  { key: 'complete', label: 'Complete', icon: CheckCircle },
];

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  stage,
  message,
  progress,
}) => {
  return (
    <Card className="w-full mt-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Generating Professional Profile
            </h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-between items-center">
            {stages.map((stageItem, index) => {
              const isActive = stageItem.key === stage;
              const isCompleted = stages.findIndex(s => s.key === stage) > index;
              const Icon = stageItem.icon;

              return (
                <div
                  key={stageItem.key}
                  className={`flex flex-col items-center space-y-2 ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isActive
                        ? 'bg-blue-100 border-2 border-blue-600'
                        : isCompleted
                        ? 'bg-green-100 border-2 border-green-600'
                        : 'bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? 'animate-pulse' : ''
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-center">
                    {stageItem.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Estimated Time */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              This usually takes 30-60 seconds
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export type { LoadingProgressProps };
