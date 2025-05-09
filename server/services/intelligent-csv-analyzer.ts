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
    
    const sampleSize = Math.min(3, products.length);
    const productSamples = products.slice(0, sampleSize);
    
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
    
    // Map products based on detected mappings
    const mappedProducts = mapProductFields(products, fieldMappings);
    
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
    const fieldMappings = detectFieldMappings(products);
    const mappedProducts = mapProductFields(products, fieldMappings);
    
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
async function callOpenRouterAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    // Check if OpenRouter API key is available
    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not found, falling back to OpenAI');
      return await tryOpenAIFallback(systemPrompt, userPrompt);
    }
    
    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-7-sonnet-20250219', // Use the newest Anthropic model
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
    return await tryOpenAIFallback(systemPrompt, userPrompt);
  }
}

/**
 * Fallback to direct OpenAI API if OpenRouter fails
 */
async function tryOpenAIFallback(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('No API keys available for analysis');
  }
  
  try {
    // Call OpenAI API directly
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', // Use GPT-4o 
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
 * Extract and parse JSON from API response text
 */
function extractJsonResponse(responseText: string): any {
  try {
    // Find JSON object in the response (in case the API returned extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    throw error;
  }
}

/**
 * Map product fields based on detected mappings
 */
function mapProductFields(products: any[], fieldMappings: FieldMapping[]): Product[] {
  return products.map(product => {
    // Create a new product object with standardized fields
    const mappedProduct: Partial<Product> = {
      product_id: generateProductId(),
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
  return `PROD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
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
    const sampleSize = Math.min(3, products.length);
    const productSamples = products.slice(0, sampleSize);
    
    // Create system prompt for product type detection
    const systemPrompt = `
You are an e-commerce product categorization expert.
Your task is to analyze product data and determine the most specific product type.
Based on the product information provided, classify products into specific categories.
`;

    // Create user prompt with product samples
    const userPrompt = `
Analyze the following product data samples:

${JSON.stringify(productSamples, null, 2)}

Based on this data, determine:
1. The most specific product type/category these items belong to (e.g., "Bluetooth Headphones" not just "Electronics")
2. The target audience and use case for these products
3. Key features that would be important for this type of product

Respond with ONLY a JSON object with the following structure:
{
  "productType": "string (specific product type)",
  "targetAudience": "string",
  "keyFeatures": ["string"],
  "marketplaceRecommendations": {
    "amazon": "string",
    "ebay": "string"
  }
}
`;

    // Call OpenRouter API for product type detection
    const typeResponse = await callOpenRouterAPI(systemPrompt, userPrompt);
    const typeData = extractJsonResponse(typeResponse);
    
    return typeData;
  } catch (error) {
    console.error('Error detecting product types:', error);
    
    // Return fallback product type information
    return {
      productType: "General Merchandise",
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