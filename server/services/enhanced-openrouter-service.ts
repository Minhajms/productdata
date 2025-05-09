/**
 * Enhanced OpenRouter Service
 * 
 * This service provides integration with OpenRouter API using marketplace-optimized prompts
 * for higher quality, more natural-sounding content generation.
 */

import axios from 'axios';
import { Product } from '@shared/schema';
import * as marketplacePrompts from './marketplace-optimized-prompts';

// Environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Default models (can be overridden in function parameters)
const DEFAULT_MODEL = 'anthropic/claude-3-7-sonnet-20250219'; // Latest Claude model
const FALLBACK_MODEL = 'openai/gpt-4o'; // Latest GPT-4 model

/**
 * Enhance product data using OpenRouter with marketplace-optimized prompts
 * @param products List of products to enhance
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @param preferredModel Optional preferred model to use
 * @returns Enhanced product data
 */
export async function enhanceProductDataWithOptimizedPrompts(
  products: any[], 
  marketplace: string = "Amazon",
  preferredModel?: string
): Promise<Product[]> {
  console.log(`Enhancing ${products.length} products with optimized prompts for ${marketplace} marketplace`);
  
  // Track start time for performance monitoring
  const startTime = Date.now();
  
  try {
    const enhancedProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Enhancing product ${i+1}/${products.length}: ${product.product_id}`);
      
      try {
        // First, detect product type to better tailor subsequent prompts
        const productTypeData = await detectProductType(product);
        console.log(`Product type detected: ${productTypeData.product_type} (confidence: ${productTypeData.confidence_score.toFixed(2)})`);
        
        // Generate optimized title
        let title = product.title;
        if (!title || title.length < 10) {
          const titleData = await generateOptimizedTitle(product, productTypeData.product_type, marketplace, preferredModel);
          title = titleData.titles[0]; // Use the first title suggestion
          console.log(`Generated optimized title: ${title}`);
        }
        
        // Generate compelling description
        let description = product.description;
        if (!description || description.length < 50) {
          description = await generateCompellingDescription(
            product, 
            productTypeData.product_type, 
            productTypeData.target_audience, 
            productTypeData.price_tier,
            preferredModel
          );
          console.log(`Generated compelling description (${description.length} chars)`);
        }
        
        // Generate bullet points
        let bulletPoints = product.bullet_points;
        if (!bulletPoints || (Array.isArray(bulletPoints) && bulletPoints.length === 0)) {
          const bulletPointsData = await generateBulletPoints(product, productTypeData.product_type, marketplace, preferredModel);
          bulletPoints = bulletPointsData.bullet_points;
          console.log(`Generated ${bulletPoints.length} bullet points`);
        }
        
        // Generate or verify brand
        let brand = product.brand;
        if (!brand) {
          const brandData = await suggestBrand(product, productTypeData.product_type, preferredModel);
          brand = brandData.recommended_brand;
          console.log(`Suggested brand: ${brand}`);
        }
        
        // Create enhanced product object
        const enhancedProduct = {
          ...product,
          title,
          description,
          bullet_points: bulletPoints,
          brand,
          status: "enhanced"
        };
        
        enhancedProducts.push(enhancedProduct);
        
        // Log progress
        if ((i+1) % 10 === 0 || i === products.length - 1) {
          console.log(`Progress: ${i+1}/${products.length} products enhanced (${Math.round((i+1)/products.length * 100)}%)`);
        }
        
      } catch (productError) {
        console.error(`Error enhancing product ${product.product_id}:`, productError);
        
        // Add the original product without enhancements
        enhancedProducts.push({
          ...product,
          status: "error"
        });
      }
    }
    
    // Log completion time
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Enhancement completed in ${duration.toFixed(1)} seconds for ${products.length} products`);
    
    return enhancedProducts;
  } catch (error) {
    console.error('Error in enhanceProductDataWithOptimizedPrompts:', error);
    throw error;
  }
}

/**
 * Detect product type using the optimized product type detection prompt
 * @param product Product data
 * @param model Optional preferred model
 * @returns Product type analysis
 */
async function detectProductType(product: any, model?: string): Promise<any> {
  // Generate the product type detection prompt
  const prompt = marketplacePrompts.generateProductTypeDetectionPrompt([product]);
  
  // Call OpenRouter with the prompt
  const response = await callOpenRouter(
    "You are an expert retail product analyst specialized in identifying specific product types and categories from limited data.",
    prompt,
    model
  );
  
  // Parse and return the analysis
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing product type detection response:', error);
    // Fallback to basic product type if parsing fails
    return {
      product_type: product.category || "General merchandise",
      category: product.category || "Miscellaneous",
      subcategory: "",
      target_audience: "general consumers",
      price_tier: "mid-range",
      key_features: [],
      confidence_score: 0.5
    };
  }
}

/**
 * Generate an optimized product title
 * @param product Product data
 * @param productType Detected product type
 * @param marketplace Target marketplace
 * @param model Optional preferred model
 * @returns Title generation result
 */
async function generateOptimizedTitle(
  product: any, 
  productType: string, 
  marketplace: string,
  model?: string
): Promise<any> {
  // Character limits by marketplace
  const characterLimits: Record<string, number> = {
    "Amazon": 200,
    "eBay": 80,
    "Walmart": 200,
    "Etsy": 140,
    "Shopify": 120
  };
  
  const characterLimit = characterLimits[marketplace] || 200;
  
  // Generate the title prompt
  const prompt = marketplacePrompts.generateProductTitlePrompt(
    product, 
    productType, 
    marketplace, 
    characterLimit
  );
  
  // Call OpenRouter with the prompt
  const response = await callOpenRouter(
    `You are an SEO specialist for ${marketplace} with expertise in creating high-converting product titles.`,
    prompt,
    model
  );
  
  // Parse and return the title data
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing title generation response:', error);
    // Fallback to basic title if parsing fails
    return {
      titles: [
        product.brand ? 
          `${product.brand} ${productType} ${product.price ? "- Premium Quality" : ""}` : 
          `${productType} - Premium Quality Product`
      ],
      reasoning: "Basic title format used due to processing error"
    };
  }
}

/**
 * Generate a compelling product description
 * @param product Product data
 * @param productType Detected product type
 * @param targetAudience Target audience
 * @param priceTier Price tier
 * @param model Optional preferred model
 * @returns Generated description
 */
async function generateCompellingDescription(
  product: any, 
  productType: string, 
  targetAudience: string,
  priceTier: string,
  model?: string
): Promise<string> {
  // Generate the description prompt
  const prompt = marketplacePrompts.generateProductDescriptionPrompt(
    product, 
    productType, 
    targetAudience, 
    priceTier
  );
  
  // Call OpenRouter with the prompt
  const response = await callOpenRouter(
    "You are an experienced e-commerce copywriter who specializes in writing product descriptions that convert.",
    prompt,
    model
  );
  
  return response.trim();
}

/**
 * Generate bullet points for product features
 * @param product Product data
 * @param productType Detected product type
 * @param marketplace Target marketplace
 * @param model Optional preferred model
 * @returns Bullet points data
 */
async function generateBulletPoints(
  product: any, 
  productType: string, 
  marketplace: string,
  model?: string
): Promise<any> {
  // Generate the bullet points prompt
  const prompt = marketplacePrompts.generateBulletPointsPrompt(
    product, 
    productType, 
    marketplace
  );
  
  // Call OpenRouter with the prompt
  const response = await callOpenRouter(
    `You are a product marketer for ${marketplace} with expertise in creating persuasive bullet points.`,
    prompt,
    model
  );
  
  // Parse and return the bullet points data
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing bullet points response:', error);
    // Fallback to basic bullet points if parsing fails
    return {
      bullet_points: [
        `High-quality ${productType} designed for maximum performance`,
        `Easy to use and convenient for everyday needs`,
        `Durable construction ensures long-lasting use`,
        `Versatile design suitable for multiple applications`,
        `Excellent value for the price`
      ]
    };
  }
}

/**
 * Suggest a brand name for products without brand information
 * @param product Product data
 * @param productType Detected product type
 * @param model Optional preferred model
 * @returns Brand suggestion data
 */
async function suggestBrand(
  product: any, 
  productType: string,
  model?: string
): Promise<any> {
  // Generate the brand suggestion prompt
  const prompt = marketplacePrompts.generateBrandSuggestionPrompt(
    product, 
    productType
  );
  
  // Call OpenRouter with the prompt
  const response = await callOpenRouter(
    "You are a branding expert specializing in creating authentic brand names for e-commerce products.",
    prompt,
    model
  );
  
  // Parse and return the brand suggestion data
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing brand suggestion response:', error);
    // Fallback to generic brand if parsing fails
    return {
      brand_suggestions: [
        { name: "PrimeSelect", rationale: "Generic premium brand", confidence: 5 }
      ],
      recommended_brand: "PrimeSelect"
    };
  }
}

/**
 * Call OpenRouter API with fallback mechanisms
 * @param systemPrompt System instructions for the AI
 * @param userPrompt The user's query/data
 * @param preferredModel Optional preferred model to use
 * @returns Generated text response
 */
async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  preferredModel?: string
): Promise<string> {
  // Use preferred model if specified, otherwise use default
  const model = preferredModel || DEFAULT_MODEL;
  
  try {
    // Check if OpenRouter API key is available
    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not found, trying direct API providers');
      return await tryDirectProviders(systemPrompt, userPrompt, model);
    }
    
    console.log(`Calling OpenRouter API with model: ${model}`);
    
    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3, // Lower temperature for more deterministic/analytical results
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://productdataenhancer.app',
          'X-Title': 'Product Data Enhancer'
        }
      }
    );
    
    // Extract and return the response content
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from OpenRouter API');
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return await tryDirectProviders(systemPrompt, userPrompt, model);
  }
}

/**
 * Try direct API providers if OpenRouter fails
 * @param systemPrompt System instructions for the AI
 * @param userPrompt The user's query/data
 * @param model The model that was attempted
 * @returns Generated text response
 */
async function tryDirectProviders(
  systemPrompt: string,
  userPrompt: string,
  model: string
): Promise<string> {
  // Try OpenAI if the API key is available
  if (model.includes('openai') || model.includes('gpt') || !model.includes('/')) {
    if (OPENAI_API_KEY) {
      return await tryOpenAI(systemPrompt, userPrompt);
    }
  }
  
  // Try Anthropic if the API key is available and model is Claude
  if (model.includes('anthropic') || model.includes('claude')) {
    if (ANTHROPIC_API_KEY) {
      return await tryAnthropic(systemPrompt, userPrompt);
    }
  }
  
  // Try Gemini if the API key is available
  if (model.includes('google') || model.includes('gemini')) {
    if (GEMINI_API_KEY) {
      return await tryGemini(systemPrompt, userPrompt);
    }
  }
  
  // If we reach here, try any available API
  if (OPENAI_API_KEY) {
    return await tryOpenAI(systemPrompt, userPrompt);
  } else if (ANTHROPIC_API_KEY) {
    return await tryAnthropic(systemPrompt, userPrompt);
  } else if (GEMINI_API_KEY) {
    return await tryGemini(systemPrompt, userPrompt);
  }
  
  // If no API keys are available, throw an error
  throw new Error('No API keys available for content generation');
}

/**
 * Try OpenAI API directly
 * @param systemPrompt System instructions for the AI
 * @param userPrompt The user's query/data
 * @returns Generated text response
 */
async function tryOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not available');
  }
  
  try {
    console.log('Falling back to OpenAI API directly');
    
    // Call OpenAI API directly
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', // Use GPT-4o - the newest OpenAI model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Try Anthropic API directly
 * @param systemPrompt System instructions for the AI
 * @param userPrompt The user's query/data
 * @returns Generated text response
 */
async function tryAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not available');
  }
  
  try {
    console.log('Falling back to Anthropic API directly');
    
    // Call Anthropic API directly
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219', // Use latest Claude model
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
}

/**
 * Try Gemini API directly
 * @param systemPrompt System instructions for the AI
 * @param userPrompt The user's query/data
 * @returns Generated text response
 */
async function tryGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not available');
  }
  
  try {
    console.log('Falling back to Gemini API directly');
    
    // Combine system and user prompts for Gemini (as it doesn't have a system role)
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Call Gemini API directly
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: combinedPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract text from Gemini response
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}