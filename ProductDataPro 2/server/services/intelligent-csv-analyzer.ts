/**
 * Intelligent CSV Analyzer Service
 * 
 * This service provides advanced CSV analysis capabilities using OpenRouter API
 * to detect product types, understand schema, and prepare for AI enhancement.
 */

import axios from 'axios';
import { Product } from '@shared/schema';

// API key configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Analysis result interface
interface AnalysisResult {
  productType: string;
  confidence: number;
  detectedFields: {
    name: string;
    importance: 'high' | 'medium' | 'low';
    present: boolean;
    needsEnhancement: boolean;
  }[];
  missingFields: string[];
  recommendedFields: string[];
  marketplaceCompatibility: {
    amazon?: number;
    ebay?: number;
    walmart?: number;
    shopify?: number;
    etsy?: number;
  };
  enhancementPriorities: string[];
}

// Field mapping interface
interface FieldMapping {
  originalField: string;
  standardField: string;
  confidence: number;
}

/**
 * Analyze CSV data structure and product information using AI
 * @param products Raw product data from CSV
 */
export async function analyzeProductData(products: any[]): Promise<{
  analysis: AnalysisResult;
  mappedProducts: Product[];
  fieldMappings: FieldMapping[];
}> {
  try {
    console.log(`Analyzing ${products.length} products with intelligent analyzer`);
    
    // Take a sample for analysis (to avoid overwhelming the API), but process all products
    const sampleSize = Math.min(5, products.length);
    const productSamples = products.slice(0, sampleSize);
    console.log(`Using ${sampleSize} sample products for AI analysis, but will process all ${products.length} products for mapping`);
    
    // Debug log to track all product IDs
    if (products.length > 0) {
      console.log(`Debug - Product IDs being processed: ${products.map(p => p.product_id).join(', ').substring(0, 200)}${products.length > 10 ? '...' : ''}`);
    }
    
    // Create system prompt for analysis
    const systemPrompt = `
You are an e-commerce product data expert specializing in marketplace listing optimization.
Your task is to analyze product data and provide insights to help improve product listings.
Based on the CSV data provided, determine the product type, identify missing fields, and recommend improvements.
Respond in a structured JSON format that can be directly parsed by a program.
`;

    // Create user prompt with product samples
    const userPrompt = `
Analyze the following product data samples from a CSV file:

${JSON.stringify(productSamples, null, 2)}

Based on this data:
1. Determine the likely product type/category these items belong to
2. Identify which standard e-commerce fields are present and which are missing
3. Assess the data quality and fields that need enhancement
4. Map the existing CSV column names to standard product fields
5. Recommend marketplace-specific optimizations

Respond with ONLY a JSON object with the following structure:
{
  "productType": "string",
  "confidence": number (0-1),
  "detectedFields": [
    {
      "name": "string",
      "importance": "high|medium|low",
      "present": boolean,
      "needsEnhancement": boolean
    }
  ],
  "missingFields": ["string"],
  "recommendedFields": ["string"],
  "fieldMappings": [
    {
      "originalField": "string",
      "standardField": "string",
      "confidence": number (0-1)
    }
  ],
  "marketplaceCompatibility": {
    "amazon": number (0-100),
    "ebay": number (0-100),
    "walmart": number (0-100),
    "shopify": number (0-100),
    "etsy": number (0-100)
  },
  "enhancementPriorities": ["string"]
}
`;

    // Call OpenRouter API for analysis
    const analysisResponse = await callOpenRouterAPI(systemPrompt, userPrompt);
    const analysisData = extractJsonResponse(analysisResponse);
    
    // Extract field mappings
    const fieldMappings = analysisData.fieldMappings || detectFieldMappings(products);
    
    // Map ALL products based on detected mappings, not just the samples
    console.log(`Mapping ${products.length} products with detected field mappings`);
    const mappedProducts = mapProductFields(products, fieldMappings);
    console.log(`Successfully mapped ${mappedProducts.length} products with detected field mappings`);
    
    // Log the first few product IDs from the mapped products to verify all were processed
    if (mappedProducts.length > 0) {
      console.log(`Debug - First few mapped product IDs: ${mappedProducts.slice(0, 5).map(p => p.product_id).join(', ')}${mappedProducts.length > 5 ? '...' : ''}`);
      console.log(`Debug - Total mapped products: ${mappedProducts.length}`);
    }
    
    // Remove fieldMappings from analysis result to match interface
    const { fieldMappings: _, ...analysisResult } = analysisData;
    
    return {
      analysis: analysisResult as AnalysisResult,
      mappedProducts,
      fieldMappings,
    };
  } catch (error) {
    console.error('Error analyzing product data:', error);
    
    // Fallback to basic analysis if AI analysis fails
    console.log('Falling back to basic analysis');
    console.log(`Attempting to map all ${products.length} products with basic field detection`);
    const fieldMappings = detectFieldMappings(products);
    const mappedProducts = mapProductFields(products, fieldMappings);
    console.log(`Fallback mapping completed successfully with ${mappedProducts.length} products`);
    
    // Log the first few product IDs from the mapped products to verify all were processed
    if (mappedProducts.length > 0) {
      console.log(`Debug - First few fallback-mapped product IDs: ${mappedProducts.slice(0, 5).map(p => p.product_id).join(', ')}${mappedProducts.length > 5 ? '...' : ''}`);
    }
    
    const fallbackAnalysis: AnalysisResult = {
      productType: "generic",
      confidence: 0.5,
      detectedFields: getDefaultRequiredFields().map(field => ({
        name: field,
        importance: "high" as const,
        present: mappedProducts.some(p => {
          switch(field) {
            case 'title': return !!p.title;
            case 'description': return !!p.description;
            case 'brand': return !!p.brand;
            case 'price': return !!p.price;
            case 'category': return !!p.category;
            case 'bullet_points': return !!p.bullet_points;
            case 'images': return !!p.images;
            case 'asin': return !!p.asin;
            default: return false;
          }
        }),
        needsEnhancement: true
      })),
      missingFields: getDefaultRequiredFields().filter(
        field => !mappedProducts.some(p => {
          switch(field) {
            case 'title': return !!p.title;
            case 'description': return !!p.description;
            case 'brand': return !!p.brand;
            case 'price': return !!p.price;
            case 'category': return !!p.category;
            case 'bullet_points': return !!p.bullet_points;
            case 'images': return !!p.images;
            case 'asin': return !!p.asin;
            default: return false;
          }
        })
      ),
      recommendedFields: getDefaultRequiredFields(),
      marketplaceCompatibility: {
        amazon: 60,
        ebay: 70,
        walmart: 60,
        shopify: 80,
        etsy: 40
      },
      enhancementPriorities: ["title", "description", "bullet_points"]
    };
    
    return {
      analysis: fallbackAnalysis,
      mappedProducts,
      fieldMappings,
    };
  }
}

/**
 * Call OpenRouter API for analysis
 * @param systemPrompt System instructions for the AI
 * @param userPrompt The query/data to analyze
 */
async function callOpenRouterAPI(systemPrompt: string, userPrompt: string, jsonResponse: boolean = false): Promise<string> {
  try {
    // Log API call attempt
    console.log(`Attempting to call OpenRouter API for ${jsonResponse ? 'JSON structured' : 'text'} response`);
    
    // Check if OpenRouter API key is available
    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not found, falling back to OpenAI');
      return await tryOpenAIFallback(systemPrompt, userPrompt, jsonResponse);
    }
    
    // Set up base request
    const requestBody: any = {
      model: 'anthropic/claude-3-haiku', // Starting with a faster model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more deterministic/analytical results
    };
    
    // Add response_format if JSON is requested
    if (jsonResponse) {
      requestBody.response_format = { type: "json_object" };
    }
    
    // Function to attempt API call with a specific model
    const attemptWithModel = async (model: string, attempt: number, maxAttempts: number): Promise<string> => {
      try {
        console.log(`Attempting to call OpenRouter with model: ${model} (attempt ${attempt} of ${maxAttempts})`);
        requestBody.model = model;
        
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          requestBody,
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
          console.log(`Successfully called OpenRouter with model: ${model}`);
          return response.data.choices[0].message.content;
        } else {
          throw new Error('Unexpected response format from OpenRouter API');
        }
      } catch (error: any) {
        console.error(`Error calling OpenRouter with model ${model}:`, error.message);
        
        if (attempt < maxAttempts) {
          // Wait before retrying with a different model
          console.log(`Waiting 1000ms before trying next model...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Cycle through models on failures
          if (model === 'anthropic/claude-3-5-sonnet') {
            return attemptWithModel('anthropic/claude-3-haiku', attempt + 1, maxAttempts);
          } else if (model === 'anthropic/claude-3-haiku') {
            return attemptWithModel('openai/gpt-4o', attempt + 1, maxAttempts);
          } else {
            return attemptWithModel('anthropic/claude-3-5-sonnet', attempt + 1, maxAttempts);
          }
        }
        
        throw error;
      }
    };
    
    // Start with Claude 3.5 and cycle through models if needed
    return await attemptWithModel('anthropic/claude-3-5-sonnet', 1, 3);
  } catch (error) {
    console.error('All OpenRouter API attempts failed:', error);
    return await tryOpenAIFallback(systemPrompt, userPrompt, jsonResponse);
  }
}

/**
 * Fallback to direct OpenAI API if OpenRouter fails
 */
async function tryOpenAIFallback(systemPrompt: string, userPrompt: string, jsonResponse: boolean = false): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('No API keys available for analysis');
  }
  
  console.log("Attempting OpenAI fallback");
  
  try {
    // Create request body
    const requestBody: any = {
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.3
    };
    
    // Add response_format if JSON is requested
    if (jsonResponse) {
      requestBody.response_format = { type: "json_object" };
    }
    
    // Call OpenAI API directly
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    console.log("OpenAI fallback successful");
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Extract and parse JSON from API response text
 * Handles both direct JSON responses and code blocks with JSON
 */
function extractJsonResponse(responseText: string): any {
  try {
    console.log("Extracting JSON from API response");
    
    let jsonString = responseText;
    
    // Check if the response contains markdown code blocks
    if (responseText.includes('```json') || responseText.includes('```')) {
      console.log("Detected markdown code block in response");
      
      // Extract content from JSON code blocks
      const jsonCodeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
        jsonString = jsonCodeBlockMatch[1].trim();
      } else {
        // Try to extract from generic code blocks
        const codeBlockMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          jsonString = codeBlockMatch[1].trim();
        }
      }
    }
    
    // Try to parse the JSON directly first
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.log("Direct JSON parse failed, trying to extract JSON object");
      
      // Find the first JSON object in the response
      const jsonMatch = jsonString.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    }
  } catch (error) {
    console.error('Error extracting JSON from response:', error);
    console.log("Problematic response text:", responseText);
    
    // Return a minimal valid object as fallback
    return {
      productType: "Unknown Product",
      category: "General Merchandise",
      targetAudience: "General consumers",
      keyFeatures: ["Quality", "Value", "Utility"],
      error: 'Could not parse JSON response'
    };
  }
}

/**
 * Map product fields based on detected mappings
 */
function mapProductFields(products: any[], fieldMappings: FieldMapping[]): Product[] {
  return products.map(product => {
    // Create a new product object with standardized fields
    const mappedProduct: Partial<Product> = {
      // Preserve existing product_id if present, otherwise generate a new one
      product_id: product.product_id || generateProductId(),
      status: "pending",
      title: null,
      description: null,
      brand: null,
      price: null,
      category: null,
      bullet_points: null,
      images: null,
      asin: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Apply field mappings
    for (const mapping of fieldMappings) {
      const { originalField, standardField } = mapping;
      
      // Check if the original field exists in the product
      if (product[originalField] !== undefined) {
        // Map to standard field based on its name
        switch(standardField) {
          case 'title':
            mappedProduct.title = product[originalField];
            break;
          case 'description':
            mappedProduct.description = product[originalField];
            break;
          case 'brand':
            mappedProduct.brand = product[originalField];
            break;
          case 'price':
            mappedProduct.price = product[originalField];
            break;
          case 'category':
            mappedProduct.category = product[originalField];
            break;
          case 'bullet_points':
            mappedProduct.bullet_points = product[originalField];
            break;
          case 'images':
            mappedProduct.images = product[originalField];
            break;
          case 'asin':
            mappedProduct.asin = product[originalField];
            break;
        }
      }
    }
    
    // Convert bullet points to array if it's a string
    if (typeof mappedProduct.bullet_points === 'string') {
      mappedProduct.bullet_points = [mappedProduct.bullet_points];
    }
    
    // Ensure created_at and updated_at are set
    mappedProduct.created_at = new Date();
    mappedProduct.updated_at = new Date();
    
    return mappedProduct as Product;
  });
}

/**
 * Generate a random product ID
 */
function generateProductId(): string {
  // Use timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PROD-${timestamp}-${random}`;
}

/**
 * Get default required fields for products
 */
function getDefaultRequiredFields(): string[] {
  return [
    'title',
    'description',
    'brand',
    'price',
    'category',
    'bullet_points',
    'images',
    'asin'
  ];
}

/**
 * Basic field mapping detection as fallback
 */
function detectFieldMappings(products: any[]): FieldMapping[] {
  if (products.length === 0) {
    return [];
  }
  
  // Get all keys from the first product
  const sampleProduct = products[0];
  const keys = Object.keys(sampleProduct);
  
  const mappings: FieldMapping[] = [];
  
  // Field name normalization mapping
  const commonMappings: Record<string, string> = {
    // Title mappings
    'title': 'title',
    'name': 'title',
    'product_name': 'title',
    'product_title': 'title',
    'item_name': 'title',
    'item_title': 'title',
    
    // Description mappings
    'description': 'description',
    'product_description': 'description',
    'item_description': 'description',
    'desc': 'description',
    'long_description': 'description',
    
    // Brand mappings
    'brand': 'brand',
    'brand_name': 'brand',
    'manufacturer': 'brand',
    'vendor': 'brand',
    
    // Price mappings
    'price': 'price',
    'item_price': 'price',
    'product_price': 'price',
    'retail_price': 'price',
    'sale_price': 'price',
    'cost': 'price',
    
    // Category mappings
    'category': 'category',
    'product_category': 'category',
    'item_category': 'category',
    'product_type': 'category',
    'department': 'category',
    
    // Bullet point mappings
    'bullet_points': 'bullet_points',
    'bullets': 'bullet_points',
    'features': 'bullet_points',
    'product_features': 'bullet_points',
    'key_features': 'bullet_points',
    'highlights': 'bullet_points',
    
    // Image mappings
    'images': 'images',
    'image': 'images',
    'image_url': 'images',
    'product_image': 'images',
    'item_image': 'images',
    'picture': 'images',
    
    // ASIN mappings
    'asin': 'asin',
    'amazon_id': 'asin',
    'amazon_identifier': 'asin',
    'amazon_asin': 'asin',
  };
  
  // Loop through all keys in the sample product
  for (const key of keys) {
    // Normalize the key (lowercase, remove spaces/underscores)
    const normalizedKey = key.toLowerCase().replace(/[_\s]/g, '');
    
    // Check for exact matches in common mappings
    if (commonMappings[key.toLowerCase()]) {
      mappings.push({
        originalField: key,
        standardField: commonMappings[key.toLowerCase()],
        confidence: 0.9
      });
      continue;
    }
    
    // Check for partial matches by checking if any standard field is contained within the key
    for (const [pattern, standardField] of Object.entries(commonMappings)) {
      if (normalizedKey.includes(pattern.replace(/[_\s]/g, ''))) {
        mappings.push({
          originalField: key,
          standardField,
          confidence: 0.7
        });
        break;
      }
    }
  }
  
  return mappings;
}

/**
 * Analyze products to detect their type and other attributes
 */
export async function detectProductTypes(products: Product[]): Promise<Record<string, any>> {
  try {
    // Only use a sample of products for analysis to save API costs
    const sampleSize = Math.min(3, products.length);
    const productSamples = products.slice(0, sampleSize);
    console.log(`Analyzing ${sampleSize} sample products out of ${products.length} total for product type detection`);
    
    // Log the actual product data being analyzed
    console.log("Product data being analyzed:", JSON.stringify(productSamples.map(p => ({
      title: p.title,
      description: p.description,
      brand: p.brand,
      category: p.category
    })), null, 2));
    
    // Create system prompt for product type detection
    const systemPrompt = `
You are an e-commerce product categorization expert.
Your task is to analyze product data and determine the most specific product type.
Based on the product information provided, classify products into specific categories.
Be as precise as possible about the specific product type (e.g., "Wireless Gaming Headphones" not just "Electronics").
`;

    // Create user prompt with product samples
    const userPrompt = `
Analyze the following product data samples:

${JSON.stringify(productSamples, null, 2)}

Based on this data, determine:
1. The most specific product type/category these items belong to (e.g., "Bluetooth Headphones" not just "Electronics")
2. The target audience and use case for these products
3. Key features that would be important for this type of product
4. Category this product belongs to

Respond with ONLY a JSON object with the following structure:
{
  "productType": "string (specific product type, be very specific)",
  "category": "string (broader category)",
  "targetAudience": "string",
  "keyFeatures": ["string array of 3-5 key features"],
  "marketplaceRecommendations": {
    "amazon": "string",
    "ebay": "string"
  }
}
`;

    // Call OpenRouter API for product type detection
    const typeResponse = await callOpenRouterAPI(systemPrompt, userPrompt, true);
    console.log("Product type detection response:", typeResponse);
    const typeData = extractJsonResponse(typeResponse);
    console.log("Extracted product type data:", typeData);
    
    // Ensure we have the correct fields
    const result = {
      productType: typeData.productType || "Unknown Product",
      category: typeData.category || "General Merchandise",
      targetAudience: typeData.targetAudience || "General consumers",
      keyFeatures: typeData.keyFeatures || ["Quality", "Durability", "Value"],
      marketplaceRecommendations: typeData.marketplaceRecommendations || {
        amazon: "Focus on product specifications and key features",
        ebay: "Highlight condition, shipping, and return policies"
      }
    };
    
    console.log("Detected product type:", result.productType);
    console.log("Detected category:", result.category);
    
    return result;
  } catch (error) {
    console.error('Error detecting product types:', error);
    
    // Return fallback product type information - not hardcoded to office chairs
    // This ensures we don't always fall back to the same product type
    return {
      productType: "Unknown Product",
      category: "General Merchandise",
      targetAudience: "General consumers",
      keyFeatures: ["Quality", "Value", "Utility"],
      marketplaceRecommendations: {
        amazon: "Focus on product specifications and key features",
        ebay: "Highlight condition, shipping, and return policies"
      }
    };
  }
}

/**
 * Generate detailed prompts for product enhancement based on the product type
 */
export function generateEnhancementPrompt(productType: string, marketplace: string): string {
  // Import prompt templates from smart-prompts service
  const { generateEnhancementSystemPrompt } = require('./smart-prompts');
  
  return generateEnhancementSystemPrompt(productType, marketplace);
}