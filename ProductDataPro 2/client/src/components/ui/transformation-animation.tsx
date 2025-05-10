import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface TransformationAnimationProps {
  originalData: {
    title: string;
    description: string;
    bulletPoints: string[];
  };
  enhancedData: {
    title: string;
    description: string;
    bullet_points: string[];
  };
  isPlaying: boolean;
  speed?: 'slow' | 'medium' | 'fast';
  fieldToAnimate?: 'all' | 'title' | 'description' | 'bulletPoints';
  highlightChanges?: boolean;
  onComplete?: () => void;
}

/**
 * A component that animates the transformation of product data
 * showing how the AI enhances raw data into polished marketplace content
 */
export function TransformationAnimation({
  originalData,
  enhancedData,
  isPlaying,
  speed = 'medium',
  fieldToAnimate = 'all',
  highlightChanges = true,
  onComplete
}: TransformationAnimationProps) {
  // States for each transforming field
  const [titleState, setTitleState] = useState(originalData.title);
  const [descriptionState, setDescriptionState] = useState(originalData.description);
  const [bulletPointsState, setBulletPointsState] = useState<string[]>(originalData.bulletPoints);
  
  // Animation timing states
  const [animationPhase, setAnimationPhase] = useState(0);
  const [sparkleEffects, setSparkleEffects] = useState<{ x: number, y: number }[]>([]);
  
  // Speed settings (in ms)
  const speedSettings = {
    slow: { charDelay: 60, phaseDelay: 1000 },
    medium: { charDelay: 30, phaseDelay: 700 },
    fast: { charDelay: 15, phaseDelay: 500 }
  };
  
  const { charDelay, phaseDelay } = speedSettings[speed];
  
  // Function to add sparkling effect at random positions
  const addSparkle = () => {
    const newSparkle = {
      x: Math.random() * 100,
      y: Math.random() * 100
    };
    
    setSparkleEffects(prev => [...prev, newSparkle]);
    
    // Remove the sparkle after animation completes
    setTimeout(() => {
      setSparkleEffects(prev => prev.filter(s => s !== newSparkle));
    }, 1000);
  };
  
  // Function to gradually transform text from original to enhanced
  const animateTextTransformation = (
    original: string, 
    enhanced: string, 
    stateSetter: React.Dispatch<React.SetStateAction<string>>,
    onFinish: () => void
  ) => {
    // If they're exactly the same, no need to animate
    if (original === enhanced) {
      stateSetter(enhanced);
      onFinish();
      return;
    }
    
    let currentText = original;
    let currentIndex = 0;
    const maxLen = Math.max(original.length, enhanced.length);
    
    // Function to process one character at a time
    const processNextChar = () => {
      if (currentIndex >= maxLen) {
        onFinish();
        return;
      }
      
      // Add random sparkle effect occasionally
      if (Math.random() > 0.8) {
        addSparkle();
      }
      
      // Calculate how much to change the text
      let charsToReplace = Math.min(
        1 + Math.floor(Math.random() * 3),
        enhanced.length - currentIndex
      );
      
      // Get current text up to the current position
      const prefix = enhanced.substring(0, currentIndex);
      
      // Get the new segment to add
      const newSegment = enhanced.substring(currentIndex, currentIndex + charsToReplace);
      
      // Get the remaining text from the original
      // This creates the effect of progressively replacing the original text
      const remainingSuffix = currentText.substring(currentIndex + charsToReplace);
      
      // Combine the parts
      currentText = prefix + newSegment + remainingSuffix;
      stateSetter(currentText);
      
      // Move to next position
      currentIndex += charsToReplace;
      
      // Continue animation if not complete
      if (currentIndex < maxLen) {
        setTimeout(processNextChar, charDelay);
      } else {
        // Ensure we end with the exact enhanced text
        stateSetter(enhanced);
        onFinish();
      }
    };
    
    // Start the animation process
    processNextChar();
  };
  
  // Function to animate bullet points transformation
  const animateBulletPointsTransformation = (
    original: string[], 
    enhanced: string[], 
    stateSetter: React.Dispatch<React.SetStateAction<string[]>>,
    onFinish: () => void
  ) => {
    // Create a working copy for transformation
    let currentBullets = [...original];
    
    // Ensure we have enough bullet points (pad with empty strings if needed)
    while (currentBullets.length < enhanced.length) {
      currentBullets.push('');
    }
    
    // Animate each bullet point sequentially
    const animateBullet = (bulletIndex: number) => {
      if (bulletIndex >= enhanced.length) {
        onFinish();
        return;
      }
      
      // Animate this specific bullet point
      const originalBullet = currentBullets[bulletIndex] || '';
      const enhancedBullet = enhanced[bulletIndex] || '';
      
      let currentText = originalBullet;
      let currentCharIndex = 0;
      const maxLen = Math.max(originalBullet.length, enhancedBullet.length);
      
      // Process one character at a time for this bullet
      const processNextChar = () => {
        if (currentCharIndex >= maxLen) {
          // Move to next bullet point
          setTimeout(() => animateBullet(bulletIndex + 1), phaseDelay);
          return;
        }
        
        // Add random sparkle effect occasionally
        if (Math.random() > 0.8) {
          addSparkle();
        }
        
        // Calculate how much to change
        let charsToReplace = Math.min(
          1 + Math.floor(Math.random() * 3),
          enhancedBullet.length - currentCharIndex
        );
        
        // Get current text up to current position
        const prefix = enhancedBullet.substring(0, currentCharIndex);
        
        // Get new segment to add
        const newSegment = enhancedBullet.substring(currentCharIndex, currentCharIndex + charsToReplace);
        
        // Get remaining from original
        const remainingSuffix = currentText.substring(currentCharIndex + charsToReplace);
        
        // Combine parts
        currentText = prefix + newSegment + remainingSuffix;
        
        // Update the specific bullet point
        const updatedBullets = [...currentBullets];
        updatedBullets[bulletIndex] = currentText;
        currentBullets = updatedBullets;
        stateSetter(updatedBullets);
        
        // Move to next position
        currentCharIndex += charsToReplace;
        
        // Continue animation if not complete
        if (currentCharIndex < maxLen) {
          setTimeout(processNextChar, charDelay);
        } else {
          // Ensure we end with exact enhanced text for this bullet
          const finalBullets = [...currentBullets];
          finalBullets[bulletIndex] = enhancedBullet;
          currentBullets = finalBullets;
          stateSetter(finalBullets);
          
          // Move to next bullet
          setTimeout(() => animateBullet(bulletIndex + 1), phaseDelay);
        }
      };
      
      // Start animating this bullet
      processNextChar();
    };
    
    // Start with the first bullet
    animateBullet(0);
  };
  
  // Start the animation sequence when isPlaying becomes true
  useEffect(() => {
    if (isPlaying) {
      // Reset all states to original
      setTitleState(originalData.title);
      setDescriptionState(originalData.description);
      setBulletPointsState(originalData.bulletPoints);
      setAnimationPhase(0);
      setSparkleEffects([]);
      
      // Start the animation sequence
      const startAnimation = () => {
        // Determine which fields to animate
        const shouldAnimateTitle = fieldToAnimate === 'all' || fieldToAnimate === 'title';
        const shouldAnimateDescription = fieldToAnimate === 'all' || fieldToAnimate === 'description';
        const shouldAnimateBullets = fieldToAnimate === 'all' || fieldToAnimate === 'bulletPoints';
        
        // Phase 1: Animate the title
        if (shouldAnimateTitle) {
          setAnimationPhase(1);
          animateTextTransformation(
            originalData.title,
            enhancedData.title,
            setTitleState,
            () => {
              // When title animation is complete, move to description
              setTimeout(() => {
                if (shouldAnimateDescription) {
                  setAnimationPhase(2);
                  animateTextTransformation(
                    originalData.description,
                    enhancedData.description,
                    setDescriptionState,
                    () => {
                      // When description is complete, move to bullet points
                      setTimeout(() => {
                        if (shouldAnimateBullets) {
                          setAnimationPhase(3);
                          animateBulletPointsTransformation(
                            originalData.bulletPoints,
                            enhancedData.bullet_points,
                            setBulletPointsState,
                            () => {
                              // All animations complete
                              setAnimationPhase(4);
                              if (onComplete) onComplete();
                            }
                          );
                        } else {
                          // Skip bullet points
                          setAnimationPhase(4);
                          if (onComplete) onComplete();
                        }
                      }, phaseDelay);
                    }
                  );
                } else if (shouldAnimateBullets) {
                  // Skip description, go to bullets
                  setAnimationPhase(3);
                  animateBulletPointsTransformation(
                    originalData.bulletPoints,
                    enhancedData.bullet_points,
                    setBulletPointsState,
                    () => {
                      // All animations complete
                      setAnimationPhase(4);
                      if (onComplete) onComplete();
                    }
                  );
                } else {
                  // Skip both description and bullets
                  setAnimationPhase(4);
                  if (onComplete) onComplete();
                }
              }, phaseDelay);
            }
          );
        } else if (shouldAnimateDescription) {
          // Skip title, start with description
          setAnimationPhase(2);
          animateTextTransformation(
            originalData.description,
            enhancedData.description,
            setDescriptionState,
            () => {
              setTimeout(() => {
                if (shouldAnimateBullets) {
                  setAnimationPhase(3);
                  animateBulletPointsTransformation(
                    originalData.bulletPoints,
                    enhancedData.bullet_points,
                    setBulletPointsState,
                    () => {
                      setAnimationPhase(4);
                      if (onComplete) onComplete();
                    }
                  );
                } else {
                  setAnimationPhase(4);
                  if (onComplete) onComplete();
                }
              }, phaseDelay);
            }
          );
        } else if (shouldAnimateBullets) {
          // Skip title and description, start with bullets
          setAnimationPhase(3);
          animateBulletPointsTransformation(
            originalData.bulletPoints,
            enhancedData.bullet_points,
            setBulletPointsState,
            () => {
              setAnimationPhase(4);
              if (onComplete) onComplete();
            }
          );
        } else {
          // Nothing to animate
          setAnimationPhase(4);
          if (onComplete) onComplete();
        }
      };
      
      // Start the animation sequence after a short delay
      setTimeout(startAnimation, 500);
    }
  }, [isPlaying, originalData, enhancedData, fieldToAnimate, speed, charDelay, phaseDelay, onComplete]);
  
  // Determine which sections to show based on fieldToAnimate
  const showTitle = fieldToAnimate === 'all' || fieldToAnimate === 'title';
  const showDescription = fieldToAnimate === 'all' || fieldToAnimate === 'description';
  const showBulletPoints = fieldToAnimate === 'all' || fieldToAnimate === 'bulletPoints';
  
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Sparkle effects */}
      {sparkleEffects.map((sparkle, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 1 }}
          style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
        >
          <Sparkles className="text-blue-500 h-6 w-6" />
        </motion.div>
      ))}
      
      <div className="p-6 space-y-6">
        {/* Animation phase indicator */}
        <div className="mb-4 flex justify-center">
          <div className="flex gap-2">
            <div className={`h-2 w-2 rounded-full ${animationPhase >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`h-2 w-2 rounded-full ${animationPhase >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`h-2 w-2 rounded-full ${animationPhase >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`h-2 w-2 rounded-full ${animationPhase >= 4 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          </div>
        </div>
        
        {/* Title transformation */}
        {showTitle && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500">
              {animationPhase === 1 ? 'Enhancing title...' : 'Product Title'}
            </div>
            <div 
              className={`p-4 rounded-md ${
                animationPhase === 1 
                  ? 'bg-blue-50 border border-blue-100' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {titleState}
              </h3>
            </div>
          </div>
        )}
        
        {/* Description transformation */}
        {showDescription && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500">
              {animationPhase === 2 ? 'Creating compelling description...' : 'Product Description'}
            </div>
            <div 
              className={`p-4 rounded-md ${
                animationPhase === 2 
                  ? 'bg-blue-50 border border-blue-100' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <p className="text-gray-700 whitespace-pre-wrap">
                {descriptionState}
              </p>
            </div>
          </div>
        )}
        
        {/* Bullet points transformation */}
        {showBulletPoints && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500">
              {animationPhase === 3 ? 'Generating key feature highlights...' : 'Key Features'}
            </div>
            <div 
              className={`p-4 rounded-md ${
                animationPhase === 3 
                  ? 'bg-blue-50 border border-blue-100' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <ul className="list-disc pl-5 space-y-2">
                {bulletPointsState.map((point, index) => (
                  <li key={index} className="text-gray-700">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Animation phase message */}
        <div className="text-center text-sm text-gray-500 italic mt-4">
          {animationPhase === 0 && "Preparing for enhancement..."}
          {animationPhase === 1 && "Creating an attention-grabbing title..."}
          {animationPhase === 2 && "Crafting a detailed, persuasive description..."}
          {animationPhase === 3 && "Highlighting key product features and benefits..."}
          {animationPhase === 4 && "Enhancement complete! Your product is marketplace-ready."}
        </div>
      </div>
    </div>
  );
}