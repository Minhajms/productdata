/**
 * Intelligent CSV Analyzer Service
 * 
 * This service provides advanced CSV analysis capabilities using OpenRouter API
 * to detect product types, understand schema, and prepare for AI enhancement.
 */

import axios from 'axios';
import { Product } from '@shared/schema';

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
  fieldMappings: FieldMapping[];
  products: Product[];
}> {
  try {
    // Extract sample for analysis
    const sampleSize = Math.min(products.length, 3);
    const sampleProducts = products.slice(0, sampleSize);
    
    // Prepare sample data for analysis
    const sampleData = JSON.stringify(sampleProducts, null, 2);
    
    // Create a system prompt for analysis
    const systemPrompt = `
      You are an expert product data analyst for e-commerce. Your task is to analyze product data and identify:
      1. The type of products (electronics, clothing, home goods, etc.)
      2. Required fields for marketplace listings
      3. Missing or incomplete fields that need enhancement
      4. Recommendations for data improvement
      
      Please analyze the data structure and content carefully, considering:
      - Standard fields required by major marketplaces
      - The quality and completeness of existing data
      - The type of products based on available fields
      - How to map non-standard field names to standard ones
      
      Format your response as a valid JSON with the following structure:
      {
        "productType": "string", // The detected product category
        "confidence": number, // Confidence in product type detection (0-1)
        "detectedFields": [
          {
            "name": "string", // Field name
            "importance": "high|medium|low",
            "present": boolean,
            "needsEnhancement": boolean
          }
        ],
        "missingFields": ["string"], // Important fields that are entirely missing
        "recommendedFields": ["string"], // Fields recommended for enhancement
        "marketplaceCompatibility": {
          "amazon": number, // Score from 0-1 for each marketplace
          "ebay": number,
          "walmart": number,
          "shopify": number,
          "etsy": number
        },
        "enhancementPriorities": ["string"], // Fields to prioritize for enhancement
        "fieldMappings": [
          {
            "originalField": "string", // Original field name in CSV
            "standardField": "string", // Standard field name to map to
            "confidence": number // Confidence in mapping (0-1)
          }
        ]
      }
    `;
    
    // Example user prompt
    const userPrompt = `
      Analyze these product entries from a CSV file:
      ${sampleData}
      
      Please identify the product type, required fields, missing fields, and provide field mappings.
      Return your analysis in the JSON format specified.
    `;

    // Call the OpenRouter API for analysis
    const openRouterResponse = await callOpenRouterAPI(systemPrompt, userPrompt);
    
    // Extract and parse the JSON response
    const analysis = extractJsonResponse(openRouterResponse);
    
    // Apply the field mappings to standardize the products
    const standardizedProducts = mapProductFields(products, analysis.fieldMappings);
    
    return {
      analysis: analysis,
      fieldMappings: analysis.fieldMappings,
      products: standardizedProducts
    };
  } catch (error) {
    console.error('Error in intelligent CSV analysis:', error);
    
    // Provide a fallback analysis if AI analysis fails
    const fallbackAnalysis: AnalysisResult = {
      productType: 'unknown',
      confidence: 0.5,
      detectedFields: getDefaultRequiredFields().map(field => ({
        name: field,
        importance: 'high' as const,
        present: products.some(p => p[field]),
        needsEnhancement: true
      })),
      missingFields: getDefaultRequiredFields().filter(field => 
        !products.some(p => p[field] && p[field].length > 0)
      ),
      recommendedFields: getDefaultRequiredFields(),
      marketplaceCompatibility: {
        amazon: 0.6,
        ebay: 0.6,
        walmart: 0.6,
        shopify: 0.6,
        etsy: 0.6
      },
      enhancementPriorities: ['title', 'description', 'bullet_points']
    };
    
    // Fallback field mappings
    const fallbackFieldMappings: FieldMapping[] = detectFieldMappings(products);
    
    // Apply fallback field mappings
    const standardizedProducts = mapProductFields(products, fallbackFieldMappings);
    
    return {
      analysis: fallbackAnalysis,
      fieldMappings: fallbackFieldMappings,
      products: standardizedProducts
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
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini', // Using GPT-4o mini for cost-effective analysis
        route: "fallback", // Will try other models if the first fails
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://productenhancer.com',
        }
      }
    );
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response from OpenRouter API');
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // Try fallback to OpenAI directly if OpenRouter fails
    return tryOpenAIFallback(systemPrompt, userPrompt);
  }
}

/**
 * Fallback to direct OpenAI API if OpenRouter fails
 */
async function tryOpenAIFallback(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set for fallback');
    }
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response from OpenAI API');
    }
  } catch (error) {
    console.error('Error in OpenAI fallback:', error);
    throw new Error('Both OpenRouter and OpenAI fallback failed');
  }
}

/**
 * Extract and parse JSON from API response text
 */
function extractJsonResponse(responseText: string): any {
  try {
    // First try direct parsing
    return JSON.parse(responseText);
  } catch (error) {
    // If direct parsing fails, try to extract JSON from text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse extracted JSON:', e);
      }
    }
    
    throw new Error('Could not extract valid JSON from API response');
  }
}

/**
 * Map product fields based on detected mappings
 */
function mapProductFields(products: any[], fieldMappings: FieldMapping[]): Product[] {
  return products.map(product => {
    const standardizedProduct: Record<string, any> = { 
      product_id: product.product_id || product.id || product.sku || generateProductId() 
    };
    
    // Apply field mappings
    fieldMappings.forEach(mapping => {
      if (product[mapping.originalField] !== undefined) {
        standardizedProduct[mapping.standardField] = product[mapping.originalField];
      }
    });
    
    // Ensure key fields exist
    getDefaultRequiredFields().forEach(field => {
      if (standardizedProduct[field] === undefined) {
        standardizedProduct[field] = '';
      }
    });
    
    return standardizedProduct as Product;
  });
}

/**
 * Generate a random product ID
 */
function generateProductId(): string {
  return `PROD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
}

/**
 * Get default required fields for products
 */
function getDefaultRequiredFields(): string[] {
  return [
    'product_id',
    'title',
    'description',
    'price',
    'brand',
    'category',
    'bullet_points',
    'images'
  ];
}

/**
 * Basic field mapping detection as fallback
 */
function detectFieldMappings(products: any[]): FieldMapping[] {
  if (!products || products.length === 0) {
    return [];
  }
  
  // Get all field names from the first product
  const sampleProduct = products[0];
  const originalFields = Object.keys(sampleProduct);
  
  // Map common field variations
  const fieldVariations: Record<string, string[]> = {
    'product_id': ['id', 'sku', 'product_id', 'productid', 'item_id', 'itemid', 'product_code', 'productcode'],
    'title': ['title', 'name', 'product_name', 'productname', 'item_name', 'itemname', 'product_title', 'producttitle'],
    'description': ['description', 'desc', 'product_description', 'productdescription', 'full_description', 'fulldescription', 'detail'],
    'price': ['price', 'cost', 'retail_price', 'retailprice', 'sale_price', 'saleprice', 'current_price', 'currentprice'],
    'brand': ['brand', 'manufacturer', 'producer', 'brand_name', 'brandname', 'make'],
    'category': ['category', 'cat', 'department', 'product_category', 'productcategory', 'product_type', 'producttype', 'type'],
    'bullet_points': ['features', 'bullet_points', 'bulletpoints', 'key_features', 'keyfeatures', 'highlights', 'key_points', 'keypoints'],
    'images': ['images', 'image', 'image_url', 'imageurl', 'picture', 'product_image', 'productimage']
  };
  
  const mappings: FieldMapping[] = [];
  
  // Check each original field against possible standard field
  originalFields.forEach(originalField => {
    const normalizedField = originalField.toLowerCase().replace(/[_\s-]/g, '');
    
    let matched = false;
    Object.entries(fieldVariations).forEach(([standardField, variations]) => {
      // Skip if we already matched this standard field
      if (mappings.some(m => m.standardField === standardField)) {
        return;
      }
      
      // Check if this field matches any variation
      if (variations.includes(normalizedField) || 
          variations.some(v => normalizedField.includes(v)) ||
          normalizedField === standardField.replace('_', '')) {
        mappings.push({
          originalField,
          standardField,
          confidence: variations.includes(normalizedField) ? 0.9 : 0.7
        });
        matched = true;
      }
    });
    
    // If we didn't match, use the original field name
    if (!matched) {
      mappings.push({
        originalField,
        standardField: originalField,
        confidence: 0.5
      });
    }
  });
  
  return mappings;
}

/**
 * Analyze products to detect their type and other attributes
 */
export async function detectProductTypes(products: Product[]): Promise<Record<string, any>> {
  try {
    if (!products || products.length === 0) {
      return { productType: 'unknown', confidence: 0 };
    }
    
    // Select a sample product for analysis
    const sampleProduct = products[0];
    
    // Create a prompt to analyze the product type
    const systemPrompt = `
      You are an expert in product categorization for e-commerce. Your task is to analyze product data 
      and identify the most specific product type or category. Consider all available data including 
      title, description, and any other provided fields.
      
      Respond with a JSON object with the following properties:
      - productType: The most specific product type (e.g., "Bluetooth Headphones" not just "Electronics")
      - confidence: Your confidence in this classification (0-1)
      - suggestedCategory: A hierarchical category path (e.g., "Electronics > Audio > Headphones > Wireless")
      - keyAttributes: List of important attributes for this type of product
      - missingAttributes: Important attributes that are missing from this data
      - enhancementFocus: Areas where AI enhancement would be most valuable
      
      Keep your response concise and limited to these fields.
    `;
    
    const userPrompt = `
      Analyze this product data and determine the specific product type:
      ${JSON.stringify(sampleProduct, null, 2)}
      
      If there are multiple products in the dataset, focus on identifying the common product category.
    `;
    
    // Call the OpenRouter API for analysis
    const openRouterResponse = await callOpenRouterAPI(systemPrompt, userPrompt);
    
    // Extract and parse the JSON response
    return extractJsonResponse(openRouterResponse);
    
  } catch (error) {
    console.error('Error detecting product types:', error);
    return { 
      productType: 'unknown', 
      confidence: 0.5,
      suggestedCategory: 'General Merchandise',
      keyAttributes: ['title', 'description', 'price'],
      missingAttributes: ['brand', 'material', 'dimensions'],
      enhancementFocus: ['title optimization', 'detailed description', 'feature highlights']
    };
  }
}

/**
 * Generate detailed prompts for product enhancement based on the product type
 */
export function generateEnhancementPrompt(productType: string, marketplace: string): string {
  // Base prompt template for all product types
  const basePrompt = `
    You are an expert e-commerce content writer tasked with enhancing product listings for ${marketplace}. 
    The products are in the category of "${productType}".
    
    Create compelling, conversion-optimized content following these guidelines:
    - Write an SEO-optimized product title (max 200 characters for ${marketplace})
    - Create a detailed product description (500-800 words) with paragraphs
    - Generate 5 persuasive bullet points highlighting key features and benefits
    - Ensure all content is factual and based only on the provided product information
    - Use language and formatting appropriate for ${marketplace}
    
    Avoid:
    - Exaggerated claims like "best" or "perfect" unless in original data
    - Mentioning competitors or comparative statements
    - Including pricing information in description or bullet points
    - Using ALL CAPS except for industry acronyms
    
    Respond with a JSON object containing these fields:
    - title: The optimized product title
    - description: The complete product description
    - bullet_points: Array of 5 bullet points
    - suggested_keywords: Array of relevant search keywords
  `;
  
  // Add category-specific instructions
  let categoryPrompt = '';
  
  if (productType.toLowerCase().includes('electronics') || 
      productType.toLowerCase().includes('headphone') || 
      productType.toLowerCase().includes('computer')) {
    categoryPrompt = `
      For electronics products:
      - Highlight technical specifications prominently
      - Mention compatibility with popular devices/systems
      - Emphasize battery life, connectivity, and user experience
      - Include information about warranty if available
      - Use technical terminology appropriately for informed buyers
    `;
  } else if (productType.toLowerCase().includes('clothing') || 
             productType.toLowerCase().includes('apparel') || 
             productType.toLowerCase().includes('fashion')) {
    categoryPrompt = `
      For clothing/apparel products:
      - Emphasize fabric, material, and comfort aspects
      - Describe fit (regular, slim, loose) and sizing guidance
      - Highlight style features, occasions for wear, and versatility
      - Suggest styling options and outfit pairings
      - Include care instructions briefly in the description
    `;
  } else if (productType.toLowerCase().includes('kitchen') || 
             productType.toLowerCase().includes('home') || 
             productType.toLowerCase().includes('furniture')) {
    categoryPrompt = `
      For home/kitchen products:
      - Focus on functionality, convenience, and time-saving features
      - Describe dimensions and space requirements clearly
      - Highlight quality of materials and durability
      - Emphasize ease of cleaning and maintenance
      - Include information about warranty and customer support
    `;
  } else if (productType.toLowerCase().includes('beauty') || 
             productType.toLowerCase().includes('health') || 
             productType.toLowerCase().includes('personal care')) {
    categoryPrompt = `
      For beauty/health products:
      - Focus on benefits rather than just features
      - Highlight key ingredients and their purposes
      - Address specific problems the product solves
      - Include information about application/usage
      - Mention if the product is free from harmful chemicals or allergens
    `;
  }
  
  // Add marketplace-specific optimization tips
  let marketplacePrompt = '';
  
  if (marketplace.toLowerCase() === 'amazon') {
    marketplacePrompt = `
      Amazon-specific optimization:
      - Title should follow pattern: [Brand] + [Feature] + [Product Type] + [Model] + [Size/Quantity]
      - Begin bullet points with capital letters, focus on benefits followed by features
      - Front-load important search keywords in the title and bullet points
      - Prioritize detail and comprehensive information in the description
      - Consider Amazon's search algorithm which prioritizes terms in the title
    `;
  } else if (marketplace.toLowerCase() === 'ebay') {
    marketplacePrompt = `
      eBay-specific optimization:
      - Include specific, relevant keywords in the title (up to 80 characters)
      - Use all available item specifics fields in your response
      - Bullet points should highlight condition, authenticity, and unique selling points
      - Be precise about any defects or imperfections if applicable
      - Focus on detailed item descriptions that reduce potential buyer questions
    `;
  } else if (marketplace.toLowerCase() === 'walmart') {
    marketplacePrompt = `
      Walmart-specific optimization:
      - Keep titles concise but complete (50-75 characters ideal)
      - Ensure primary keywords appear in the first 45 characters of title
      - Use simple, direct language appropriate for Walmart's broad customer base
      - Highlight value proposition and practical benefits
      - Be specific about any warranties or guarantees
    `;
  } else if (marketplace.toLowerCase() === 'shopify') {
    marketplacePrompt = `
      Shopify-specific optimization:
      - Create a compelling, brand-focused title that stands out
      - Craft a narrative-driven description that tells the product's story
      - Highlight your brand's unique selling proposition
      - Focus on creating visually scannable content with subheadings
      - Include information about shipping, returns, and guarantees
    `;
  } else if (marketplace.toLowerCase() === 'etsy') {
    marketplacePrompt = `
      Etsy-specific optimization:
      - Emphasize handmade, vintage, or unique aspects of the product
      - Include production process or materials that make the item special
      - Highlight customization options if available
      - Tell the story behind the product or your brand
      - Use descriptive, artistic language that appeals to Etsy shoppers
    `;
  }
  
  // Combine all prompt components
  return `${basePrompt}\n\n${categoryPrompt}\n\n${marketplacePrompt}`;
}