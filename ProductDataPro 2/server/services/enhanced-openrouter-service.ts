/**
 * Enhanced OpenRouter Service
 * 
 * This service provides enhanced OpenRouter API integration with
 * improved error handling, retries, and model routing capabilities.
 */

import axios from 'axios';

// OpenRouter API configurations
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-4o'; // Default to GPT-4o as primary model
const FALLBACK_MODELS = [
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-5-sonnet',
  'google/gemini-pro',
  'meta-llama/llama-3-70b-instruct'
];

// Maximum number of retries with different models
const MAX_RETRIES = 3;

// Retry delay in milliseconds (exponential backoff)
const RETRY_DELAY_MS = 1000;

/**
 * Enhanced function to call OpenRouter API with model routing
 * 
 * @param systemPrompt System prompt for the AI
 * @param userPrompt User prompt
 * @param preferredModel Preferred model to use (default: 'openai/gpt-4o')
 * @param options Additional options for the API call
 * @returns Text response from the model
 */
export async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string, 
  preferredModel: string = DEFAULT_MODEL,
  options: {
    responseFormat?: 'text' | 'json';
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  // Prepare models to try (preferred model first, then fallbacks)
  const modelsToTry = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];
  
  // Set default options
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? 2000;
  const responseFormat = options.responseFormat ?? 'text';
  
  let lastError: Error | null = null;
  
  // Try each model in sequence until one succeeds
  for (let i = 0; i < Math.min(modelsToTry.length, MAX_RETRIES); i++) {
    const model = modelsToTry[i];
    
    try {
      console.log(`Attempting to call OpenRouter with model: ${model} (attempt ${i + 1} of ${Math.min(modelsToTry.length, MAX_RETRIES)})`);
      
      // Create request payload
      const payload = {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        ...(responseFormat === 'json' ? { response_format: { type: "json_object" } } : {})
      };
      
      // Make API request to OpenRouter
      const response = await axios.post(`${OPENROUTER_BASE_URL}/chat/completions`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://marketplace-enhancer.replit.app',
          'X-Title': 'Marketplace Product Enhancer'
        }
      });
      
      // Extract text response
      const content = response.data.choices[0]?.message?.content || '';
      console.log(`Successfully called OpenRouter with model: ${model}`);
      
      // Return the response content
      return content;
      
    } catch (error: any) {
      console.error(`Error calling OpenRouter with model ${model}:`, error.message);
      
      lastError = error;
      
      // If we're not on the last attempt, wait before retrying
      if (i < Math.min(modelsToTry.length, MAX_RETRIES) - 1) {
        // Wait with exponential backoff before trying again
        const delay = RETRY_DELAY_MS * Math.pow(2, i);
        console.log(`Waiting ${delay}ms before trying next model...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('Failed to get response from all available models');
}

/**
 * Enhanced product data using optimized prompts through OpenRouter
 * 
 * @param products Array of products to enhance
 * @param marketplace Target marketplace
 * @param modelPreference Model preference (e.g., 'gpt4o', 'claude', 'gemini')
 * @returns Enhanced products
 */
export async function enhanceProductDataWithOptimizedPrompts(
  products: any[],
  marketplace: string,
  modelPreference: string = 'gpt4o'
): Promise<any[]> {
  console.log(`Enhancing ${products.length} products with optimized prompts for ${marketplace} marketplace`);
  
  // Map model preference to actual model ID
  let modelId = DEFAULT_MODEL;
  switch (modelPreference.toLowerCase()) {
    case 'gpt4o':
      modelId = 'openai/gpt-4o';
      break;
    case 'claude':
      modelId = 'anthropic/claude-3-5-sonnet';
      break;
    case 'gemini':
      modelId = 'google/gemini-pro';
      break;
    case 'mistral':
      modelId = 'mistralai/mistral-large';
      break;
    case 'llama':
      modelId = 'meta-llama/llama-3-70b-instruct';
      break;
  }
  
  // Enhanced products array
  const enhancedProducts = [];
  
  // Enhance each product
  for (const product of products) {
    try {
      console.log(`Enhancing product: ${product.title || product.name || 'Unnamed product'}`);
      
      // System prompt for product enhancement
      const systemPrompt = `You are an expert e-commerce product content creator for ${marketplace}, with deep understanding of:
1. ${marketplace}'s search algorithm and ranking factors
2. Buyer psychology and purchase decision factors
3. Product presentation best practices
4. SEO and keyword optimization for e-commerce

Your task is to enhance product listings to maximize visibility, conversion rate, and customer satisfaction.`;
      
      // User prompt for product enhancement
      const userPrompt = `Please enhance the following product for ${marketplace}:
${JSON.stringify(product, null, 2)}

For each field, provide significant improvements while maintaining accuracy:
1. TITLE: Create a keyword-rich, compelling title (stay under ${marketplace === 'Amazon' ? 200 : 100} characters)
2. DESCRIPTION: Write a persuasive, well-structured description with key features and benefits
3. BULLET_POINTS: Create 5 concise, benefit-focused bullet points
4. SEARCH_TERMS: Generate 5-7 high-value search keywords

Return the enhanced product data in this JSON format:
{
  "title": "Enhanced product title",
  "description": "Enhanced product description...",
  "bullet_points": [
    "First bullet point",
    "Second bullet point",
    "Third bullet point",
    "Fourth bullet point",
    "Fifth bullet point"
  ],
  "search_terms": [
    "keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"
  ]
}`;
      
      // Call OpenRouter API with optimized prompts
      const response = await callOpenRouter(systemPrompt, userPrompt, modelId, { responseFormat: 'json' });
      
      // Parse enhanced product data
      const enhancedData = JSON.parse(response);
      
      // Merge original product with enhanced data
      const enhancedProduct = {
        ...product,
        title: enhancedData.title || product.title,
        description: enhancedData.description || product.description,
        bullet_points: enhancedData.bullet_points || product.bullet_points,
        search_terms: enhancedData.search_terms || product.search_terms,
        enhanced: true,
        enhancement_model: modelId,
        enhancement_timestamp: new Date().toISOString()
      };
      
      enhancedProducts.push(enhancedProduct);
      
    } catch (error: any) {
      console.error(`Error enhancing product:`, error.message);
      
      // Add original product to results with error flag
      enhancedProducts.push({
        ...product,
        enhanced: false,
        enhancement_error: error.message
      });
    }
  }
  
  return enhancedProducts;
}

/**
 * Generate system prompt for marketplace-specific content
 * 
 * @param marketplace Target marketplace
 * @param contentType Type of content to generate
 * @returns System prompt for the specified marketplace and content type
 */
export function generateMarketplaceSystemPrompt(
  marketplace: string,
  contentType: 'title' | 'description' | 'bullets' | 'keywords'
): string {
  // Base prompt for marketplace expertise
  let systemPrompt = `You are an expert e-commerce product content creator for ${marketplace}, specializing in `;
  
  // Add content type-specific expertise
  switch (contentType) {
    case 'title':
      systemPrompt += `creating optimized product titles that:
1. Maximize search visibility through strategic keyword placement
2. Drive click-through with compelling, benefit-focused language
3. Conform perfectly to ${marketplace}'s title guidelines and character limits
4. Balance search optimization with readability and conversion potential`;
      break;
    
    case 'description':
      systemPrompt += `crafting persuasive product descriptions that:
1. Present features in terms of customer benefits
2. Use psychological triggers to increase desire and perceived value
3. Overcome objections preemptively through strategic content structure
4. Incorporate keywords naturally for search optimization
5. Format text optimally for ${marketplace}'s listing layout and guidelines`;
      break;
    
    case 'bullets':
      systemPrompt += `creating high-converting bullet points that:
1. Highlight the most important selling points in priority order
2. Connect features to benefits using persuasive language
3. Address specific customer pain points and use cases
4. Incorporate keywords naturally for search visibility
5. Follow ${marketplace}'s best practices for bullet point format and length`;
      break;
    
    case 'keywords':
      systemPrompt += `identifying strategic search keywords that:
1. Match actual customer search behavior on ${marketplace}
2. Include both high-volume and low-competition opportunities
3. Cover various aspects of the product (features, uses, problems solved)
4. Include relevant category terms, synonyms and related concepts
5. Conform to ${marketplace}'s keyword guidelines and best practices`;
      break;
  }
  
  return systemPrompt;
}