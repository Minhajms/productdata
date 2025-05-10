/**
 * Marketplace-Optimized Prompts
 * 
 * This file contains high-quality prompts optimized for e-commerce marketplace listings.
 * These prompts are designed to generate content that doesn't look AI-generated and
 * meets specific marketplace requirements.
 */

/**
 * Prompt templates for various content generation tasks
 */
export const marketplacePrompts = {
  /**
   * Product type detection prompt - identifies specific product type, category, and attributes
   */
  productTypeDetection: `
As an expert retail product analyst, analyze this product CSV data:
{sample_data}

Identify the specific product type, category, and any relevant attributes. Focus on understanding what this product actually is, not just broad categories.

Return your analysis in this JSON format:
{
  "product_type": "specific product type (e.g., 'bluetooth headphones' not just 'electronics')",
  "category": "primary marketplace category",
  "subcategory": "appropriate subcategory",
  "target_audience": "likely target customer",
  "price_tier": "budget/mid-range/premium/luxury",
  "key_features": ["list", "of", "notable", "product", "features"],
  "confidence_score": 0.0 to 1.0
}

Be specific and precise in your identification. If you're uncertain, indicate this in your confidence score.
`,

  /**
   * Product description generation prompt - creates compelling, conversion-focused descriptions
   */
  productDescription: `
You are an experienced e-commerce copywriter who specializes in writing product descriptions that convert. Create a compelling product description for this {product_type}. 

Product Details:
{product_details}

Your description should:
1. Lead with a strong value proposition or key benefit
2. Use natural, conversational language (avoid robotic-sounding text)
3. Include specific, factual details about the product's features and benefits
4. Target a {target_audience} audience in a {price_tier} market segment
5. Be 150-200 words in length with short, scannable paragraphs
6. Avoid vague claims, superlatives without evidence, and marketing clichés
7. Include words that would help this rank well in marketplace search results
8. Vary sentence structure with a mix of short and medium sentences

Do NOT:
- Use phrases like "this product" or "this item"
- Include placeholders or template-like language
- Create an obviously formatted, bullet-pointed list
- Mention pricing or shipping information
- Include excessive adjectives or flowery language

The description should sound like it was written by a human product expert who understands the customer's needs.
`,

  /**
   * Product title optimization prompt - creates SEO-friendly, marketplace-compliant titles
   */
  productTitle: `
As an SEO specialist for {marketplace_name}, create 1-3 optimized product titles for this {product_type}.

Product Details:
{product_details}

Your titles should:
1. Follow {marketplace_name}'s exact character limits ({character_limit} characters max)
2. Place the most important keywords at the beginning
3. Include the brand name, key product type, and 2-3 distinguishing features
4. Be easy to read and not keyword-stuffed
5. Match how real customers search for this type of product
6. Follow a natural language pattern used by top-selling listings

For Amazon: Format like "Brand + Model + Product Type + Key Features"
For Shopify: Format like "Key Feature + Product Type + Brand"
For Etsy: Format like "Descriptive Adjective + Product Type + Unique Selling Point"

Do NOT:
- Use ALL CAPS (except for established acronyms like "USB")
- Include promotional phrases like "Sale" or "Free Shipping"
- Add unnecessary punctuation or symbols
- Repeat the same keywords multiple times

Return JSON format:
{
  "titles": [
    "Title Option 1",
    "Title Option 2",
    "Title Option 3"
  ],
  "reasoning": "Brief explanation of keyword strategy used"
}
`,

  /**
   * Bullet points generation prompt - creates persuasive feature/benefit highlights
   */
  bulletPoints: `
As a product marketer for {marketplace_name}, create 5 persuasive bullet points highlighting the key features and benefits of this {product_type}.

Product Details:
{product_details}

For each bullet point:
1. Lead with a clear, specific benefit to the customer
2. Follow with the feature that delivers that benefit
3. Include specific measurements, materials, or specifications when relevant
4. Keep each bullet point under 200 characters
5. Ensure all bullets together tell a complete story of the product's value
6. Use varied sentence structures that don't follow an obvious pattern

For Amazon: Start each with a capitalized phrase highlighting a benefit
For Shopify: Use a more conversational tone focusing on lifestyle benefits
For Etsy: Emphasize unique, handmade, or customizable aspects when applicable

Avoid:
- Generic statements that could apply to any product
- Repeating information already in the title
- Making unverifiable claims or exaggerations
- Using the same sentence structure for each bullet point
- Creating bullets that obviously follow a template

Format as a JSON array:
{
  "bullet_points": [
    "First bullet point about primary benefit...",
    "Second bullet point about another key feature...",
    "Third bullet point focusing on quality/durability...",
    "Fourth bullet point addressing common customer concern...",
    "Fifth bullet point with unique selling proposition..."
  ]
}
`,

  /**
   * SEO keywords generation prompt - creates strategic keyword sets for marketplace search
   */
  seoKeywords: `
As an e-commerce SEO expert for {marketplace_name}, analyze this product and generate optimal search keywords.

Product Details:
{product_details}

Generate three tiers of keywords:
1. Primary (3-5): High-volume, direct product match keywords that shoppers would use to find exactly this product
2. Secondary (5-8): Related terms, features, use cases, and variations with good search volume
3. Long-tail (5-8): Specific, niche phrases with buyer intent that have less competition

Consider:
- Actual search behavior on {marketplace_name} (not just general SEO principles)
- Seasonal or trending terms relevant to this product category
- Specific feature-based terms that differentiate this product
- Problem-solution phrasing that shoppers might use
- Competitor keyword analysis based on similar products

Do NOT:
- Include irrelevant keywords just because they have high volume
- Use identical keywords with slight word order changes
- Suggest terms that violate marketplace policies
- Include competitor brand names unless truly relevant

Return in JSON format:
{
  "primary_keywords": ["keyword1", "keyword2", "keyword3"],
  "secondary_keywords": ["keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "long_tail_keywords": ["specific phrase 1", "specific phrase 2", "specific phrase 3", "specific phrase 4", "specific phrase 5"]
}
`,

  /**
   * Category suggestion prompt - determines the optimal marketplace category placement
   */
  categorySuggestion: `
As a marketplace category specialist, determine the optimal category path for this product on {marketplace_name}.

Product Details:
{product_details}

Analyze this product and:
1. Identify the most specific category where this product belongs
2. Provide the complete category path from top-level to most specific subcategory
3. Suggest 1-2 alternative category paths if appropriate
4. Explain why this category placement maximizes visibility

For Amazon: Use the exact browse node names and follow their hierarchical structure
For Shopify: Suggest a primary category and any relevant collections
For Etsy: Follow their category system with appropriate subcategories

Your response should be marketplace-specific and follow the exact category naming conventions used on the platform.

Return as JSON:
{
  "primary_category_path": ["Level 1", "Level 2", "Level 3", "Level 4"],
  "category_id": "specific ID if known",
  "alternative_paths": [
    ["Alt Path 1 Level 1", "Alt Path 1 Level 2", "Alt Path 1 Level 3"],
    ["Alt Path 2 Level 1", "Alt Path 2 Level 2", "Alt Path 2 Level 3"]
  ],
  "reasoning": "Brief explanation for category selection"
}
`,

  /**
   * Brand suggestion prompt - generates appropriate brand names for products without brand info
   */
  brandSuggestion: `
As a branding expert for {product_type} products, suggest 3-5 appropriate brand names for this product.

Product Details:
{product_details}

The brand names should:
1. Be appropriate for the product type and quality level
2. Sound like real, established brands in this product category
3. Be legally safe (avoid similarity to well-known trademarked names)
4. Be memorable and easy to pronounce
5. Reflect the product's key attributes or value proposition
6. Consider the target market and price positioning

For each suggestion, provide:
- The brand name
- A brief rationale for why it fits this product
- A confidence score (1-10) on its appropriateness

Return in JSON format:
{
  "brand_suggestions": [
    {
      "name": "Brand Name 1",
      "rationale": "Brief explanation",
      "confidence": 8
    },
    {
      "name": "Brand Name 2",
      "rationale": "Brief explanation",
      "confidence": 7
    }
  ],
  "recommended_brand": "Most appropriate name from the list"
}
`,

  /**
   * CSV field mapping prompt - identifies the meaning and proper mapping of CSV columns
   */
  csvFieldMapping: `
As a data analyst specializing in e-commerce product data, analyze these CSV column headers and sample values to determine their proper field mappings.

CSV Headers and Sample Values:
{headers_and_samples}

Analyze each column and determine:
1. What standard product data field it most likely represents
2. How confident you are in this mapping (scale of 0-1)
3. Any special processing or normalization needed for this field

Map to these standard fields whenever possible:
- product_id: A unique identifier for the product
- title: The product's main title/name
- description: Detailed product description
- price: The product's price (numeric value)
- brand: The manufacturer or brand name
- category: Product category or department
- bullet_points: Key features or selling points
- images: Image URLs or identifiers
- asin: Amazon Standard Identification Number
- sku: Stock Keeping Unit
- upc: Universal Product Code
- dimensions: Product size/measurements
- weight: Product weight
- color: Color option
- size: Size option

Return a JSON object with mappings:
{
  "column_mappings": [
    {
      "original_column": "CSV column name",
      "standard_field": "One of the standard fields listed above",
      "confidence": 0.0-1.0,
      "notes": "Any special considerations"
    }
  ]
}
`
};

/**
 * Generate a product type detection prompt with actual data
 * @param sampleProducts Sample product data to analyze
 * @returns Formatted prompt
 */
export function generateProductTypeDetectionPrompt(sampleProducts: any[]): string {
  return marketplacePrompts.productTypeDetection.replace(
    '{sample_data}',
    JSON.stringify(sampleProducts, null, 2)
  );
}

/**
 * Generate a product description prompt with product details and target info
 * @param product Product data
 * @param productType Identified product type
 * @param targetAudience Target customer demographic
 * @param priceTier Price positioning (budget/mid-range/premium/luxury)
 * @returns Formatted prompt
 */
export function generateProductDescriptionPrompt(
  product: any,
  productType: string,
  targetAudience: string = "general consumers",
  priceTier: string = "mid-range"
): string {
  return marketplacePrompts.productDescription
    .replace('{product_type}', productType)
    .replace('{product_details}', JSON.stringify(product, null, 2))
    .replace('{target_audience}', targetAudience)
    .replace('{price_tier}', priceTier);
}

/**
 * Generate a product title optimization prompt
 * @param product Product data
 * @param productType Identified product type
 * @param marketplace Target marketplace (Amazon, eBay, etc.)
 * @param characterLimit Maximum title length
 * @returns Formatted prompt
 */
export function generateProductTitlePrompt(
  product: any,
  productType: string,
  marketplace: string = "Amazon",
  characterLimit: number = 200
): string {
  return marketplacePrompts.productTitle
    .replace('{product_type}', productType)
    .replace('{product_details}', JSON.stringify(product, null, 2))
    .replace('{marketplace_name}', marketplace)
    .replace('{character_limit}', characterLimit.toString());
}

/**
 * Generate a bullet points creation prompt
 * @param product Product data
 * @param productType Identified product type
 * @param marketplace Target marketplace
 * @returns Formatted prompt
 */
export function generateBulletPointsPrompt(
  product: any,
  productType: string,
  marketplace: string = "Amazon"
): string {
  return marketplacePrompts.bulletPoints
    .replace('{product_type}', productType)
    .replace('{product_details}', JSON.stringify(product, null, 2))
    .replace('{marketplace_name}', marketplace);
}

/**
 * Generate a brand suggestion prompt
 * @param product Product data
 * @param productType Identified product type
 * @returns Formatted prompt
 */
export function generateBrandSuggestionPrompt(
  product: any,
  productType: string
): string {
  return marketplacePrompts.brandSuggestion
    .replace('{product_type}', productType)
    .replace('{product_details}', JSON.stringify(product, null, 2));
}

/**
 * Generate a CSV field mapping analysis prompt
 * @param headers CSV column headers
 * @param sampleRows Sample data rows
 * @returns Formatted prompt
 */
export function generateCSVFieldMappingPrompt(
  headers: string[],
  sampleRows: any[]
): string {
  // Format headers and samples for prompt
  const headersAndSamples = headers.map(header => {
    const samples = sampleRows.map(row => row[header]).filter(Boolean).slice(0, 3);
    return `${header}: ${samples.join(' | ')}`;
  }).join('\n');

  return marketplacePrompts.csvFieldMapping
    .replace('{headers_and_samples}', headersAndSamples);
}