/**
 * Prompt Utilities Service
 * 
 * This service provides functions for generating specific types of prompts
 * to be used with various AI models.
 */

import { getProductTypePrompt, getMarketplaceGuidelines } from './smart-prompts';

/**
 * Generate a prompt for product research
 * @param product The product data
 * @returns Research prompt
 */
export function generateProductResearchPrompt(product: any): string {
  return `
Please research and provide insights about the following product:
${JSON.stringify(product, null, 2)}

Based on the information provided, please answer the following:
1. What is this product? Provide a clear, comprehensive understanding.
2. What are the likely key features and benefits of this product?
3. Who is the target audience for this product?
4. What are common use cases for this product?
5. What related products or accessories might complement this product?

Your response should be factual and based solely on the information provided and your general knowledge of this product category.
`;
}

/**
 * Generate a prompt for title generation
 * @param product The product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum title length
 * @returns Title generation prompt
 */
export function generateTitlePrompt(product: any, marketplace: string, maxLength: number = 200): string {
  const productType = product.category?.toLowerCase() || 'generic';
  
  // Get product type-specific guidance
  let productTypeGuidance = getProductTypePrompt(productType);
  
  // Get marketplace-specific guidance
  let marketplaceGuidance = getMarketplaceGuidelines(marketplace);
  
  return `
Please create an optimized product title for the following product to be listed on ${marketplace}:
${JSON.stringify(product, null, 2)}

Product type guidance: ${productTypeGuidance}
Marketplace guidance: ${marketplaceGuidance}

The title should:
- Be under ${maxLength} characters
- Include the brand name (if available)
- Highlight key features and benefits
- Include relevant keywords for searchability
- Be clear, concise, and compelling
- Follow ${marketplace} best practices for titles

Return ONLY the title text without quotation marks or any additional commentary.
`;
}

/**
 * Generate a prompt for description generation
 * @param product The product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum description length
 * @returns Description generation prompt
 */
export function generateDescriptionPrompt(product: any, marketplace: string, maxLength: number = 2000): string {
  const productType = product.category?.toLowerCase() || 'generic';
  
  // Get product type-specific guidance
  let productTypeGuidance = getProductTypePrompt(productType);
  
  // Get marketplace-specific guidance
  let marketplaceGuidance = getMarketplaceGuidelines(marketplace);
  
  return `
Please create a compelling product description for the following product to be listed on ${marketplace}:
${JSON.stringify(product, null, 2)}

Product type guidance: ${productTypeGuidance}
Marketplace guidance: ${marketplaceGuidance}

The description should:
- Be under ${maxLength} characters
- Highlight key features and benefits
- Address potential customer pain points and questions
- Use appropriate formatting for ${marketplace} (paragraphs, bullet points as needed)
- Be persuasive but factual, avoiding excessive claims
- Include relevant technical specifications
- Follow ${marketplace} best practices for descriptions

Return ONLY the description text without any additional commentary.
`;
}

/**
 * Generate a prompt for bullet point generation
 * @param product The product data
 * @param marketplace Target marketplace
 * @param count Number of bullet points to generate
 * @returns Bullet point generation prompt
 */
export function generateBulletPointsPrompt(product: any, marketplace: string, count: number = 5): string {
  const productType = product.category?.toLowerCase() || 'generic';
  
  // Get product type-specific guidance
  let productTypeGuidance = getProductTypePrompt(productType);
  
  // Get marketplace-specific guidance
  let marketplaceGuidance = getMarketplaceGuidelines(marketplace);
  
  return `
Please create ${count} persuasive bullet points for the following product to be listed on ${marketplace}:
${JSON.stringify(product, null, 2)}

Product type guidance: ${productTypeGuidance}
Marketplace guidance: ${marketplaceGuidance}

The bullet points should:
- Highlight the most important features and benefits
- Be concise and scannable
- Focus on different aspects of the product
- Address potential customer questions or concerns
- Use strong, benefit-focused language
- Follow ${marketplace} best practices for bullet points

Return EXACTLY ${count} bullet points, ONE PER LINE, without bullet symbols or any additional commentary.
`;
}

/**
 * Generate a prompt for CSV analysis
 * @param csvSample Sample of CSV data
 * @returns CSV analysis prompt
 */
export function generateCsvAnalysisPrompt(csvSample: string): string {
  return `
Please analyze this CSV product data:
${csvSample}

For this product data:
1. Identify the product type/category represented
2. Evaluate the data quality and completeness
3. Identify missing fields that would be important for this product type
4. Suggest fields that could be enhanced with AI
5. Recommend optimizations for marketplace listings based on this data

Respond with a detailed analysis focusing on how to improve the product data quality.
`;
}