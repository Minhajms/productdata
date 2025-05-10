/**
 * SEO Keyword Service
 * 
 * This service provides functions for generating optimized SEO keywords
 * for product listings across different marketplaces.
 */

import { getMarketplaceGuidelines, generateMarketplaceSystemPrompt } from './smart-prompts';
import { callOpenRouter } from './enhanced-openrouter-service';

/**
 * Interface for keyword tier assignments
 */
interface KeywordTier {
  primary: string[];
  secondary: string[];
  tertiary: string[];
}

/**
 * Generate optimized SEO keywords for a product
 * 
 * @param product Product data
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @returns SEO keywords object with tiered keywords
 */
export async function generateSEOKeywords(
  product: any,
  marketplace: string
): Promise<KeywordTier> {
  try {
    // Get system prompt for keyword generation
    const systemPrompt = generateMarketplaceSystemPrompt(marketplace, 'keywords');
    
    // Extract product type information if available
    const productType = product.detectedType || "Unknown Product";
    const productCategory = product.detectedCategory || "General Merchandise";
    
    // Generate user prompt for keyword generation with product type focus
    const userPrompt = `
Generate strategic SEO keywords for this ${productType} product to optimize for ${marketplace}:

${JSON.stringify(product, null, 2)}

This is a ${productType} in the ${productCategory} category.

For this specific ${productType} product, create:
1. PRIMARY KEYWORDS (5 max): High-value, high-intent search terms most likely to convert for ${productType} products
2. SECONDARY KEYWORDS (7-10): Relevant terms addressing specific features, uses, or variations of ${productType} products
3. TERTIARY KEYWORDS (10-15): Long-tail, specific phrases or related terms with less competition

Consider:
- User search intent and behavior for ${productType} products on ${marketplace}
- Competitive keyword landscape specifically for ${productType} products
- ${productType}-specific attributes, terminology, and features
- Seasonal or trending search patterns relevant to ${productType} products

Return in this JSON format only:
{
  "primary_keywords": ["keyword1", "keyword2", "keyword3"],
  "secondary_keywords": ["keyword1", "keyword2", "..."],
  "tertiary_keywords": ["keyword1", "keyword2", "..."]
}
`;
    
    // Call OpenRouter API for keywords
    const response = await callOpenRouter(systemPrompt, userPrompt, "openai/gpt-4o", { responseFormat: 'json' });
    
    try {
      // Parse JSON response
      const keywordData = JSON.parse(response);
      
      // Validate and format the response
      return {
        primary: Array.isArray(keywordData.primary_keywords) ? keywordData.primary_keywords : [],
        secondary: Array.isArray(keywordData.secondary_keywords) ? keywordData.secondary_keywords : [],
        tertiary: Array.isArray(keywordData.tertiary_keywords) ? keywordData.tertiary_keywords : []
      };
    } catch (jsonError) {
      console.error('Error parsing keywords JSON:', jsonError);
      
      // Try to extract keywords from text response
      return extractKeywordsFromText(response);
    }
  } catch (error) {
    console.error('Error generating SEO keywords:', error);
    
    // Generate fallback keywords based on product data
    return generateFallbackKeywords(product);
  }
}

/**
 * Extract keywords from a non-JSON text response
 * @param text Raw text response from AI
 * @returns Structured keyword tiers
 */
function extractKeywordsFromText(text: string): KeywordTier {
  // Default empty result
  const result: KeywordTier = {
    primary: [],
    secondary: [],
    tertiary: []
  };
  
  // Try to extract primary keywords section
  const primaryMatch = text.match(/primary\s*keywords?[:;\-]?\s*(.*?)(?=secondary|tertiary|$)/i);
  if (primaryMatch && primaryMatch[1]) {
    result.primary = extractKeywordArray(primaryMatch[1]);
  }
  
  // Try to extract secondary keywords section
  const secondaryMatch = text.match(/secondary\s*keywords?[:;\-]?\s*(.*?)(?=tertiary|$)/i);
  if (secondaryMatch && secondaryMatch[1]) {
    result.secondary = extractKeywordArray(secondaryMatch[1]);
  }
  
  // Try to extract tertiary keywords section
  const tertiaryMatch = text.match(/tertiary\s*keywords?[:;\-]?\s*(.*?)(?=$)/i);
  if (tertiaryMatch && tertiaryMatch[1]) {
    result.tertiary = extractKeywordArray(tertiaryMatch[1]);
  }
  
  return result;
}

/**
 * Extract an array of keywords from text
 * @param text Text containing keywords
 * @returns Array of keywords
 */
function extractKeywordArray(text: string): string[] {
  // Remove markdown, bullet points, numbers, etc.
  const cleanText = text.replace(/[*#\-\d\.]/g, '');
  
  // Split by newlines or commas
  const keywords = cleanText.split(/[,\n]+/)
    .map(k => k.trim())
    .filter(k => k.length > 0);
  
  return keywords;
}

/**
 * Generate fallback SEO keywords based on product data
 * @param product Product data
 * @returns Basic keyword structure
 */
function generateFallbackKeywords(product: any): KeywordTier {
  const keywords: KeywordTier = {
    primary: [],
    secondary: [],
    tertiary: []
  };
  
  // Extract relevant product fields
  const title = product.title || '';
  const description = product.description || '';
  const category = product.category || product.product_type || '';
  const brand = product.brand || '';
  const attributes = product.attributes || {};
  
  // Basic text processing
  const allText = `${title} ${description} ${category} ${brand} ${JSON.stringify(attributes)}`.toLowerCase();
  
  // Primary keywords: brand + product type
  if (brand) {
    keywords.primary.push(brand.toLowerCase());
    if (category) {
      keywords.primary.push(`${brand.toLowerCase()} ${category.toLowerCase()}`);
    }
  }
  
  // If we have a title, use it as a primary keyword source
  if (title) {
    // Split title and take first few words as primary keywords
    const titleWords = title.split(' ');
    if (titleWords.length >= 3) {
      keywords.primary.push(titleWords.slice(0, 3).join(' ').toLowerCase());
    }
    
    // Use title phrases as secondary keywords
    if (titleWords.length > 3) {
      for (let i = 0; i < titleWords.length - 2; i++) {
        const phrase = titleWords.slice(i, i + 3).join(' ').toLowerCase();
        if (phrase.length > 10 && !keywords.secondary.includes(phrase)) {
          keywords.secondary.push(phrase);
        }
      }
    }
  }
  
  // Add product attributes as secondary keywords
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === 'string' && value.length > 0) {
      keywords.secondary.push(`${category.toLowerCase()} ${value.toLowerCase()}`);
    }
  }
  
  // Process description for tertiary keywords
  if (description) {
    // Get most common words and phrases from description
    const words = description.toLowerCase().split(/\W+/).filter((w: string) => w.length > 3);
    const wordFreq: Record<string, number> = {};
    
    // Count word frequency
    words.forEach((word: string) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Sort by frequency and add top words as tertiary keywords
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
    
    keywords.tertiary.push(...topWords);
    
    // Add some bigrams (2-word phrases) as tertiary keywords
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (bigram.length > 5 && !keywords.tertiary.includes(bigram)) {
        keywords.tertiary.push(bigram);
      }
      
      // Limit to 15 tertiary keywords
      if (keywords.tertiary.length >= 15) break;
    }
  }
  
  // Deduplicate all keyword arrays and limit sizes
  keywords.primary = Array.from(new Set(keywords.primary)).slice(0, 5);
  keywords.secondary = Array.from(new Set(keywords.secondary)).slice(0, 10);
  keywords.tertiary = Array.from(new Set(keywords.tertiary)).slice(0, 15);
  
  return keywords;
}

/**
 * Get recommended keyword density for a marketplace
 * @param marketplace Target marketplace
 * @returns Recommended keyword density percentages
 */
export function getRecommendedKeywordDensity(marketplace: string): {
  title: number;
  description: number;
  bulletPoints: number;
} {
  const marketplace_lc = marketplace.toLowerCase();
  
  // Default densities
  const defaultDensity = {
    title: 15, // 15% keyword density in title
    description: 2, // 2% keyword density in description
    bulletPoints: 5 // 5% keyword density in bullet points
  };
  
  // Marketplace-specific densities
  switch (marketplace_lc) {
    case 'amazon':
      return {
        title: 20,
        description: 2,
        bulletPoints: 7
      };
    case 'shopify':
      return {
        title: 15,
        description: 1.5,
        bulletPoints: 5
      };
    case 'etsy':
      return {
        title: 25,
        description: 3,
        bulletPoints: 6
      };
    case 'ebay':
      return {
        title: 20,
        description: 2.5,
        bulletPoints: 5
      };
    case 'walmart':
      return {
        title: 15,
        description: 2,
        bulletPoints: 5
      };
    default:
      return defaultDensity;
  }
}

/**
 * Analyze keyword usage in product content
 * @param content Text content to analyze
 * @param keywords Keywords to check for
 * @returns Analysis results with usage stats
 */
export function analyzeKeywordUsage(
  content: string,
  keywords: KeywordTier
): {
  density: number;
  primaryCount: number;
  secondaryCount: number;
  tertiaryCount: number;
  missingPrimary: string[];
  suggestions: string[];
} {
  const contentLower = content.toLowerCase();
  const wordCount = contentLower.split(/\s+/).length;
  
  let keywordCount = 0;
  const primaryFound: string[] = [];
  const secondaryFound: string[] = [];
  const tertiaryFound: string[] = [];
  
  // Check primary keywords
  for (const keyword of keywords.primary) {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const matches = contentLower.match(regex) || [];
    if (matches.length > 0) {
      primaryFound.push(keyword);
      keywordCount += matches.length;
    }
  }
  
  // Check secondary keywords
  for (const keyword of keywords.secondary) {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const matches = contentLower.match(regex) || [];
    if (matches.length > 0) {
      secondaryFound.push(keyword);
      keywordCount += matches.length;
    }
  }
  
  // Check tertiary keywords
  for (const keyword of keywords.tertiary) {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const matches = contentLower.match(regex) || [];
    if (matches.length > 0) {
      tertiaryFound.push(keyword);
      keywordCount += matches.length;
    }
  }
  
  // Calculate density
  const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
  
  // Find missing primary keywords
  const missingPrimary = keywords.primary.filter(k => !primaryFound.includes(k));
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  // Suggest adding missing primary keywords
  if (missingPrimary.length > 0) {
    suggestions.push(`Add missing primary keywords: ${missingPrimary.join(', ')}`);
  }
  
  // Suggest if density is too low or too high
  if (density < 1) {
    suggestions.push('Increase keyword density by adding more relevant keywords');
  } else if (density > 10) {
    suggestions.push('Keyword density is too high; consider reducing keyword repetition');
  }
  
  return {
    density,
    primaryCount: primaryFound.length,
    secondaryCount: secondaryFound.length,
    tertiaryCount: tertiaryFound.length,
    missingPrimary,
    suggestions
  };
}