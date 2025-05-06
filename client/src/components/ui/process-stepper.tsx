import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  name: string;
  status: "completed" | "active" | "pending";
}

interface ProcessStepperProps {
  steps: Step[];
  className?: string;
}

export function ProcessStepper({ steps, className }: ProcessStepperProps) {
  return (
    <div className={cn("mb-12", className)}>
      <div className="flex items-center justify-between space-x-4">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={cn(
              "step-item flex-1 flex flex-col items-center",
              step.status
            )}
          >
            <div className="step-number h-10 w-10 rounded-full flex items-center justify-center text-white mb-2">
              {step.status === "completed" ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700">{step.name}</p>
            <div className={cn(
              "h-1 w-full mt-2 step-line",
              { 
                "bg-secondary": step.status === "completed",
                "bg-primary": step.status === "active", 
                "bg-gray-200": step.status === "pending"
              }
            )} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProcessStepper;
