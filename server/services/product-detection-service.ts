import { Product } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Analyzes product data to detect product types and suggest enhancements
 * @param products List of products to analyze
 * @returns Analysis results with product types and enhancement suggestions
 */
export async function analyzeProductTypes(products: Product[]): Promise<{
  productTypes: string[];
  enhancementSuggestions: string[];
  commonMissingFields: { field: string; percentage: number }[];
}> {
  if (!products || products.length === 0) {
    return {
      productTypes: [],
      enhancementSuggestions: [],
      commonMissingFields: []
    };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("No OpenAI API key found for product type detection");
      // Fallback to basic analysis without AI
      return fallbackProductAnalysis(products);
    }

    // Get a sample of products (max 10) to keep response size manageable
    const sampleProducts = products.slice(0, 10);
    
    // Generate JSON prompt for OpenAI
    const prompt = `
      Analyze the following product data to:
      1. Identify the main product types/categories represented
      2. Suggest specific enhancements that would improve the product listings 
      3. Identify the most commonly missing or incomplete fields
      
      Products:
      ${JSON.stringify(sampleProducts, null, 2)}
      
      Provide your analysis in JSON format with these fields:
      - productTypes: Array of product type/category names
      - enhancementSuggestions: Array of specific suggestions for improving these product listings
      - commonMissingFields: Array of objects containing {field: string, percentage: number} representing fields that are often missing or incomplete
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a product data analysis expert that helps e-commerce sellers improve their product listings."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1024
    });

    // Parse and return the analysis results
    const analysisResults = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      productTypes: analysisResults.productTypes || [],
      enhancementSuggestions: analysisResults.enhancementSuggestions || [],
      commonMissingFields: analysisResults.commonMissingFields || []
    };
  } catch (error) {
    console.error("Error analyzing product types:", error);
    return fallbackProductAnalysis(products);
  }
}

/**
 * Fallback method when AI analysis is not available
 * @param products List of products to analyze
 * @returns Basic analysis results
 */
function fallbackProductAnalysis(products: Product[]): {
  productTypes: string[];
  enhancementSuggestions: string[];
  commonMissingFields: { field: string; percentage: number }[];
} {
  // Count categories to determine product types
  const categoryCount: Record<string, number> = {};
  
  // Track missing fields
  const missingFieldsCount: Record<string, number> = {
    title: 0,
    description: 0,
    price: 0,
    brand: 0,
    category: 0,
    images: 0
  };
  
  // Analyze each product
  products.forEach(product => {
    // Count categories
    if (product.category) {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    }
    
    // Check for missing fields
    if (!product.title || product.title.trim() === '') missingFieldsCount.title++;
    if (!product.description || product.description.trim() === '') missingFieldsCount.description++;
    if (!product.price) missingFieldsCount.price++;
    if (!product.brand || product.brand.trim() === '') missingFieldsCount.brand++;
    if (!product.category || product.category.trim() === '') missingFieldsCount.category++;
    if (!product.images || product.images.length === 0) missingFieldsCount.images++;
  });
  
  // Get top categories
  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category);
  
  // Calculate missing field percentages
  const totalProducts = products.length;
  const missingFieldsPercentage = Object.entries(missingFieldsCount)
    .map(([field, count]) => ({
      field,
      percentage: Math.round((count / totalProducts) * 100)
    }))
    .filter(item => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);
  
  // Generate generic enhancement suggestions
  const suggestions = [
    "Add more descriptive product titles with key features and benefits",
    "Include high-quality product images from multiple angles",
    "Write detailed descriptions that highlight unique selling points",
    "Ensure all products have accurate pricing information",
    "Add bullet points highlighting key product features"
  ];
  
  return {
    productTypes: sortedCategories.length > 0 ? sortedCategories : ["Uncategorized Products"],
    enhancementSuggestions: suggestions,
    commonMissingFields: missingFieldsPercentage
  };
}