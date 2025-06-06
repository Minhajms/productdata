import { getMarketplaceGuidelines } from './smart-prompts';

interface ImageContext {
  url: string;
  position: number;
  isMainImage: boolean;
  productType: string;
  brand?: string;
  features?: string[];
  attributes?: Record<string, string>;
}

export async function generateImageAltText(
  imageContext: ImageContext,
  marketplace: string,
  maxLength: number = 125
): Promise<string> {
  const marketplaceGuidelines = getMarketplaceGuidelines(marketplace);
  
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
    components.push(`view ${imageContext.position}`);
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
    const relevantAttributes = Object.entries(imageContext.attributes)
      .filter(([_, value]) => typeof value === 'string' && value.length < 20)
      .slice(0, 1);
      
    if (relevantAttributes.length > 0) {
      const [key, value] = relevantAttributes[0];
      components.push(`${key} ${value}`);
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