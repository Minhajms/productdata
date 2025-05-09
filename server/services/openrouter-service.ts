/**
 * OpenRouter API integration for product data enhancement
 * This service provides access to multiple AI models through a single API
 */

import axios from 'axios';
import { Product } from '@shared/schema';

// Model mapping for OpenRouter
const MODEL_MAP: Record<string, string> = {
  'gpt4o': 'openai/gpt-4o',
  'claude': 'anthropic/claude-3-7-sonnet',
  'gemini': 'google/gemini-1.5-pro',
  'mistral': 'mistralai/mistral-large',
  'llama': 'meta-llama/llama-3-70b-chat'
};

/**
 * Enhances product data using OpenRouter API to access multiple AI models
 * @param products List of products to enhance
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @param modelPreference Preferred AI model to use ('gpt4o', 'claude', 'gemini', etc.)
 * @returns Enhanced product data
 */
export async function enhanceProductDataWithOpenRouter(
  products: any[], 
  marketplace: string,
  modelPreference: string = 'gpt4o'
): Promise<Product[]> {
  console.log(`Enhancing ${products.length} products for ${marketplace} using OpenRouter with model preference: ${modelPreference}`);
  
  // Use the model map to get the full model identifier, fallback to GPT-4o if not found
  const modelIdentifier = MODEL_MAP[modelPreference] || MODEL_MAP['gpt4o'];
  console.log(`Using model: ${modelIdentifier}`);

  const enhancedProducts = [];

  // Process each product
  for (const product of products) {
    console.log(`Processing product ID: ${product.product_id}`);
    
    try {
      // Research the product first to better understand it
      const researchedProduct = await researchProductWithOpenRouter(product, modelIdentifier);
      
      // Generate optimized content for the product
      const title = await generateTitleWithOpenRouter(researchedProduct, marketplace, 200, modelIdentifier);
      const description = await generateDescriptionWithOpenRouter(researchedProduct, marketplace, 2000, modelIdentifier);
      const bulletPoints = await generateBulletPointsWithOpenRouter(researchedProduct, marketplace, 5, modelIdentifier);
      const brand = product.brand || await suggestBrandWithOpenRouter(researchedProduct, modelIdentifier);
      const category = await suggestCategoryWithOpenRouter(researchedProduct, marketplace, modelIdentifier);
      
      // Generate a random ASIN if needed for Amazon
      const asin = marketplace.toLowerCase() === 'amazon' ? 
        (product.asin || generateRandomASIN()) : undefined;
      
      // Combine original and enhanced data
      const enhancedProduct = {
        ...product,
        title,
        description,
        bullet_points: bulletPoints,
        brand,
        category,
        asin,
        status: 'enhanced',
        enhancement_date: new Date().toISOString()
      };
      
      enhancedProducts.push(enhancedProduct);
    } catch (error) {
      console.error(`Error enhancing product ${product.product_id}:`, error);
      // If enhancement fails, include the original product with an error status
      enhancedProducts.push({
        ...product,
        status: 'error',
        enhancement_error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return enhancedProducts;
}

/**
 * Calls the OpenRouter API to generate content
 * @param messages The message array to send to OpenRouter
 * @param modelIdentifier The model identifier to use
 * @returns Generated content
 */
async function callOpenRouterAPI(
  messages: any[],
  modelIdentifier: string
): Promise<string> {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelIdentifier,
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`,
          'HTTP-Referer': 'https://product-enhancer.replit.app', // Replace with your site
          'X-Title': 'Product Data Enhancer'
        }
      }
    );

    const generatedText = response.data.choices[0].message.content;
    return generatedText;
  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('OpenRouter API error details:', error.response.data);
      throw new Error(`OpenRouter API error: ${error.response.data.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Researches a product to understand what it is based on limited information
 * @param product Product data with limited information
 * @param modelIdentifier The model identifier to use
 * @returns Enhanced understanding of the product
 */
async function researchProductWithOpenRouter(product: any, modelIdentifier: string): Promise<any> {
  console.log(`Researching product: ${product.product_id}`);
  
  // Prepare product data for the prompt
  const productData = {
    id: product.product_id,
    name: product.name || product.title || 'Unknown',
    shortDescription: product.short_description || product.description || '',
    category: product.category || '',
    features: product.features || product.bullet_points || [],
    brand: product.brand || '',
    price: product.price || '',
    sku: product.sku || '',
    mpn: product.mpn || ''
  };
  
  const userMessage = `I need to understand this product better to create marketplace listings:
${JSON.stringify(productData, null, 2)}

Based on the available information, please research this product and provide:
1. What type of product is this?
2. What are its key features and benefits?
3. What is its primary use case?
4. What category would it belong to?
5. Who would be the target audience?

Provide your response as a JSON object with these fields:
- productType: string
- keyFeatures: string[]
- primaryUse: string
- suggestedCategory: string
- targetAudience: string
- additionalInfo: string`;

  const messages = [
    {
      role: "system",
      content: "You are a product research specialist with expertise in e-commerce optimization and marketplace listings. Your task is to analyze product data and identify what the product is, even with limited information."
    },
    { role: "user", content: userMessage }
  ];
  
  const responseText = await callOpenRouterAPI(messages, modelIdentifier);
  
  try {
    // Try to parse the response as JSON
    let researchData = JSON.parse(responseText);
    return {
      ...product,
      researched: true,
      productType: researchData.productType,
      keyFeatures: researchData.keyFeatures,
      primaryUse: researchData.primaryUse,
      suggestedCategory: researchData.suggestedCategory,
      targetAudience: researchData.targetAudience,
      additionalInfo: researchData.additionalInfo
    };
  } catch (error) {
    console.warn("Could not parse research response as JSON. Using text response.");
    // If JSON parsing fails, use the text response directly
    return {
      ...product,
      researched: true,
      researchNotes: responseText
    };
  }
}

/**
 * Generates an SEO-optimized product title
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum title length
 * @param modelIdentifier The model identifier to use
 * @returns Generated title
 */
async function generateTitleWithOpenRouter(
  product: any, 
  marketplace: string, 
  maxLength: number,
  modelIdentifier: string
): Promise<string> {
  console.log(`Generating title for product: ${product.product_id}`);
  
  const systemPrompt = `You are an e-commerce listing optimization expert. Create a compelling product title that follows ${marketplace} marketplace best practices:
- Include key product features that shoppers search for
- Use natural language that's easy to read
- Prioritize important keywords at the beginning
- Include brand name, key specs, model numbers when relevant
- Keep it under ${maxLength} characters
- Focus on clarity and searchability`;

  const userPrompt = `Create an optimized product title for this product:
${JSON.stringify(product, null, 2)}

Respond ONLY with the title text. Do NOT include any explanations.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
  
  const title = await callOpenRouterAPI(messages, modelIdentifier);
  
  // Remove extra quotes and trim whitespace
  return title.replace(/^["']|["']$/g, '').trim().substring(0, maxLength);
}

/**
 * Generates a detailed product description
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum description length
 * @param modelIdentifier The model identifier to use
 * @returns Generated description
 */
async function generateDescriptionWithOpenRouter(
  product: any, 
  marketplace: string, 
  maxLength: number,
  modelIdentifier: string
): Promise<string> {
  console.log(`Generating description for product: ${product.product_id}`);
  
  const systemPrompt = `You are an e-commerce copywriter specializing in ${marketplace} listings. Create a compelling product description that:
- Has a strong opening that hooks potential buyers
- Highlights key features and benefits
- Addresses customer pain points and explains how the product solves them
- Includes relevant specifications (dimensions, materials, compatibility, etc.)
- Uses paragraph breaks for readability
- Is optimized for ${marketplace}'s search algorithm with relevant keywords
- Maintains a professional, engaging tone
- Stays under ${maxLength} characters`;

  const userPrompt = `Create an optimized product description for this product:
${JSON.stringify(product, null, 2)}

Respond ONLY with the description text. Do NOT include any explanations.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
  
  const description = await callOpenRouterAPI(messages, modelIdentifier);
  
  // Clean up the response and ensure it's within length limits
  return description.trim().substring(0, maxLength);
}

/**
 * Generates bullet points highlighting key product features
 * @param product Product data
 * @param marketplace Target marketplace
 * @param count Number of bullet points to generate
 * @param modelIdentifier The model identifier to use
 * @returns Array of bullet points
 */
async function generateBulletPointsWithOpenRouter(
  product: any, 
  marketplace: string, 
  count: number,
  modelIdentifier: string
): Promise<string[]> {
  console.log(`Generating bullet points for product: ${product.product_id}`);
  
  const systemPrompt = `You are an e-commerce optimization expert. Create ${count} compelling bullet points that:
- Highlight the most important features and benefits
- Begin with the benefit to the customer, then explain the feature
- Use sentence case (capitalize first word only)
- Are concise yet descriptive
- Are optimized for ${marketplace}'s search algorithm
- Are ordered by importance (most important first)
- Do not use bullet point markers (•, *, etc.) as they will be added by the system`;

  const userPrompt = `Create ${count} optimized bullet points for this product:
${JSON.stringify(product, null, 2)}

Respond with EXACTLY ${count} bullet points in a JSON array format like this:
["Bullet point 1", "Bullet point 2", "Bullet point 3", ...]

Do NOT include any explanations, just the JSON array.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
  
  const response = await callOpenRouterAPI(messages, modelIdentifier);
  
  try {
    // Try to parse the response as JSON
    const bulletPoints = JSON.parse(response);
    
    // Ensure we have exactly the right number of bullet points
    const normalizedBulletPoints = bulletPoints.slice(0, count);
    while (normalizedBulletPoints.length < count) {
      normalizedBulletPoints.push(`Feature ${normalizedBulletPoints.length + 1}: Enhances your experience`);
    }
    
    return normalizedBulletPoints;
  } catch (error) {
    console.warn("Could not parse bullet points as JSON. Generating fallback bullets.");
    
    // If JSON parsing fails, split by newlines and clean up
    const fallbackBullets = response
      .split(/\r?\n/)
      .map(line => line.replace(/^[•\-*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, count);
    
    // Ensure we have exactly the right number of bullet points
    while (fallbackBullets.length < count) {
      fallbackBullets.push(`Feature ${fallbackBullets.length + 1}: Enhances your experience`);
    }
    
    return fallbackBullets;
  }
}

/**
 * Suggests a brand name based on product information
 * @param product Product data
 * @param modelIdentifier The model identifier to use
 * @returns Suggested brand name
 */
async function suggestBrandWithOpenRouter(product: any, modelIdentifier: string): Promise<string> {
  console.log(`Suggesting brand for product: ${product.product_id}`);
  
  const systemPrompt = "You are a brand specialist. Your task is to identify or suggest an appropriate brand name for a product based on the provided information. If a brand name is already present in the data, extract and return it. If not, suggest a suitable brand name that fits the product category and characteristics.";

  const userPrompt = `Based on this product information, what would be an appropriate brand name?
${JSON.stringify(product, null, 2)}

Respond ONLY with the brand name. Keep it short and appropriate for the product category. Do NOT include any explanations.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
  
  const brand = await callOpenRouterAPI(messages, modelIdentifier);
  
  // Clean up the response
  return brand.replace(/^["']|["']$/g, '').trim();
}

/**
 * Suggests a product category based on product information
 * @param product Product data
 * @param marketplace Target marketplace
 * @param modelIdentifier The model identifier to use
 * @returns Suggested product category
 */
async function suggestCategoryWithOpenRouter(
  product: any, 
  marketplace: string,
  modelIdentifier: string
): Promise<string> {
  console.log(`Suggesting category for product: ${product.product_id}`);
  
  const systemPrompt = `You are a ${marketplace} category specialist. Your task is to suggest the most appropriate product category for the given product. Consider:
- The product's primary function and features
- Standard ${marketplace} category naming conventions
- The most specific appropriate category (not too broad)`;

  const userPrompt = `Based on this product information, what would be the most appropriate ${marketplace} category?
${JSON.stringify(product, null, 2)}

Respond ONLY with the category name. Do NOT include any explanations.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
  
  const category = await callOpenRouterAPI(messages, modelIdentifier);
  
  // Clean up the response
  return category.replace(/^["']|["']$/g, '').trim();
}

/**
 * Generates a random ASIN (Amazon Standard Identification Number)
 * @returns Random ASIN
 */
function generateRandomASIN(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let asin = 'B0';
  
  // Generate 8 more random characters
  for (let i = 0; i < 8; i++) {
    asin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return asin;
}