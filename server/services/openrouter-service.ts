/**
 * OpenRouter API integration for product data enhancement
 * This service provides advanced product data enhancement capabilities using multiple AI models through OpenRouter
 */

import axios from 'axios';
import { Product } from '../../shared/schema';
import { systemPrompts } from './smart-prompts';

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Available models through OpenRouter
const MODELS = {
  GPT4O: 'openai/chatgpt-4o-latest',      // OpenAI GPT-4o
  GEMINI_PRO: 'google/gemini-2.5-pro-preview', // Google Gemini Pro
  CLAUDE3: 'anthropic/claude-3-7-sonnet-20250219',   // Anthropic Claude 3 Sonnet
  MISTRAL: 'mistralai/mistral-large-latest',  // Mistral Large
  LLAMA3: 'meta-llama/llama-3-70b-instruct'  // Llama 3 70B
};

/**
 * Enhance product data using OpenRouter API with access to multiple AI models
 * @param products List of products to enhance
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @param modelPreference Preferred AI model to use
 * @returns Enhanced product data
 */
export async function enhanceProductDataWithOpenRouter(
  products: any[],
  marketplace: string,
  modelPreference: string = 'gpt4o'
): Promise<Product[]> {
  console.log(`Starting OpenRouter product data enhancement for ${products.length} products for ${marketplace}`);
  console.log(`Using model preference: ${modelPreference}`);
  
  const enhancedProducts: Product[] = [];
  
  // Map the model preference to an actual model ID
  let modelId = MODELS.GPT4O; // Default to GPT-4o
  
  if (modelPreference === 'gemini') {
    modelId = MODELS.GEMINI_PRO;
  } else if (modelPreference === 'claude') {
    modelId = MODELS.CLAUDE3;
  } else if (modelPreference === 'mistral') {
    modelId = MODELS.MISTRAL;
  } else if (modelPreference === 'llama') {
    modelId = MODELS.LLAMA3;
  }
  
  console.log(`Selected model: ${modelId}`);
  
  try {
    // Process each product
    for (const product of products) {
      console.log(`Enhancing product with ID: ${product.product_id}`);
      
      try {
        // Step 1: Research the product to better understand what it is (if needed)
        if (!product.category || !product.title || !product.description) {
          console.log(`Product ${product.product_id} missing core information, performing research...`);
          const researchData = await researchProductWithOpenRouter(product, modelId);
          product._research = researchData;
          console.log(`Research complete for ${product.product_id}, identified as: ${researchData.product_type}`);
          
          // Apply category from research if not already present
          if (!product.category && researchData.product_type) {
            product.category = researchData.product_type;
            console.log(`Applied category "${product.category}" from research`);
          }
        }
        
        // Step 2: Generate a marketplace-optimized title if missing
        if (!product.title) {
          console.log(`Generating optimized title for ${product.product_id}`);
          const maxTitleLength = marketplace === "Amazon" ? 200 : 80;
          product.title = await generateTitleWithOpenRouter(product, marketplace, maxTitleLength, modelId);
          console.log(`Generated title: ${product.title.substring(0, 50)}...`);
        }
        
        // Step 3: Generate a detailed product description if missing
        if (!product.description) {
          console.log(`Generating detailed description for ${product.product_id}`);
          const maxDescLength = marketplace === "Amazon" ? 2000 : 1000;
          product.description = await generateDescriptionWithOpenRouter(product, marketplace, maxDescLength, modelId);
          console.log(`Generated description (${product.description.length} chars)`);
        }
        
        // Step 4: Generate bullet points highlighting key features if missing
        if (!product.bullet_points || !Array.isArray(product.bullet_points) || product.bullet_points.length === 0) {
          console.log(`Generating feature bullet points for ${product.product_id}`);
          const bulletPointCount = marketplace === "Amazon" ? 5 : 3;
          product.bullet_points = await generateBulletPointsWithOpenRouter(product, marketplace, bulletPointCount, modelId);
          console.log(`Generated ${product.bullet_points.length} bullet points`);
        }
        
        // Step 5: Generate brand if missing (important for most marketplaces)
        if (!product.brand) {
          console.log(`Suggesting brand for ${product.product_id}`);
          product.brand = await suggestBrandWithOpenRouter(product, modelId);
          console.log(`Suggested brand: ${product.brand}`);
        }
        
        // Generate an ASIN for Amazon if needed
        if (marketplace === "Amazon" && !product.asin) {
          product.asin = generateRandomASIN();
          console.log(`Generated ASIN: ${product.asin}`);
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
    
    console.log(`Enhancement complete for ${enhancedProducts.length} products`);
    return enhancedProducts;
  } catch (error) {
    console.error("Error in enhanceProductDataWithOpenRouter:", error);
    throw error;
  }
}

/**
 * Call the OpenRouter API with appropriate model selection and error handling
 * @param systemPrompt The system prompt to guide the AI
 * @param userPrompt The user prompt/question
 * @param modelId The ID of the AI model to use
 * @param options Additional API options
 * @returns The generated text response
 */
async function callOpenRouterAPI(
  systemPrompt: string,
  userPrompt: string,
  modelId: string,
  options: {
    temperature?: number;
    max_tokens?: number;
    json_mode?: boolean;
  } = {}
): Promise<string> {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key not found. Please set the OPENROUTER_API_KEY environment variable.");
    }
    
    // Default options
    const temperature = options.temperature ?? 0.7;
    const max_tokens = options.max_tokens ?? 1000;
    
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    // Prepare request configuration
    const payload = {
      model: modelId,
      messages: messages,
      temperature: temperature,
      max_tokens: max_tokens,
      ...(options.json_mode ? { response_format: { type: "json_object" } } : {})
    };

    const config = {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APPLICATION_URL || 'https://product-listing-enhancer.com',
        'X-Title': 'Product Listing Enhancer'
      }
    };

    console.log(`Calling OpenRouter API with model: ${modelId}`);
    
    // Make API request
    const response = await axios.post(OPENROUTER_API_URL, payload, config);
    
    // Extract the response text
    if (response.data &&
        response.data.choices &&
        response.data.choices.length > 0 &&
        response.data.choices[0].message &&
        response.data.choices[0].message.content) {
      
      return response.data.choices[0].message.content;
    }
    
    throw new Error('No valid content in OpenRouter API response');
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // If the error is due to a rate limit or quota issue
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      console.log('OpenRouter rate limit or quota exceeded. Using fallback method.');
    }
    
    // Return a fallback response with graceful degradation
    return `The product information could not be automatically enhanced at this time. Please check your product data and try again later.`;
  }
}

/**
 * Researches a product to understand what it is based on limited information
 * @param product Product data with limited information
 * @param modelId The ID of the AI model to use
 * @returns Enhanced understanding of the product
 */
async function researchProductWithOpenRouter(product: any, modelId: string): Promise<any> {
  const systemPrompt = systemPrompts.productResearch;
  
  const productInfo = {
    product_id: product.product_id,
    title: product.title || null,
    description: product.description || null,
    price: product.price || null,
    brand: product.brand || null,
    category: product.category || null,
    available_data: Object.keys(product).filter(key => !!product[key])
  };
  
  const userPrompt = `
Analyze this product data and help me understand what this product is. The information may be incomplete.

Product Information:
${JSON.stringify(productInfo, null, 2)}

Please provide:
1. What type of product is this? (Be specific about the product category)
2. What are its likely key features and benefits?
3. Who would be the target audience?
4. What are likely search terms people would use to find this product?
5. What additional information would make this listing more complete?
6. What is the appropriate pricing tier for this product (budget, mid-range, premium)?

Format your response as JSON with these fields:
{
  "product_type": "String describing the specific product type",
  "likely_features": ["Array of strings with likely key features"],
  "target_audience": "String describing the target audience",
  "search_terms": ["Array of strings with likely search terms"],
  "missing_information": ["Array of strings describing missing information"],
  "pricing_tier": "budget|mid-range|premium",
  "enhanced_understanding": "String with overall assessment of what this product is",
  "confidence_score": number from 0-1 indicating confidence in the analysis
}
`;

  try {
    const response = await callOpenRouterAPI(systemPrompt, userPrompt, modelId, {
      temperature: 0.5,
      max_tokens: 800,
      json_mode: true
    });
    
    try {
      // Parse the JSON response
      return JSON.parse(response);
    } catch (jsonError) {
      console.error('Failed to parse research JSON:', jsonError);
      console.log('Raw research response:', response);
      
      // Return a simple fallback object
      return {
        product_type: product.category || "General Merchandise",
        likely_features: ["Quality construction", "Practical design", "Good value"],
        target_audience: "General consumers",
        search_terms: [product.title || "product", "merchandise"],
        missing_information: ["Complete product details", "specifications", "dimensions"],
        pricing_tier: "mid-range",
        enhanced_understanding: "This appears to be a general merchandise product with limited information",
        confidence_score: 0.3
      };
    }
  } catch (error) {
    console.error('Error in product research:', error);
    throw error;
  }
}

/**
 * Generates an SEO-optimized product title
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum title length
 * @param modelId The ID of the AI model to use
 * @returns Generated title
 */
async function generateTitleWithOpenRouter(product: any, marketplace: string, maxLength: number, modelId: string): Promise<string> {
  const systemPrompt = systemPrompts.marketplaceOptimization;
  
  // Create marketplace-specific title guidance
  let marketplaceGuidance = "";
  if (marketplace === "Amazon") {
    marketplaceGuidance = `
      For Amazon listings:
      - Format: [Brand] + [Key Feature] + [Product Type] + [Size/Quantity/Color if applicable]
      - Example: "Sony X900H 65-Inch 4K Ultra HD Smart LED TV with HDR and Alexa Compatibility"
      - Start with the brand if available
      - Include 3-5 key features that differentiate the product
      - Use Amazon-friendly keywords for search optimization
      - Avoid promotional language and ALL CAPS
    `;
  } else if (marketplace === "eBay") {
    marketplaceGuidance = `
      For eBay listings:
      - Be specific and descriptive
      - Include brand, model, size, color as applicable
      - Use popular search terms but avoid keyword stuffing
      - Example: "Apple iPhone 12 Pro Max 256GB Pacific Blue Unlocked Excellent Condition"
      - Focus on specific product features and specifications
    `;
  } else {
    marketplaceGuidance = `
      General title best practices:
      - Start with the brand name
      - Include key features and product type
      - Add size, color, quantity as applicable
      - Use common search terms but avoid keyword stuffing
    `;
  }
  
  // Gather existing product information
  const existingInfo = {
    product_id: product.product_id,
    title: product.title || null,
    description: product.description || null,
    brand: product.brand || null,
    category: product.category || null,
    price: product.price || null,
    color: product.color || null,
    size: product.size || null,
    material: product.material || null,
    features: product.bullet_points || [],
    research: product._research || null
  };
  
  const userPrompt = `
Create a highly effective SEO-optimized product title for ${marketplace} marketplace.

${marketplaceGuidance}

Constraints:
- Maximum length: ${maxLength} characters
- Must be descriptive and compelling
- Include most important features and benefits
- No ALL CAPS words (except for acronyms like "HD" or "USB")
- No excessive special characters or emoji
- No promotional language like "best", "amazing", etc.
- Must be accurate to the product information provided
- Should follow ${marketplace}'s best practices for product titles

Product information:
${JSON.stringify(existingInfo, null, 2)}

Return ONLY the title text with no additional explanation, quotation marks, or formatting.
`;

  try {
    // Call OpenRouter API
    const response = await callOpenRouterAPI(systemPrompt, userPrompt, modelId, {
      temperature: 0.7,
      max_tokens: 100
    });
    
    // Trim and clean up the response
    const cleanTitle = response.trim()
      .replace(/^["']/, '') // Remove leading quotes
      .replace(/["']$/, '') // Remove trailing quotes
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    // Ensure the title doesn't exceed max length
    return cleanTitle.substring(0, maxLength);
  } catch (error) {
    console.error('Error generating title:', error);
    
    // Create a fallback title
    const brandPart = product.brand ? `${product.brand} ` : '';
    const categoryPart = product.category ? `${product.category} ` : 'Product ';
    const idPart = product.product_id ? `#${product.product_id.substring(0, 6)}` : '';
    
    return `${brandPart}${categoryPart}${idPart}`.substring(0, maxLength);
  }
}

/**
 * Generates a detailed product description
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum description length
 * @param modelId The ID of the AI model to use
 * @returns Generated description
 */
async function generateDescriptionWithOpenRouter(product: any, marketplace: string, maxLength: number, modelId: string): Promise<string> {
  const systemPrompt = systemPrompts.contentGeneration;
  
  // Gather all available product information for better context
  const existingInfo = {
    product_id: product.product_id,
    title: product.title,
    brand: product.brand,
    category: product.category || (product._research ? product._research.product_type : null),
    features: product.bullet_points || [],
    price: product.price,
    dimensions: product.dimensions,
    weight: product.weight,
    material: product.material,
    color: product.color,
    current_description: product.description,
    research: product._research ? {
      product_type: product._research.product_type,
      likely_features: product._research.likely_features,
      target_audience: product._research.target_audience,
      search_terms: product._research.search_terms,
      enhanced_understanding: product._research.enhanced_understanding
    } : null
  };
  
  // Create marketplace-specific description guidance
  let marketplaceGuidance = "";
  if (marketplace === "Amazon") {
    marketplaceGuidance = `
      For Amazon listings:
      - Start with a compelling overview paragraph
      - Format with clear paragraph breaks (3-4 paragraphs total)
      - Include product specifications in the final paragraph
      - Focus on benefits and use cases, not just features
      - Be detailed but not overly promotional
      - Use HTML formatting (<p>, <br>, <b>) when appropriate
      - Include dimensions, materials, and compatibility information
    `;
  } else if (marketplace === "eBay") {
    marketplaceGuidance = `
      For eBay listings:
      - Start with key product features
      - Include any condition details if applicable
      - Be factual and straightforward
      - Include dimensions, materials, and technical specs where relevant
      - HTML formatting is supported and encouraged for readability
      - Be transparent about any limitations or requirements
    `;
  } else {
    marketplaceGuidance = `
      General description best practices:
      - Start with an engaging overview
      - Organize information into logical paragraphs
      - Balance features with benefits
      - Include practical use cases
      - End with specifications and technical details
      - Use a professional, helpful tone
    `;
  }
  
  const userPrompt = `
Create a detailed, persuasive product description for ${marketplace} marketplace.

${marketplaceGuidance}

Constraints:
- Maximum length: ${maxLength} characters
- Write in a professional, clear tone
- Use natural paragraph breaks for readability
- Include specific product features AND their benefits to users
- Avoid clichés like "premium quality" without supporting details
- No promotional superlatives like "best" or "amazing" without substantiation
- Must be factually accurate based on the provided product information
- Don't invent features or specifications not mentioned in the product information

Product information:
${JSON.stringify(existingInfo, null, 2)}

Return ONLY the description text with appropriate paragraph breaks. No additional formatting, explanations, or quotation marks.
`;
  
  try {
    const response = await callOpenRouterAPI(systemPrompt, userPrompt, modelId, {
      temperature: 0.7,
      max_tokens: maxLength / 4
    });
    
    // Clean up the response
    const cleanDescription = response.trim()
      .replace(/^["']/, '') // Remove leading quotes
      .replace(/["']$/, ''); // Remove trailing quotes
    
    // Ensure the description doesn't exceed max length
    return cleanDescription.substring(0, maxLength);
  } catch (error) {
    console.error('Error generating description:', error);
    
    // Create a fallback description
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
    
    // Add title if available
    if (product.title) {
      fallbackDescription += `The ${product.title} offers quality and reliability. `;
    }
    
    return fallbackDescription.substring(0, maxLength);
  }
}

/**
 * Generates bullet points highlighting key product features
 * @param product Product data
 * @param marketplace Target marketplace
 * @param count Number of bullet points to generate
 * @param modelId The ID of the AI model to use
 * @returns Array of bullet points
 */
async function generateBulletPointsWithOpenRouter(product: any, marketplace: string, count: number, modelId: string): Promise<string[]> {
  const systemPrompt = systemPrompts.contentGeneration;
  
  // Create marketplace-specific bullet point guidance
  let marketplaceGuidance = "";
  if (marketplace === "Amazon") {
    marketplaceGuidance = `
      For Amazon listings:
      - Start each bullet with a capital letter
      - Focus on the most compelling features first
      - Highlight unique selling points
      - Include specific measurements, materials, or capacities
      - Focus each bullet on a distinct feature/benefit pair
      - Front-load the most important information
      - Avoid promotional language and subjective claims
    `;
  } else if (marketplace === "eBay") {
    marketplaceGuidance = `
      For eBay listings:
      - Be concise and factual
      - Focus on specifications and features
      - Include compatibility information
      - Highlight condition, authenticity, or warranty details
      - Keep bullets shorter than 80 characters when possible
      - Avoid excessive punctuation or symbols
    `;
  } else {
    marketplaceGuidance = `
      General bullet point best practices:
      - Keep bullets concise (ideally under 100 characters each)
      - Prioritize most important features first
      - Focus on benefits to customer, not just features
      - Include key specifications where relevant
      - Avoid repetition across bullet points
      - Use parallel structure for consistency
    `;
  }
  
  const userPrompt = `
Create ${count} compelling bullet points for a ${marketplace} product listing.

${marketplaceGuidance}

Guidelines:
- Each bullet point should highlight a distinct key feature or benefit
- Begin with the benefit to the customer when possible
- Be specific and avoid generic statements
- Keep each bullet point concise but meaningful (under 100 characters if possible)
- No bullet points about shipping, warranty, or company history
- Focus on what makes the product valuable and distinctive
- Avoid repeating information across bullet points
- Each bullet point should be factually accurate based on the provided information
- Do not invent features or specifications not mentioned in the product data

Product information:
${JSON.stringify(product, null, 2)}

Return ONLY a list of ${count} bullet points, one per line, with no bullets, numbers, or other prefixes.
Do not include any additional explanation or formatting.
`;
  
  try {
    const response = await callOpenRouterAPI(systemPrompt, userPrompt, modelId, {
      temperature: 0.7,
      max_tokens: count * 100
    });
    
    // Split by newlines and clean up
    const bulletPoints = response
      .split('\n')
      .map(point => point.trim())
      .filter(point => point.length > 0)
      .slice(0, count);
    
    if (bulletPoints.length < count) {
      // Add some generic bullet points if we don't have enough
      const genericBullets = [
        "Made with premium materials for lasting durability",
        "Designed for ease of use and maximum convenience",
        "Perfect for both everyday use and special occasions",
        "Satisfaction guaranteed with quality craftsmanship",
        "Versatile design complements a variety of settings"
      ];
      
      while (bulletPoints.length < count && genericBullets.length > 0) {
        bulletPoints.push(genericBullets.shift() as string);
      }
    }
    
    return bulletPoints;
  } catch (error) {
    console.error('Error generating bullet points:', error);
    
    // Return basic fallback bullet points
    const fallbackBullets = [
      "Made with quality materials for durability and longevity",
      "Designed for ease of use with intuitive features",
      "Versatile functionality suitable for multiple applications",
      "Excellent value offering quality at a competitive price",
      "Thoughtfully designed with attention to detail"
    ];
    
    return fallbackBullets.slice(0, count);
  }
}

/**
 * Suggests a brand name based on product information
 * @param product Product data
 * @param modelId The ID of the AI model to use
 * @returns Suggested brand name
 */
async function suggestBrandWithOpenRouter(product: any, modelId: string): Promise<string> {
  const systemPrompt = 
    `You are a product branding expert. Your task is to suggest plausible brand names based on product information. 
     Only suggest existing brands that would likely make this type of product, or suggest a generic but realistic brand name.
     Never invent fictional brands with unrealistic names.`;
  
  const userPrompt = `
Based on the following product information, suggest a plausible brand name.
Do not invent information, only work with what's provided in the product details.

Product Information:
${JSON.stringify(product, null, 2)}

If there are any brand hints in the product title, description, or category, use those.
If there are no hints, suggest a generic manufacturer name that would be appropriate.
Return ONLY the brand name, nothing else.
`;
  
  try {
    const response = await callOpenRouterAPI(systemPrompt, userPrompt, modelId, {
      temperature: 0.5,
      max_tokens: 50
    });
    
    // Clean and validate the suggested brand
    const brand = response.trim()
      .replace(/["""'']/g, '') // Remove quotes
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();
    
    // Ensure we have a valid brand name
    if (!brand || brand.length > 30) {
      throw new Error('Invalid brand name generated');
    }
    
    return brand;
  } catch (error) {
    console.error('Error suggesting brand:', error);
    
    // Return a generic brand name based on category if available
    if (product.category) {
      const words = product.category.split(/\s+/);
      if (words.length > 0) {
        const name = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        return `${name} Essentials`;
      }
    }
    
    return "Quality Essentials";
  }
}

/**
 * Generates a random ASIN (Amazon Standard Identification Number)
 * @returns Random ASIN
 */
function generateRandomASIN(): string {
  const prefix = 'B0';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}${id}`;
}