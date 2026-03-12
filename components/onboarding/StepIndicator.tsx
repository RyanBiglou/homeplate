import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              index < currentStep
                ? "bg-homeplate-orange text-white"
                : index === currentStep
                  ? "border-2 border-homeplate-orange text-homeplate-orange"
                  : "border-2 border-gray-300 text-gray-400"
            )}
          >
            {index < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 w-8",
                index < currentStep ? "bg-homeplate-orange" : "bg-gray-300"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
