import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  status?: "incomplete" | "current" | "complete";
  disabled?: boolean;
}

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  direction?: "horizontal" | "vertical";
  responsive?: boolean;
  children: React.ReactNode;
}

export const Step = ({
  title,
  status = "incomplete",
  disabled = false,
  className,
  ...props
}: StepProps) => {
  return (
    <div 
      className={cn(
        "flex items-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div 
        className={cn(
          "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border",
          status === "incomplete" && "border-gray-300 bg-white text-gray-500",
          status === "current" && "border-blue-600 bg-blue-600 text-white",
          status === "complete" && "border-blue-600 bg-blue-600 text-white"
        )}
      >
        {status === "complete" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : status === "current" ? (
          <Circle className="w-5 h-5 fill-white stroke-blue-600" />
        ) : (
          <span></span>
        )}
      </div>
      <div className="ml-2">
        <div
          className={cn(
            "text-sm font-medium",
            status === "incomplete" && "text-gray-500",
            status === "current" && "text-blue-600",
            status === "complete" && "text-blue-600"
          )}
        >
          {title}
        </div>
      </div>
    </div>
  );
};

export const Steps = ({
  current,
  direction = "horizontal",
  responsive = true,
  children,
  className,
  ...props
}: StepsProps) => {
  // Convert children to array and count steps
  const stepsArray = React.Children.toArray(children);
  const stepsCount = stepsArray.length;

  // Map steps with status
  const steps = stepsArray.map((step, index) => {
    if (React.isValidElement(step)) {
      let status: "incomplete" | "current" | "complete" = "incomplete";
      
      if (index < current) {
        status = "complete";
      } else if (index === current) {
        status = "current";
      }
      
      return React.cloneElement(step, {
        status,
        key: index,
      });
    }
    return step;
  });

  return (
    <div
      className={cn(
        "flex items-center",
        direction === "vertical" ? "flex-col" : "flex-row",
        responsive && direction === "horizontal" ? "overflow-x-auto" : "",
        className
      )}
      {...props}
    >
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center",
            direction === "horizontal" && "flex-row",
            direction === "vertical" && "flex-col",
            index < stepsCount - 1 && "flex-1"
          )}
        >
          {/* Step */}
          {step}
          
          {/* Connector line between steps */}
          {index < stepsCount - 1 && (
            <div
              className={cn(
                direction === "horizontal"
                  ? "flex-1 h-[1px] mx-4 bg-gray-300"
                  : "w-[1px] h-8 my-1 bg-gray-300",
                index < current && "bg-blue-600"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Steps;