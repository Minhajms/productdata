import { Product } from "@shared/schema";
import { getMarketplaceRequirements, getMissingFields } from "../../client/src/lib/marketplace-requirements";

/**
 * Enhances product data using the Gemini API
 * @param products List of products to enhance
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @returns Enhanced product data
 */
export async function enhanceProductData(products: any[], marketplace: string): Promise<Product[]> {
  const enhancedProducts: Product[] = [];
  const apiKey = process.env.GEMINI_API_KEY || "";
  
  if (!apiKey) {
    console.error("Missing Gemini API key");
    throw new Error("Missing Gemini API key. Please set the GEMINI_API_KEY environment variable.");
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
          enhancedProduct.title = await generateTitle(
            product, 
            marketplace, 
            marketplaceConfig.formatGuidelines.title?.maxLength || 200
          );
        } else if (normalizedField === 'description') {
          enhancedProduct.description = await generateDescription(
            product, 
            marketplace,
            marketplaceConfig.formatGuidelines.description?.maxLength || 2000
          );
        } else if (normalizedField === 'bullet_points') {
          enhancedProduct.bullet_points = await generateBulletPoints(
            product, 
            marketplace,
            marketplaceConfig.formatGuidelines.bullet_points?.count || 5
          );
        } else if (normalizedField === 'brand' && !product.brand) {
          enhancedProduct.brand = await suggestBrand(product);
        } else if (normalizedField === 'category' && !product.category) {
          enhancedProduct.category = await suggestCategory(product, marketplace);
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
 * Calls the Gemini API to generate content
 * @param prompt The prompt to send to Gemini
 * @returns Generated content
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  
  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Empty response from Gemini API");
    }
    
    const generatedContent = data.candidates[0].content.parts[0].text;
    return generatedContent.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
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
async function generateTitle(product: any, marketplace: string, maxLength: number): Promise<string> {
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
  
  const title = await callGeminiAPI(prompt);
  return title.substring(0, maxLength);
}

/**
 * Generates a detailed product description
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum description length
 * @returns Generated description
 */
async function generateDescription(product: any, marketplace: string, maxLength: number): Promise<string> {
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
  
  const description = await callGeminiAPI(prompt);
  return description.substring(0, maxLength);
}

/**
 * Generates bullet points highlighting key product features
 * @param product Product data
 * @param marketplace Target marketplace
 * @param count Number of bullet points to generate
 * @returns Array of bullet points
 */
async function generateBulletPoints(product: any, marketplace: string, count: number): Promise<string[]> {
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
  
  const bulletPointsText = await callGeminiAPI(prompt);
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
async function suggestBrand(product: any): Promise<string> {
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
  
  return await callGeminiAPI(prompt);
}

/**
 * Suggests a product category based on product information
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Suggested product category
 */
async function suggestCategory(product: any, marketplace: string): Promise<string> {
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
  
  return await callGeminiAPI(prompt);
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
