import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, FileText, CheckCircle2 } from "lucide-react";

interface TransformationAnimationProps {
  originalData: {
    title?: string;
    description?: string;
    bulletPoints?: string[];
    [key: string]: any;
  };
  enhancedData: {
    title?: string;
    description?: string;
    bulletPoints?: string[];
    [key: string]: any;
  };
  isPlaying?: boolean;
  onComplete?: () => void;
  speed?: "slow" | "medium" | "fast";
  highlightChanges?: boolean;
  fieldToAnimate?: string;
}

export function TransformationAnimation({
  originalData,
  enhancedData,
  isPlaying = true,
  onComplete,
  speed = "medium",
  highlightChanges = true,
  fieldToAnimate = "all",
}: TransformationAnimationProps) {
  const [stage, setStage] = useState<"original" | "transforming" | "enhanced" | "complete">(
    "original"
  );
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Timing configurations based on speed setting
  const timings = {
    slow: { initial: 1500, field: 2000, between: 800 },
    medium: { initial: 800, field: 1400, between: 500 },
    fast: { initial: 400, field: 800, between: 300 },
  };
  
  const currentTimings = timings[speed];

  // Fields to animate in sequence
  const fieldsToAnimate = 
    fieldToAnimate === "all" 
      ? ["title", "description", "bulletPoints"]
      : [fieldToAnimate];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying) {
      // Start with original data
      setStage("original");
      setProgress(0);
      
      // Wait a bit to show original data
      timer = setTimeout(() => {
        // Start transformation
        setStage("transforming");
        setProgress(10);
        
        // Animate each field in sequence
        fieldsToAnimate.forEach((field, index) => {
          setTimeout(() => {
            setCurrentField(field);
            setProgress(10 + ((index + 1) / fieldsToAnimate.length) * 70);
          }, currentTimings.initial + (index * (currentTimings.field + currentTimings.between)));
        });
        
        // After all fields are transformed, show completed view
        setTimeout(() => {
          setStage("enhanced");
          setProgress(90);
          
          // Complete the animation
          setTimeout(() => {
            setStage("complete");
            setProgress(100);
            if (onComplete) onComplete();
          }, currentTimings.between);
        }, currentTimings.initial + (fieldsToAnimate.length * (currentTimings.field + currentTimings.between)));
      }, currentTimings.initial);
    }
    
    return () => clearTimeout(timer);
  }, [isPlaying, fieldsToAnimate.length, currentTimings, onComplete]);

  // Animation variants for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };
  
  const fieldVariants = {
    original: { x: 0, opacity: 1 },
    transforming: { opacity: 0.5, scale: 0.95, transition: { duration: 0.3 } },
    exit: { x: -20, opacity: 0, transition: { duration: 0.3 } },
  };
  
  const enhancedVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };
  
  const sparkleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: [0, 1, 0.8, 1, 0],
      scale: [0, 1.2, 1, 1.1, 0],
      transition: { duration: 2, times: [0, 0.2, 0.4, 0.6, 1] }
    },
  };

  const renderFieldContent = (field: string, data: any, isEnhanced: boolean = false) => {
    switch (field) {
      case "title":
        return (
          <div className={`text-lg font-medium ${isEnhanced ? "text-blue-700" : "text-gray-700"}`}>
            {data.title || "No title available"}
          </div>
        );
      
      case "description":
        return (
          <div className={`text-sm ${isEnhanced ? "text-gray-700" : "text-gray-600"}`}>
            {data.description || "No description available"}
          </div>
        );
        
      case "bulletPoints":
        return (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {Array.isArray(data.bulletPoints) && data.bulletPoints.length > 0 ? (
              data.bulletPoints.map((point: string, idx: number) => (
                <li key={idx} className={isEnhanced ? "text-gray-700" : "text-gray-600"}>
                  {point}
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic">No bullet points available</li>
            )}
          </ul>
        );
        
      default:
        return <div>Unknown field type</div>;
    }
  };

  const getLabelForField = (field: string): string => {
    switch (field) {
      case "title": return "Product Title";
      case "description": return "Product Description";
      case "bulletPoints": return "Feature Bullets";
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  // Helper to highlight differences in text
  const getHighlightedText = (text: string, isEnhanced: boolean) => {
    if (!highlightChanges || !isEnhanced) return text;
    
    // Simple highlighting for demonstration purposes
    // In a real app, you would use a diff algorithm to identify changes
    return text;
  };

  return (
    <div className="relative">
      {/* Progress bar at top */}
      {(stage === "transforming" || stage === "enhanced") && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Transforming Product Data</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}
      
      {/* Main transformation container */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Original data side */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Original Data</h3>
          </div>
          
          <div className="space-y-4">
            {fieldsToAnimate.map((field) => (
              <div key={`original-${field}`} className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-gray-500">
                  {getLabelForField(field)}
                </h4>
                
                <AnimatePresence mode="wait">
                  {(stage === "original" || (stage === "transforming" && currentField !== field)) && (
                    <motion.div
                      key={`original-content-${field}`}
                      variants={fieldVariants}
                      initial="original"
                      animate={currentField === field ? "transforming" : "original"}
                      exit="exit"
                      className="min-h-[40px]"
                    >
                      {renderFieldContent(field, originalData)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
        
        {/* Arrow and transformation animation */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <ArrowRight className="h-6 w-6 text-blue-600" />
          </div>
          
          {stage === "transforming" && currentField && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={sparkleVariants}
              initial="hidden"
              animate="visible"
              key={`spark-${currentField}`}
            >
              <Sparkles className="h-12 w-12 text-yellow-400" />
            </motion.div>
          )}
        </div>
        
        {/* Enhanced data side */}
        <div className={`bg-white p-5 rounded-lg border shadow-sm ${stage !== "original" ? "border-blue-200" : "border-gray-200"}`}>
          <div className="flex items-center mb-3">
            <div className={`flex items-center justify-center h-5 w-5 mr-2 ${stage === "complete" ? "text-green-500" : "text-blue-500"}`}>
              {stage === "complete" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-700">
              {stage === "complete" ? "Enhanced Data" : "AI Transformation"}
            </h3>
          </div>
          
          <div className="space-y-4">
            {fieldsToAnimate.map((field) => (
              <div key={`enhanced-${field}`} className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-gray-500">
                  {getLabelForField(field)}
                </h4>
                
                <AnimatePresence mode="wait">
                  {(stage === "original" || (stage === "transforming" && currentField !== field)) && (
                    <motion.div
                      key={`placeholder-${field}`}
                      initial={{ opacity: 0.5 }}
                      className="min-h-[40px] flex items-center justify-center"
                    >
                      <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                    </motion.div>
                  )}
                  
                  {((stage === "transforming" && currentField === field) || 
                    stage === "enhanced" || 
                    stage === "complete") && (
                    <motion.div
                      key={`enhanced-content-${field}`}
                      variants={enhancedVariants}
                      initial="hidden"
                      animate="visible"
                      className={`min-h-[40px] ${currentField === field ? "bg-blue-50 p-2 rounded-md border border-blue-100" : ""}`}
                    >
                      {renderFieldContent(field, enhancedData, true)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Mobile arrow indicator - only show on small screens */}
      <div className="md:hidden flex justify-center my-4">
        <motion.div 
          className="rounded-full bg-blue-100 p-2"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <ArrowRight className="h-6 w-6 text-blue-600 transform rotate-90" />
        </motion.div>
      </div>
      
      {/* Completion indicator */}
      {stage === "complete" && (
        <motion.div 
          className="mt-4 p-3 bg-green-50 rounded-md border border-green-100 text-sm text-green-800 flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
          <p>
            Product data enhancement complete. All fields have been optimized for better marketplace performance.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default TransformationAnimation;