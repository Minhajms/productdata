/**
 * Image Alt Text Service
 * 
 * This service provides functions for generating optimized alt text
 * for product images across different marketplaces.
 */

import { getMarketplaceGuidelines, generateMarketplaceSystemPrompt } from './smart-prompts';
import { callOpenRouter } from './enhanced-openrouter-service';

/**
 * Interface defining the context for an image
 */
interface ImageContext {
  url: string;
  position: number;
  isMainImage: boolean;
  productType: string;
  brand?: string;
  features?: string[];
  attributes?: Record<string, string>;
}

/**
 * Generate optimized alt text for a product image
 * 
 * @param imageContext Information about the image context
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @param maxLength Maximum alt text length
 * @returns Generated alt text
 */
export async function generateImageAltText(
  imageContext: ImageContext,
  marketplace: string,
  maxLength: number = 125
): Promise<string> {
  // Get marketplace guidelines for alt text
  const marketplaceGuidelines = getMarketplaceGuidelines(marketplace);
  
  try {
    // Get system prompt for image alt text generation
    // This is a custom prompt role for SEO and accessibility optimization
    const systemPrompt = `You are an e-commerce accessibility and SEO specialist for ${marketplace}, specializing in creating effective alt text descriptions for product images that improve both accessibility and search ranking. Your alt text should:

1. Be concise but descriptive (under ${maxLength} characters)
2. Start with the product type and brand
3. Highlight what is uniquely visible in this specific image
4. Incorporate 1-2 relevant keywords naturally
5. Help both visually impaired shoppers and search engines understand the image

Do NOT:
- Start with phrases like "Image of" or "Photo of"
- Stuff with keywords unnaturally
- Use generic descriptions that could apply to any image
- Include unnecessary details not visible in the image`;
    
    // Format image context info for the AI
    const contextInfo = formatImageContextInfo(imageContext);
    
    // Generate user prompt
    const userPrompt = `
Please create a single, effective alt text description for this product image on ${marketplace}.

Image Context:
${contextInfo}

Your alt text should:
1. Be ${maxLength} characters maximum
2. Start with the product type and brand (if available)
3. Describe what is uniquely visible in this specific image
4. Be specific about the view (front, side, closeup of feature, etc.)
5. Include key visible attributes that would help someone understand the image

Create exactly ONE alt text description.
`;
    
    // Call AI to generate alt text
    const response = await callOpenRouter(systemPrompt, userPrompt, "openai/gpt-4o");
    
    // Clean up response and ensure it meets length requirements
    let altText = cleanupAltText(response);
    
    // Ensure alt text doesn't exceed maximum length
    if (altText.length > maxLength) {
      altText = altText.substring(0, maxLength - 3) + '...';
    }
    
    return altText;
  } catch (error) {
    console.error('Error generating image alt text:', error);
    return generateFallbackAltText(imageContext, marketplace, maxLength);
  }
}

/**
 * Format image context information for AI prompt
 * @param imageContext Image context object
 * @returns Formatted image context string
 */
function formatImageContextInfo(imageContext: ImageContext): string {
  let info = '';
  
  // Add image position information
  info += `Image Position: ${imageContext.position} ${imageContext.isMainImage ? '(Main Product Image)' : ''}\n`;
  
  // Add product type
  info += `Product Type: ${imageContext.productType}\n`;
  
  // Add brand if available
  if (imageContext.brand) {
    info += `Brand: ${imageContext.brand}\n`;
  }
  
  // Add up to 3 features if available
  if (imageContext.features && imageContext.features.length > 0) {
    info += 'Key Features:\n';
    const limitedFeatures = imageContext.features.slice(0, 3);
    limitedFeatures.forEach((feature, index) => {
      info += `${index + 1}. ${feature}\n`;
    });
  }
  
  // Add important attributes if available
  if (imageContext.attributes && Object.keys(imageContext.attributes).length > 0) {
    info += 'Product Attributes:\n';
    // Pick up to 5 most important attributes
    const importantAttrs = ['color', 'material', 'size', 'dimensions', 'style'];
    const attributeEntries = Object.entries(imageContext.attributes);
    
    // First add the important attributes if they exist
    importantAttrs.forEach(attrName => {
      const attr = attributeEntries.find(([key]) => 
        key.toLowerCase() === attrName.toLowerCase());
      if (attr) {
        info += `- ${attr[0]}: ${attr[1]}\n`;
      }
    });
    
    // Then add other attributes until we have up to 5 total
    let attrCount = 0;
    attributeEntries.forEach(([key, value]) => {
      if (!importantAttrs.some(attr => attr.toLowerCase() === key.toLowerCase()) && attrCount < 5) {
        info += `- ${key}: ${value}\n`;
        attrCount++;
      }
    });
  }
  
  return info;
}

/**
 * Clean up AI-generated alt text
 * @param text Raw alt text from AI
 * @returns Cleaned alt text
 */
function cleanupAltText(text: string): string {
  // Remove any "Alt text:" or similar prefixes
  let cleaned = text.replace(/^(alt text:?|image alt:?|alt description:?|description:?)\s*/i, '');
  
  // Remove quotes if the AI wrapped the alt text in them
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  } else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  
  // Remove common filler phrases
  cleaned = cleaned.replace(/^(an image of|a photo of|image showing|photo showing|picture of)\s+/i, '');
  
  // Trim any extra whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Generate fallback alt text when AI generation fails
 * @param imageContext Image context object
 * @param marketplace Target marketplace
 * @param maxLength Maximum alt text length
 * @returns Fallback alt text
 */
function generateFallbackAltText(
  imageContext: ImageContext,
  marketplace: string,
  maxLength: number = 125
): string {
  // Build base alt text components
  const components: string[] = [];
  
  // Add product type and brand
  if (imageContext.brand) {
    components.push(`${imageContext.brand} ${imageContext.productType}`);
  } else {
    components.push(imageContext.productType);
  }
  
  // Add position-specific context
  if (imageContext.isMainImage) {
    components.push('main product view');
  } else {
    const positions = ['front view', 'side view', 'back view', 'top view', 'detailed view'];
    const posText = imageContext.position <= positions.length 
      ? positions[imageContext.position - 1] 
      : `view ${imageContext.position}`;
    components.push(posText);
  }
  
  // Add relevant features if available
  if (imageContext.features && imageContext.features.length > 0) {
    const relevantFeature = imageContext.features[0];
    if (relevantFeature.length < 30) {
      components.push(`featuring ${relevantFeature.toLowerCase()}`);
    }
  }
  
  // Add relevant attributes if available
  if (imageContext.attributes) {
    const importantAttrs = ['color', 'material', 'size'];
    for (const attrName of importantAttrs) {
      const attrValue = imageContext.attributes[attrName];
      if (attrValue && typeof attrValue === 'string' && attrValue.length < 20) {
        components.push(`${attrName} ${attrValue}`);
        break; // Only add one attribute
      }
    }
  }
  
  // Combine components into alt text
  let altText = components.join(' ');
  
  // Apply marketplace-specific optimizations
  switch (marketplace.toLowerCase()) {
    case 'amazon':
      // Amazon-specific optimization
      altText = altText.replace(/[^a-zA-Z0-9\s]/g, '');
      break;
    case 'shopify':
      // Shopify-specific optimization
      altText = altText.toLowerCase();
      break;
    case 'etsy':
      // Etsy-specific optimization
      altText = altText.replace(/\s+/g, ' ').trim();
      break;
  }
  
  // Ensure alt text doesn't exceed maximum length
  if (altText.length > maxLength) {
    altText = altText.substring(0, maxLength - 3) + '...';
  }
  
  return altText;
}

/**
 * Validate alt text against marketplace guidelines
 * @param altText Alt text to validate
 * @param marketplace Target marketplace
 * @returns Validation result
 */
export function validateAltText(altText: string, marketplace: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for empty alt text
  if (!altText || altText.trim().length === 0) {
    issues.push('Alt text is empty');
  }
  
  // Check length
  if (altText.length > 125) {
    issues.push('Alt text exceeds maximum length of 125 characters');
  }
  
  // Check for common issues
  if (altText.toLowerCase().startsWith('image of') || 
      altText.toLowerCase().startsWith('photo of')) {
    issues.push('Alt text should not start with "image of" or "photo of"');
  }
  
  // Marketplace-specific validation
  switch (marketplace.toLowerCase()) {
    case 'amazon':
      // Amazon-specific validation
      if (altText.includes('sale') || altText.includes('discount')) {
        issues.push('Alt text should not include promotional terms');
      }
      break;
    case 'shopify':
      // Shopify-specific validation
      if (altText.length < 10) {
        issues.push('Alt text is too short for Shopify');
      }
      break;
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}