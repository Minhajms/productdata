import { Product } from "@shared/schema";
import { getMarketplaceRequirements, getMissingFields } from "../../client/src/lib/marketplace-requirements";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Enhances product data using the OpenAI API
 * @param products List of products to enhance
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @returns Enhanced product data
 */
export async function enhanceProductDataWithOpenAI(products: any[], marketplace: string): Promise<Product[]> {
  const enhancedProducts: Product[] = [];
  const apiKey = process.env.OPENAI_API_KEY || "";
  
  if (!apiKey) {
    console.error("Missing OpenAI API key");
    throw new Error("Missing OpenAI API key. Please set the OPENAI_API_KEY environment variable.");
  }
  
  const marketplaceConfig = getMarketplaceRequirements(marketplace);
  
  for (const product of products) {
    try {
      // Get missing fields for this product
      const missingFields = getMissingFields(product, marketplace);
      
      if (missingFields.length === 0) {
        // No missing fields, no enhancement needed
        enhancedProducts.push(product);
        continue;
      }
      
      // Clone the product to avoid modifying the original
      const enhancedProduct = { ...product };
      
      // Process each missing field
      for (const field of missingFields) {
        const normalizedField = field.toLowerCase().replace(/\s+/g, '_');
        
        // Generate content based on field type
        if (normalizedField === 'title') {
          enhancedProduct.title = await generateTitleWithOpenAI(
            product, 
            marketplace, 
            marketplaceConfig.formatGuidelines.title?.maxLength || 200
          );
        } else if (normalizedField === 'description') {
          enhancedProduct.description = await generateDescriptionWithOpenAI(
            product, 
            marketplace,
            marketplaceConfig.formatGuidelines.description?.maxLength || 2000
          );
        } else if (normalizedField === 'bullet_points') {
          enhancedProduct.bullet_points = await generateBulletPointsWithOpenAI(
            product, 
            marketplace,
            marketplaceConfig.formatGuidelines.bullet_points?.count || 5
          );
        } else if (normalizedField === 'brand' && !product.brand) {
          enhancedProduct.brand = await suggestBrandWithOpenAI(product);
        } else if (normalizedField === 'category' && !product.category) {
          enhancedProduct.category = await suggestCategoryWithOpenAI(product, marketplace);
        } else if (normalizedField === 'asin' && marketplace === 'Amazon' && !product.asin) {
          enhancedProduct.asin = generateRandomASIN();
        }
      }
      
      enhancedProducts.push(enhancedProduct);
    } catch (error) {
      console.error(`Error enhancing product ${product.product_id}:`, error);
      // Add the original product to maintain the count
      enhancedProducts.push(product);
    }
  }
  
  return enhancedProducts;
}

/**
 * Calls the OpenAI API to generate content
 * @param prompt The prompt to send to OpenAI
 * @returns Generated content
 */
async function callOpenAIAPI(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional product listing optimizer that creates marketplace-ready product content." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });

    const generatedContent = response.choices[0].message.content;
    return generatedContent ? generatedContent.trim() : "";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

/**
 * Generates an SEO-optimized product title
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum title length
 * @returns Generated title
 */
async function generateTitleWithOpenAI(product: any, marketplace: string, maxLength: number): Promise<string> {
  const existingInfo = [
    product.product_id,
    product.description,
    product.brand,
    product.category
  ].filter(Boolean).join(", ");
  
  const prompt = `
    Create an SEO-optimized product title for ${marketplace} marketplace. 
    Keep it under ${maxLength} characters.
    Make it descriptive and include important features.
    If possible, include brand and key attributes.
    Don't use ALL CAPS or excessive special characters.
    
    Product details: ${existingInfo}
    
    Return ONLY the title text with no additional explanation or formatting.
  `;
  
  const title = await callOpenAIAPI(prompt);
  return title.substring(0, maxLength);
}

/**
 * Generates a detailed product description
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum description length
 * @returns Generated description
 */
async function generateDescriptionWithOpenAI(product: any, marketplace: string, maxLength: number): Promise<string> {
  const existingInfo = [
    product.title,
    product.product_id,
    product.brand,
    product.category
  ].filter(Boolean).join(", ");
  
  const prompt = `
    Create a detailed product description for ${marketplace} marketplace.
    Keep it under ${maxLength} characters.
    Include key features, benefits, and use cases.
    Use clear, professional language with appropriate paragraph breaks.
    Be accurate and persuasive without being overly promotional.
    
    Product details: ${existingInfo}
    
    Return ONLY the description text with no additional explanation or formatting.
  `;
  
  const description = await callOpenAIAPI(prompt);
  return description.substring(0, maxLength);
}

/**
 * Generates bullet points highlighting key product features
 * @param product Product data
 * @param marketplace Target marketplace
 * @param count Number of bullet points to generate
 * @returns Array of bullet points
 */
async function generateBulletPointsWithOpenAI(product: any, marketplace: string, count: number): Promise<string[]> {
  const existingInfo = [
    product.title,
    product.description,
    product.product_id,
    product.brand,
    product.category
  ].filter(Boolean).join(", ");
  
  const prompt = `
    Create ${count} bullet points for ${marketplace} product listing.
    Each bullet point should highlight a key feature or benefit.
    Keep each bullet point concise (under 100 characters if possible).
    Be specific and focus on what makes the product valuable to customers.
    
    Product details: ${existingInfo}
    
    Return ONLY a list of ${count} bullet points, one per line, with no additional explanation or formatting.
  `;
  
  const bulletPointsText = await callOpenAIAPI(prompt);
  // Split by newlines and clean up
  const bulletPoints = bulletPointsText
    .split('\n')
    .map(point => point.trim())
    .filter(point => point.length > 0 && !point.startsWith('•'))
    .map(point => point.startsWith('-') ? point.substring(1).trim() : point)
    .slice(0, count);
  
  // If we don't have enough bullet points, pad with empty ones
  while (bulletPoints.length < count) {
    bulletPoints.push(`Feature ${bulletPoints.length + 1}`);
  }
  
  return bulletPoints;
}

/**
 * Suggests a brand name based on product information
 * @param product Product data
 * @returns Suggested brand name
 */
async function suggestBrandWithOpenAI(product: any): Promise<string> {
  const existingInfo = [
    product.title,
    product.description,
    product.product_id,
    product.category
  ].filter(Boolean).join(", ");
  
  const prompt = `
    Based on the product information, suggest a realistic brand name.
    If you can detect a brand name in the provided information, extract it.
    Otherwise, suggest a plausible brand name that would fit this type of product.
    Keep it short and professional.
    
    Product details: ${existingInfo}
    
    Return ONLY the brand name with no additional explanation or formatting.
  `;
  
  return await callOpenAIAPI(prompt);
}

/**
 * Suggests a product category based on product information
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Suggested product category
 */
async function suggestCategoryWithOpenAI(product: any, marketplace: string): Promise<string> {
  const existingInfo = [
    product.title,
    product.description,
    product.product_id,
    product.brand
  ].filter(Boolean).join(", ");
  
  const prompt = `
    Based on the product information, suggest the most appropriate product category for ${marketplace}.
    Keep it simple and use standard category names commonly found on ${marketplace}.
    Examples: Electronics, Home & Kitchen, Clothing, Beauty, Toys & Games, etc.
    
    Product details: ${existingInfo}
    
    Return ONLY the category name with no additional explanation or formatting.
  `;
  
  return await callOpenAIAPI(prompt);
}

/**
 * Generates a random ASIN (Amazon Standard Identification Number)
 * @returns Random ASIN
 */
function generateRandomASIN(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let asin = "B0";
  
  // ASINs are 10 characters, starting with "B0"
  for (let i = 0; i < 8; i++) {
    asin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return asin;
}