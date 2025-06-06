import { getMarketplaceGuidelines } from './smart-prompts';

interface KeywordTier {
  primary: string[];
  secondary: string[];
  longTail: string[];
}

export async function generateSEOKeywords(
  product: any,
  marketplace: string,
  maxPrimary: number = 5,
  maxSecondary: number = 8,
  maxLongTail: number = 8
): Promise<KeywordTier> {
  const marketplaceGuidelines = getMarketplaceGuidelines(marketplace);
  
  // Extract product information
  const productInfo = {
    title: product.title,
    description: product.description,
    category: product.category,
    brand: product.brand,
    features: product.bullet_points || [],
    price: product.price,
    attributes: product.attributes || {}
  };

  // Generate keywords based on product type and marketplace
  const keywords: KeywordTier = {
    primary: [],
    secondary: [],
    longTail: []
  };

  // Add brand + product type combinations as primary keywords
  if (productInfo.brand) {
    keywords.primary.push(`${productInfo.brand} ${productInfo.category}`);
  }

  // Add category-specific keywords
  if (productInfo.category) {
    keywords.primary.push(productInfo.category);
  }

  // Add feature-based keywords as secondary
  if (productInfo.features) {
    productInfo.features.forEach((feature: string) => {
      if (feature.length > 3) {
        keywords.secondary.push(feature.toLowerCase());
      }
    });
  }

  // Generate long-tail keywords
  if (productInfo.attributes) {
    Object.entries(productInfo.attributes).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 3) {
        keywords.longTail.push(`${key} ${value}`);
      }
    });
  }

  // Apply marketplace-specific optimizations
  switch (marketplace.toLowerCase()) {
    case 'amazon':
      // Amazon-specific keyword optimization
      keywords.primary = keywords.primary.map(k => k.replace(/[^a-zA-Z0-9\s]/g, ''));
      break;
    case 'shopify':
      // Shopify-specific keyword optimization
      keywords.primary = keywords.primary.map(k => k.toLowerCase());
      break;
    case 'etsy':
      // Etsy-specific keyword optimization
      keywords.primary = keywords.primary.map(k => k.replace(/\s+/g, ' ').trim());
      break;
  }

  // Limit the number of keywords in each tier
  keywords.primary = keywords.primary.slice(0, maxPrimary);
  keywords.secondary = keywords.secondary.slice(0, maxSecondary);
  keywords.longTail = keywords.longTail.slice(0, maxLongTail);

  return keywords;
}

export function validateKeywords(keywords: KeywordTier, marketplace: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for empty keyword tiers
  if (keywords.primary.length === 0) {
    issues.push('No primary keywords generated');
  }
  
  // Check keyword lengths
  keywords.primary.forEach(keyword => {
    if (keyword.length < 3) {
      issues.push(`Primary keyword too short: ${keyword}`);
    }
  });
  
  // Marketplace-specific validation
  switch (marketplace.toLowerCase()) {
    case 'amazon':
      // Amazon-specific validation
      keywords.primary.forEach(keyword => {
        if (keyword.length > 50) {
          issues.push(`Primary keyword too long for Amazon: ${keyword}`);
        }
      });
      break;
    case 'shopify':
      // Shopify-specific validation
      keywords.primary.forEach(keyword => {
        if (keyword.length > 70) {
          issues.push(`Primary keyword too long for Shopify: ${keyword}`);
        }
      });
      break;
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
} 