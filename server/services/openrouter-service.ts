/**
 * OpenRouter API Integration Service
 * 
 * This service provides product data enhancement capabilities using OpenRouter API
 * with fallback to alternative AI providers when needed
 */

import axios from 'axios';
import { Product } from '@shared/schema';

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Base URL for OpenRouter API
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Optional referer for OpenRouter API call tracking (for analytics)
const REFERER_URL = 'https://productdataenhancer.app';

/**
 * Enhance product data using OpenRouter API
 * @param products Array of product objects to enhance
 * @param marketplace Target marketplace
 * @returns Array of enhanced product objects
 */
export async function enhanceProductDataWithOpenRouter(products: Product[], marketplace: string): Promise<Product[]> {
  console.log(`Enhancing ${products.length} products for ${marketplace} marketplace using OpenRouter`);
  
  const enhancedProducts: Product[] = [];
  
  for (const product of products) {
    try {
      // First, get product understanding through research
      const researchedProduct = await researchProductWithOpenRouter(product);
      
      // Then generate enhanced content for the product
      const enhancedTitle = await generateTitleWithOpenRouter(
        { ...product, ...researchedProduct }, 
        marketplace, 
        200
      );
      
      const enhancedDescription = await generateDescriptionWithOpenRouter(
        { ...product, ...researchedProduct }, 
        marketplace, 
        2000
      );
      
      const enhancedBulletPoints = await generateBulletPointsWithOpenRouter(
        { ...product, ...researchedProduct }, 
        marketplace, 
        5
      );
      
      // Create enhanced product object
      const enhancedProduct = {
        ...product,
        title: enhancedTitle,
        description: enhancedDescription,
        bullet_points: enhancedBulletPoints,
        status: "enhanced",
      };
      
      enhancedProducts.push(enhancedProduct);
      
    } catch (error) {
      console.error(`Error enhancing product ${product.product_id}:`, error);
      // Add original product to results in case of error
      enhancedProducts.push({
        ...product,
        status: "error"
      });
    }
  }
  
  return enhancedProducts;
}

/**
 * Call OpenRouter API with error handling and fallback mechanisms
 * @param systemPrompt The system prompt to guide the AI model
 * @param userPrompt The user prompt/question
 * @param model Optional specific model to use
 * @returns The generated text response
 */
async function callOpenRouterAPI(
  systemPrompt: string, 
  userPrompt: string, 
  model: string = 'anthropic/claude-3-7-sonnet-20250219'
): Promise<string> {
  try {
    // Check if OpenRouter API key is available
    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not found, falling back to direct API calls');
      return await fallbackToDirectAPI(systemPrompt, userPrompt, model);
    }
    
    // Configure request to OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': REFERER_URL,
          'X-Title': 'Product Data Enhancer'
        }
      }
    );
    
    // Extract and return the response content
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message &&
        response.data.choices[0].message.content) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from OpenRouter API');
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // Attempt to fall back to direct API calls
    console.log('Attempting fallback to direct API calls...');
    return await fallbackToDirectAPI(systemPrompt, userPrompt, model);
  }
}

/**
 * Fallback to direct API calls when OpenRouter is unavailable
 * @param systemPrompt The system prompt
 * @param userPrompt The user prompt
 * @param model The requested model
 * @returns Generated text response
 */
async function fallbackToDirectAPI(
  systemPrompt: string, 
  userPrompt: string, 
  model: string
): Promise<string> {
  // Determine which API to call based on the requested model
  if (model.includes('anthropic') && ANTHROPIC_API_KEY) {
    return await callAnthropicAPI(systemPrompt, userPrompt);
  } else if (model.includes('openai') && OPENAI_API_KEY) {
    return await callOpenAIAPI(systemPrompt, userPrompt);
  } else if (model.includes('gemini') && GEMINI_API_KEY) {
    return await callGeminiAPI(systemPrompt, userPrompt);
  } else if (OPENAI_API_KEY) {
    // Default fallback to OpenAI if available
    return await callOpenAIAPI(systemPrompt, userPrompt);
  } else if (ANTHROPIC_API_KEY) {
    // Otherwise try Anthropic
    return await callAnthropicAPI(systemPrompt, userPrompt);
  } else if (GEMINI_API_KEY) {
    // Finally try Gemini
    return await callGeminiAPI(systemPrompt, userPrompt);
  } else {
    throw new Error('No API keys available for fallback');
  }
}

/**
 * Call OpenAI API directly
 * @param systemPrompt The system prompt
 * @param userPrompt The user prompt
 * @returns Generated text response
 */
async function callOpenAIAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', // Use the latest model, which is GPT-4o
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
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
 * Call Anthropic API directly
 * @param systemPrompt The system prompt
 * @param userPrompt The user prompt
 * @returns Generated text response
 */
async function callAnthropicAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    // Call Anthropic API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219', // Use the newest Anthropic model (claude-3-7-sonnet-20250219)
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000
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
 * Call Google Gemini API directly
 * @param systemPrompt The system prompt
 * @param userPrompt The user prompt
 * @returns Generated text response
 */
async function callGeminiAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    // Combine system prompt and user prompt for Gemini
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Call Google Gemini API
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
      {
        contents: [
          {
            parts: [
              { text: combinedPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          topP: 0.9,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: GEMINI_API_KEY
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Researches a product to understand what it is based on limited information
 * @param product Product data with limited information
 * @returns Enhanced understanding of the product
 */
async function researchProductWithOpenRouter(product: any): Promise<any> {
  // Create system prompt for product research
  const systemPrompt = `
You are a product data expert with deep knowledge of e-commerce and product categorization.
Your task is to analyze the given product information and enhance understanding of what this product is.
Based on the provided data, determine the product type, category, and any other relevant information.
  `;
  
  // Create user prompt with product details
  const userPrompt = `
Please analyze this product and provide an enhanced understanding of what it is:

Product Title: ${product.title || 'Not provided'}
Description: ${product.description || 'Not provided'}
Brand: ${product.brand || 'Not provided'}
Category: ${product.category || 'Not provided'}
Price: ${product.price || 'Not provided'}
Additional details: ${JSON.stringify(product.attributes || {})}

Based on this information, please provide:
1. The likely product type and category
2. The target audience/use case
3. Key features that would be important for this product type
4. Any other relevant information that would help understand this product better

Respond in JSON format with the following structure:
{
  "productType": "string",
  "category": "string",
  "targetAudience": "string",
  "keyFeatures": ["string", "string", ...],
  "additionalNotes": "string"
}
  `;
  
  try {
    // Call OpenRouter API to get product research
    const response = await callOpenRouterAPI(systemPrompt, userPrompt);
    
    // Parse the JSON response
    // Find JSON object in the response text (in case the API returned extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.warn('No JSON found in product research response, using empty object');
      return {};
    }
  } catch (error) {
    console.error('Error researching product:', error);
    return {};
  }
}

/**
 * Generates an SEO-optimized product title
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum title length
 * @returns Generated title
 */
async function generateTitleWithOpenRouter(product: any, marketplace: string, maxLength: number): Promise<string> {
  // Create system prompt for title generation
  const systemPrompt = `
You are a product listing optimization expert for ${marketplace}. 
Your task is to create an SEO-optimized product title that will maximize visibility and conversion rate.
The title should be compelling, include relevant keywords, and follow ${marketplace}'s best practices.
  `;
  
  // Create user prompt with product details and marketplace requirements
  const userPrompt = `
Please generate an optimized product title for this ${product.productType || 'item'} on ${marketplace}.

Product information:
- Current title: ${product.title || 'Not provided'}
- Description: ${product.description || 'Not provided'}
- Brand: ${product.brand || 'Not provided'}
- Category: ${product.category || 'Not provided'}
- Product type: ${product.productType || 'Not provided'}
- Key features: ${JSON.stringify(product.keyFeatures || [])}

Requirements for ${marketplace} titles:
- Maximum length: ${maxLength} characters
- Include the brand name
- Include key product features and benefits
- Use relevant keywords for searchability
- Avoid ALL CAPS except for brand names that are normally capitalized
- Avoid excessive punctuation or special characters

Respond with ONLY the optimized title text, without any explanation or additional text.
  `;
  
  try {
    // Call OpenRouter API to get generated title
    const title = await callOpenRouterAPI(systemPrompt, userPrompt);
    
    // Clean up title (remove quotes, trim whitespace, etc.)
    const cleanedTitle = title.replace(/^["']|["']$/g, '').trim();
    
    // Ensure title doesn't exceed max length
    return cleanedTitle.length > maxLength ? cleanedTitle.substring(0, maxLength) : cleanedTitle;
  } catch (error) {
    console.error('Error generating title:', error);
    return product.title || '';
  }
}

/**
 * Generates a detailed product description
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum description length
 * @returns Generated description
 */
async function generateDescriptionWithOpenRouter(product: any, marketplace: string, maxLength: number): Promise<string> {
  // Create system prompt for description generation
  const systemPrompt = `
You are a product content writer specializing in ${marketplace} listings.
Your task is to create a compelling, detailed product description that highlights benefits, features, and use cases.
The description should be engaging, persuasive, and follow ${marketplace}'s content guidelines.
Use formatting appropriate for ${marketplace} (paragraphs, line breaks) to improve readability.
  `;
  
  // Create user prompt with product details and marketplace requirements
  const userPrompt = `
Please write a detailed product description for this ${product.productType || 'item'} on ${marketplace}.

Product information:
- Title: ${product.title || 'Not provided'}
- Current description: ${product.description || 'Not provided'}
- Brand: ${product.brand || 'Not provided'}
- Category: ${product.category || 'Not provided'}
- Product type: ${product.productType || 'Not provided'}
- Target audience: ${product.targetAudience || 'Not provided'}
- Key features: ${JSON.stringify(product.keyFeatures || [])}

Requirements for ${marketplace} descriptions:
- Maximum length: ${maxLength} characters
- Include 3-4 paragraphs with line breaks between them
- Focus on benefits to the customer, not just features
- Highlight what makes this product unique/special
- Use engaging, persuasive language
- Be accurate and avoid exaggerated claims
- Include relevant keywords naturally

Respond with ONLY the description text, without any explanation or additional content.
  `;
  
  try {
    // Call OpenRouter API to get generated description
    const description = await callOpenRouterAPI(systemPrompt, userPrompt);
    
    // Clean up description (remove quotes, trim whitespace, etc.)
    const cleanedDescription = description.replace(/^["']|["']$/g, '').trim();
    
    // Ensure description doesn't exceed max length
    return cleanedDescription.length > maxLength ? cleanedDescription.substring(0, maxLength) : cleanedDescription;
  } catch (error) {
    console.error('Error generating description:', error);
    return product.description || '';
  }
}

/**
 * Generates bullet points highlighting key product features
 * @param product Product data
 * @param marketplace Target marketplace
 * @param count Number of bullet points to generate
 * @returns Array of bullet points
 */
async function generateBulletPointsWithOpenRouter(product: any, marketplace: string, count: number): Promise<string[]> {
  // Create system prompt for bullet points generation
  const systemPrompt = `
You are a product listing optimization expert for ${marketplace}.
Your task is to create compelling bullet points that highlight the key features and benefits of this product.
Each bullet point should be concise, benefit-focused, and help convince customers to purchase.
Follow ${marketplace}'s best practices for bullet points to maximize conversion.
  `;
  
  // Create user prompt with product details and marketplace requirements
  const userPrompt = `
Please generate ${count} bullet points for this ${product.productType || 'item'} on ${marketplace}.

Product information:
- Title: ${product.title || 'Not provided'}
- Description: ${product.description || 'Not provided'}
- Brand: ${product.brand || 'Not provided'}
- Category: ${product.category || 'Not provided'}
- Product type: ${product.productType || 'Not provided'}
- Target audience: ${product.targetAudience || 'Not provided'}
- Key features: ${JSON.stringify(product.keyFeatures || [])}

Requirements for ${marketplace} bullet points:
- Exactly ${count} bullet points
- Each bullet point should be 1-2 sentences (not too long)
- Start with a benefit or feature in capital letters, then explain its value
- Focus on the most important/unique selling points
- Be specific with facts, measurements, or capabilities when possible
- Use parallel structure (consistent grammar format across bullets)

Respond with ONLY the bullet points, one per line, without numbers, asterisks, or other bullet point markers.
  `;
  
  try {
    // Call OpenRouter API to get generated bullet points
    const response = await callOpenRouterAPI(systemPrompt, userPrompt);
    
    // Split response into lines and clean them up
    let bulletPoints = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[•\-*]\s*/, '')) // Remove any bullet point markers
      .map(line => line.replace(/^["']|["']$/g, '')); // Remove quotes
    
    // Ensure we have exactly the requested number of bullet points
    if (bulletPoints.length > count) {
      bulletPoints = bulletPoints.slice(0, count);
    } else if (bulletPoints.length < count) {
      // Fill with empty strings if we have fewer than requested
      while (bulletPoints.length < count) {
        bulletPoints.push('');
      }
    }
    
    return bulletPoints;
  } catch (error) {
    console.error('Error generating bullet points:', error);
    return product.bullet_points || [];
  }
}