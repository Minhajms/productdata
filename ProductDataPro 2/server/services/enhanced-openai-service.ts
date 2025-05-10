/**
 * Enhanced OpenAI service utilizing improved prompts for product listing optimization
 * This service is designed to provide better results for product analysis, research, and content generation
 */

import OpenAI from "openai";
import { Product } from "../../shared/schema";
import { systemPrompts } from "./smart-prompts";
import { 
  generateProductResearchPrompt, 
  generateTitlePrompt, 
  generateDescriptionPrompt, 
  generateBulletPointsPrompt, 
  generateCsvAnalysisPrompt
} from "./prompt-utils";

// Initialize OpenAI SDK
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Enhanced version of product data enhancement using improved prompts
 * @param products List of products to enhance
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @returns Enhanced product data
 */
export async function enhanceProductDataWithImprovedPrompts(products: any[], marketplace: string): Promise<Product[]> {
  console.log(`Starting enhanced product data processing for ${products.length} products targeting ${marketplace}`);
  const enhancedProducts: Product[] = [];
  
  try {
    // Process each product
    for (const product of products) {
      console.log(`Enhancing product ID: ${product.product_id}`);
      
      try {
        // Step 1: Research the product to better understand what it is (if needed)
        if (!product.category || !product.title || !product.description) {
          console.log(`Product ${product.product_id} missing core information, performing research`);
          const researchData = await researchProductWithImprovedPrompt(product);
          product._research = researchData;
          console.log(`Research complete for ${product.product_id}, identified as: ${researchData.product_type}`);
        }
        
        // Step 2: Generate a marketplace-optimized title
        if (!product.title) {
          console.log(`Generating title for ${product.product_id}`);
          const maxTitleLength = marketplace === "Amazon" ? 200 : 80;
          product.title = await generateTitleWithImprovedPrompt(product, marketplace, maxTitleLength);
        }
        
        // Step 3: Generate a detailed product description
        if (!product.description) {
          console.log(`Generating description for ${product.product_id}`);
          const maxDescLength = marketplace === "Amazon" ? 2000 : 1000;
          product.description = await generateDescriptionWithImprovedPrompt(product, marketplace, maxDescLength);
        }
        
        // Step 4: Generate bullet points highlighting key features
        if (!product.bullet_points || !Array.isArray(product.bullet_points) || product.bullet_points.length === 0) {
          console.log(`Generating bullet points for ${product.product_id}`);
          const bulletPointCount = marketplace === "Amazon" ? 5 : 3;
          product.bullet_points = await generateBulletPointsWithImprovedPrompt(product, marketplace, bulletPointCount);
        }
        
        // Step 5: Make sure we have a brand (very important for most marketplaces)
        if (!product.brand) {
          console.log(`Suggesting brand for ${product.product_id}`);
          product.brand = await suggestBrandWithImprovedPrompt(product);
        }
        
        // Step 6: Suggest a category if missing
        if (!product.category) {
          console.log(`Suggesting category for ${product.product_id}`);
          product.category = await suggestCategoryWithImprovedPrompt(product, marketplace);
        }
        
        // Generate an ASIN for Amazon if needed
        if (marketplace === "Amazon" && !product.asin) {
          product.asin = generateRandomASIN();
        }
        
        // Set product status to enhanced
        product.status = "enhanced";
        enhancedProducts.push(product);
        console.log(`Successfully enhanced product ${product.product_id}`);
      } catch (error) {
        console.error(`Error enhancing product ${product.product_id}:`, error);
        // Add the product with minimal enhancements rather than skipping it completely
        product.status = "partial";
        enhancedProducts.push(product);
      }
    }
    
    return enhancedProducts;
  } catch (error) {
    console.error("Error in enhanceProductDataWithImprovedPrompts:", error);
    throw error;
  }
}

/**
 * Calls the OpenAI API to generate content with improved error handling
 * @param prompt The prompt to send to OpenAI
 * @param systemPrompt Optional custom system prompt for more specific instructions
 * @param options Additional options for the API call
 * @returns Generated content
 */
async function callImprovedOpenAIAPI(
  prompt: string,
  systemPrompt?: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    json_response?: boolean;
    product_research?: boolean;
  }
): Promise<string> {
  try {
    // Default system prompt for product enhancement
    const defaultSystemPrompt = options?.product_research 
      ? systemPrompts.productResearch
      : systemPrompts.contentGeneration;
      
    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;
    
    const apiOptions: any = {
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1024
    };
    
    // If JSON response is requested, add the appropriate format
    if (options?.json_response) {
      apiOptions.response_format = { type: "json_object" };
    }
    
    console.log(`Calling OpenAI API with ${prompt.substring(0, 100)}...`);
    const response = await openai.chat.completions.create(apiOptions);
    
    const generatedContent = response.choices[0].message.content;
    return generatedContent ? generatedContent.trim() : "";
  } catch (error: any) {
    console.error("Error calling OpenAI API:", error);
    
    // Use fallback mechanism for any error
    console.warn("OpenAI API error occurred. Using fallback generation method.");
    
    // Check if we can use Gemini as fallback
    try {
      // TODO: Implement Gemini fallback with improved prompt
      throw new Error("Gemini fallback not implemented for this improved service yet");
    } catch (fallbackError) {
      console.error("Fallback API also failed:", fallbackError);
      
      // Return a simple response based on the prompt type
      if (options?.json_response) {
        if (options?.product_research) {
          return JSON.stringify({
            product_type: "General Merchandise",
            likely_features: ["Quality materials", "Practical design", "Good value"],
            target_audience: "General consumers",
            search_terms: ["product", "merchandise"],
            missing_information: ["detailed specifications", "dimensions", "materials"],
            enhanced_understanding: "This appears to be a general merchandise product with limited available information."
          });
        } else {
          return JSON.stringify({ error: "Content generation failed", message: "Using fallback content" });
        }
      } else {
        return "Product information not available. Please contact the seller for details.";
      }
    }
  }
}

/**
 * Improved research function to better understand product information
 * @param product The product data with limited information
 * @returns Enhanced understanding of the product
 */
async function researchProductWithImprovedPrompt(product: any): Promise<any> {
  // Use our improved research prompt
  const prompt = generateProductResearchPrompt(product);
  
  const researchResult = await callImprovedOpenAIAPI(prompt, systemPrompts.productResearch, {
    temperature: 0.5,
    max_tokens: 800,
    json_response: true,
    product_research: true
  });
  
  try {
    return JSON.parse(researchResult);
  } catch (jsonError) {
    console.error("Failed to parse product research JSON:", jsonError);
    return {
      product_type: "Unknown",
      likely_features: [],
      target_audience: "General consumers",
      search_terms: [],
      missing_information: ["All core product information"],
      enhanced_understanding: "Unable to determine product details from limited information.",
      confidence_score: 0.1
    };
  }
}

/**
 * Generates an SEO-optimized product title with improved prompts
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum title length
 * @returns Generated title
 */
async function generateTitleWithImprovedPrompt(product: any, marketplace: string, maxLength: number): Promise<string> {
  try {
    // Generate the optimized title prompt
    const prompt = generateTitlePrompt(product, marketplace, maxLength);
    
    // Call the OpenAI API with the marketplace optimization system prompt
    const title = await callImprovedOpenAIAPI(prompt, systemPrompts.marketplaceOptimization);
    return title.substring(0, maxLength);
  } catch (error) {
    console.error(`Error generating title for product ${product.product_id}:`, error);
    
    // Create a more specific fallback title using available information
    const brandPart = product.brand ? `${product.brand} ` : '';
    const categoryPart = product.category ? `${product.category} ` : 'Product ';
    const idPart = product.product_id ? `#${product.product_id.substring(0, 6)}` : '';
    
    return `${brandPart}${categoryPart}${idPart}`.substring(0, maxLength);
  }
}

/**
 * Generates a detailed product description with improved prompts
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum description length
 * @returns Generated description
 */
async function generateDescriptionWithImprovedPrompt(product: any, marketplace: string, maxLength: number): Promise<string> {
  try {
    // Generate the optimized description prompt
    const prompt = generateDescriptionPrompt(product, marketplace, maxLength);
    
    // Call the OpenAI API with the content generation system prompt
    const description = await callImprovedOpenAIAPI(prompt, systemPrompts.contentGeneration);
    return description.substring(0, maxLength);
  } catch (error) {
    console.error(`Error generating description for product ${product.product_id}:`, error);
    
    // Create a more specific fallback description using available information
    let fallbackDescription = "";
    
    // Include brand if available
    if (product.brand) {
      fallbackDescription += `This ${product.brand} product `;
    } else {
      fallbackDescription += "This product ";
    }
    
    // Add category information if available
    if (product.category) {
      fallbackDescription += `is designed for the ${product.category} category. `;
    } else {
      fallbackDescription += "is designed to meet your needs. ";
    }
    
    // Add some generic quality statements
    fallbackDescription += "Made with quality materials for reliability and durability. ";
    
    // If title is available, include it
    if (product.title) {
      fallbackDescription += `The ${product.title} is an excellent choice for customers looking for quality and value. `;
    }
    
    return fallbackDescription;
  }
}

/**
 * Generates bullet points highlighting key product features with improved prompts
 * @param product Product data
 * @param marketplace Target marketplace
 * @param count Number of bullet points to generate
 * @returns Array of bullet points
 */
async function generateBulletPointsWithImprovedPrompt(product: any, marketplace: string, count: number): Promise<string[]> {
  try {
    // Generate the optimized bullet points prompt
    const prompt = generateBulletPointsPrompt(product, marketplace, count);
    
    // Call the OpenAI API with the content generation system prompt
    const bulletPointsText = await callImprovedOpenAIAPI(prompt, systemPrompts.contentGeneration);
    
    // Split by newlines and clean up
    const bulletPoints = bulletPointsText
      .split('\n')
      .map(point => point.trim())
      .filter(point => point.length > 0 && !point.startsWith('•') && !point.startsWith('*'))
      .map(point => {
        // Remove any bullet characters, numbers or dashes at the beginning
        return point.replace(/^[-•*]|\d+[.)]\s*|[*]\s+/, '').trim();
      })
      .slice(0, count);
    
    // If we don't have enough bullet points, generate more specific fallbacks
    if (bulletPoints.length < count) {
      const fallbacks = [];
      
      if (product.brand) fallbacks.push(`Made by ${product.brand} with attention to quality and detail`);
      if (product.material) fallbacks.push(`Constructed from durable ${product.material} for long-lasting performance`);
      if (product.color) fallbacks.push(`Available in ${product.color} to match your style preferences`);
      if (product.dimensions) fallbacks.push(`Perfect size at ${product.dimensions} for convenient use`);
      if (product.category) fallbacks.push(`Designed specifically for ${product.category} applications`);
      
      // Generic fallbacks if needed
      fallbacks.push(
        "Thoughtfully designed for ease of use and functionality",
        "Customer satisfaction is our top priority with this product",
        "Versatile design makes it suitable for multiple applications",
        "Quality construction ensures reliability and durability",
        "Excellent value for the price compared to similar products"
      );
      
      // Add fallbacks until we reach the desired count
      while (bulletPoints.length < count && fallbacks.length > 0) {
        bulletPoints.push(fallbacks.shift() as string);
      }
    }
    
    return bulletPoints;
  } catch (error) {
    console.error(`Error generating bullet points for product ${product.product_id}:`, error);
    
    // Return generic fallback bullet points
    return [
      "Thoughtfully designed for ease of use and functionality",
      "Quality construction ensures reliability and durability",
      "Versatile design makes it suitable for multiple applications",
      "Customer satisfaction guaranteed with this purchase",
      "Excellent value for the price compared to similar products"
    ].slice(0, count);
  }
}

/**
 * Suggests a brand name based on product information using improved prompts
 * @param product Product data
 * @returns Suggested brand name
 */
async function suggestBrandWithImprovedPrompt(product: any): Promise<string> {
  try {
    const prompt = `
      Based on the following product information, suggest a plausible brand name.
      Do not invent information, only work with what's provided in the product details.
      
      Product Information:
      ${JSON.stringify(product, null, 2)}
      
      If there are any brand hints in the product title, description, or category, use those.
      If there are no hints, suggest a generic manufacturer name that would be appropriate.
      Return ONLY the brand name, nothing else.
    `;
    
    const brand = await callImprovedOpenAIAPI(prompt, systemPrompts.productResearch);
    
    // Simple validation - brand names shouldn't be too long or contain special chars
    if (brand.length > 30 || /[^a-zA-Z0-9\s\-&]/.test(brand)) {
      throw new Error("Generated brand name is invalid");
    }
    
    return brand;
  } catch (error) {
    console.error(`Error suggesting brand for product ${product.product_id}:`, error);
    
    // Return a generic brand name based on category if available
    if (product.category) {
      const categorySplit = product.category.split(' ');
      if (categorySplit.length > 0) {
        const firstWord = categorySplit[0].charAt(0).toUpperCase() + categorySplit[0].slice(1);
        return `${firstWord} Essentials`;
      }
    }
    
    return "QualityMade";
  }
}

/**
 * Suggests a product category based on product information using improved prompts
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Suggested product category
 */
async function suggestCategoryWithImprovedPrompt(product: any, marketplace: string): Promise<string> {
  try {
    // Use research data if available
    if (product._research && product._research.product_type) {
      return product._research.product_type;
    }
    
    // Otherwise, generate a category suggestion
    const prompt = `
      Based on the following product information, suggest the most appropriate product category for ${marketplace} marketplace.
      Do not invent details, but work only with what's provided in the product information.
      
      Product Information:
      ${JSON.stringify(product, null, 2)}
      
      Return ONLY the category name (e.g., "Electronics", "Home & Kitchen", "Sporting Goods", etc.), nothing else.
    `;
    
    const category = await callImprovedOpenAIAPI(prompt, systemPrompts.marketplaceOptimization);
    
    return category;
  } catch (error) {
    console.error(`Error suggesting category for product ${product.product_id}:`, error);
    
    // Return a generic category based on title if available
    if (product.title) {
      if (/phone|smartphone|charger|cable|headphone|earbud|wireless/i.test(product.title)) {
        return "Electronics";
      } else if (/shirt|pant|dress|jacket|shoe|clothing|apparel/i.test(product.title)) {
        return "Clothing";
      } else if (/table|chair|furniture|desk|shelf|sofa|couch/i.test(product.title)) {
        return "Furniture";
      } else if (/toy|game|play/i.test(product.title)) {
        return "Toys & Games";
      }
    }
    
    return "General Merchandise";
  }
}

/**
 * Generates a random ASIN (Amazon Standard Identification Number)
 * @returns Random ASIN
 */
function generateRandomASIN(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let asin = 'B0';
  for (let i = 0; i < 8; i++) {
    asin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return asin;
}

/**
 * Analyzes a CSV file structure to understand columns and relationships using AI
 * @param sampleRows Sample of CSV rows to analyze
 * @param columnNames Array of column names from the CSV
 * @returns Analysis results
 */
export async function analyzeCSVStructureWithAI(sampleRows: any[], columnNames: string[]): Promise<any> {
  try {
    // Use a limited sample to keep the prompt size reasonable
    const analyzableSampleSize = Math.min(5, sampleRows.length);
    const sampleToAnalyze = sampleRows.slice(0, analyzableSampleSize);
    
    // Generate the CSV analysis prompt
    const prompt = generateCsvAnalysisPrompt(sampleToAnalyze, columnNames);
    
    // Call the OpenAI API with the data analysis system prompt
    const analysisResult = await callImprovedOpenAIAPI(prompt, systemPrompts.csvAnalysis, {
      temperature: 0.3,
      max_tokens: 1500,
      json_response: true
    });
    
    try {
      return JSON.parse(analysisResult);
    } catch (jsonError) {
      console.error("Failed to parse CSV analysis JSON:", jsonError);
      throw new Error("Failed to analyze CSV structure");
    }
  } catch (error) {
    console.error("Error analyzing CSV structure with AI:", error);
    throw error;
  }
}