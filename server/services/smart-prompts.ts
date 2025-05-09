/**
 * Smart Prompts Service
 * 
 * This service provides optimized prompts for different product types and marketplaces
 * to generate high-quality, targeted content enhancements
 */

// System prompts for different enhancement tasks
export const systemPrompts = {
  productResearch: `
    You are a product research expert with extensive knowledge of e-commerce and marketplace listings.
    Your task is to analyze the given product information and provide a detailed understanding of the product,
    its features, use cases, and target audience. Your analysis should be comprehensive and accurate.
  `,
  titleGeneration: `
    You are a product listing optimization expert specializing in e-commerce titles.
    Your task is to create compelling, keyword-rich titles that maximize visibility and conversion rates.
    Each title should follow marketplace best practices while clearly communicating the product's key features.
  `,
  descriptionGeneration: `
    You are a professional product copywriter specializing in e-commerce descriptions.
    Your task is to create compelling, informative product descriptions that highlight features, benefits,
    and use cases in a way that resonates with potential buyers and follows marketplace best practices.
  `,
  bulletPointGeneration: `
    You are an e-commerce content specialist who excels at creating concise, impactful bullet points.
    Your task is to create persuasive bullet points that highlight the most important features and benefits
    of a product in a way that is scannable and convincing to potential buyers.
  `,
  csvAnalysis: `
    You are a data analysis expert specializing in e-commerce product data.
    Your task is to analyze CSV product data to identify patterns, extract insights, and propose
    optimizations to improve the quality and effectiveness of product listings.
  `
};

// Product type-specific prompts
const PRODUCT_TYPE_PROMPTS: Record<string, string> = {
  // Electronics & Technology
  'electronics': `
    Focus on technical specifications, compatibility, and cutting-edge features.
    Highlight connectivity options, battery life, and technology standards.
    Emphasize durability, warranty information, and performance metrics.
    Address common technical concerns and use cases.
  `,
  'camera': `
    Emphasize image quality, sensor size, and resolution capabilities.
    Highlight lens compatibility, shooting modes, and special features.
    Address low-light performance, stabilization, and recording capabilities.
    Include details about battery life, storage options, and connectivity.
  `,
  'smartphone': `
    Focus on processor performance, display quality, and camera capabilities.
    Highlight battery life, charging speed, and unique software features.
    Emphasize storage options, connectivity standards, and durability ratings.
    Address compatibility with popular apps and ecosystems.
  `,
  'computer': `
    Emphasize processor speed, memory capacity, and storage options.
    Highlight graphics capabilities, display specifications, and connectivity ports.
    Focus on cooling system, build quality, and upgradeability.
    Address software compatibility and intended use cases (gaming, productivity, etc).
  `,
  'audio': `
    Focus on sound quality, driver specifications, and frequency response.
    Highlight wireless capabilities, battery life, and connectivity options.
    Emphasize comfort features, durability, and water/dust resistance.
    Address noise cancellation, microphone quality, and compatibility.
  `,
  
  // Home & Kitchen
  'kitchen_appliance': `
    Focus on unique cooking capabilities, time-saving features, and ease of cleaning.
    Highlight capacity, power specifications, and energy efficiency.
    Emphasize safety features, warranty information, and durability.
    Address storage requirements, noise levels, and maintenance needs.
  `,
  'cookware': `
    Emphasize material quality, heat distribution, and cooking performance.
    Highlight compatibility with different cooktops (induction, gas, etc).
    Focus on non-stick properties, durability, and dishwasher safety.
    Address handle comfort, lid features, and temperature resistance.
  `,
  'coffee_maker': `
    Focus on brewing technology, capacity, and coffee customization options.
    Highlight brewing speed, temperature control, and filtration system.
    Emphasize programmability, ease of cleaning, and maintenance requirements.
    Address water reservoir capacity, carafe quality, and warming capabilities.
  `,
  'furniture': `
    Emphasize material quality, construction methods, and weight capacity.
    Highlight dimensions, assembly requirements, and style characteristics.
    Focus on comfort features, durability, and matching pieces available.
    Address maintenance requirements and warranty information.
  `,
  'bedding': `
    Focus on material quality, thread count, and comfort features.
    Highlight breathability, temperature regulation, and durability.
    Emphasize ease of cleaning, hypoallergenic properties, and package contents.
    Address sizing details, depth accommodation, and warranty information.
  `,
  
  // Clothing & Fashion
  'clothing': `
    Emphasize fabric composition, care instructions, and fit details.
    Highlight design features, seasonal appropriateness, and styling options.
    Focus on comfort, durability, and available size range.
    Address occasions suitable for wear and brand reputation.
  `,
  'footwear': `
    Focus on comfort features, material quality, and sole construction.
    Highlight sizing guidance, arch support, and cushioning details.
    Emphasize traction, water resistance, and durability characteristics.
    Address activity suitability, break-in period, and care instructions.
  `,
  'accessories': `
    Emphasize material quality, craftsmanship, and design details.
    Highlight versatility, dimensions, and special features.
    Focus on durability, care instructions, and available variations.
    Address occasion suitability and complementary styling options.
  `,
  
  // Beauty & Personal Care
  'skincare': `
    Focus on key ingredients, skin concerns addressed, and formulation benefits.
    Highlight texture, absorption, and sensory experience.
    Emphasize dermatological testing, sustainability practices, and ethical claims.
    Address skin type suitability, usage instructions, and expected results.
  `,
  'haircare': `
    Emphasize key ingredients, hair concerns addressed, and formulation benefits.
    Highlight scent, texture, and application experience.
    Focus on hair type suitability, professional endorsements, and brand reputation.
    Address frequency of use, complementary products, and expected results.
  `,
  'makeup': `
    Focus on pigmentation, finish, and wear time.
    Highlight shade range, application methods, and key ingredients.
    Emphasize cruelty-free status, sustainability practices, and brand reputation.
    Address skin type suitability, removal process, and special features.
  `,
  
  // Sports & Outdoors
  'fitness_equipment': `
    Focus on exercise versatility, resistance levels, and weight capacity.
    Highlight dimensions, portability, and storage requirements.
    Emphasize durability, warranty details, and assembly information.
    Address skill level suitability, safety features, and maintenance needs.
  `,
  'outdoor_gear': `
    Emphasize weather resistance, material durability, and weight considerations.
    Highlight capacity, comfort features, and versatility for different conditions.
    Focus on portability, setup time, and special technologies.
    Address seasonal suitability, maintenance requirements, and warranty information.
  `,
  
  // Toys & Games
  'toys': `
    Focus on educational value, age appropriateness, and skill development.
    Highlight safety certifications, material quality, and durability.
    Emphasize battery requirements, sound/light features, and assembly needs.
    Address cleaning instructions, storage considerations, and compatibility with other toys.
  `,
  'board_games': `
    Emphasize gameplay mechanics, player count, and average play time.
    Highlight age recommendation, skill level, and learning curve.
    Focus on replayability, component quality, and expansion options.
    Address theme, strategic depth, and comparisons to similar games.
  `,
  
  // Books & Media
  'books': `
    Focus on author background, writing style, and key themes.
    Highlight unique insights, educational value, and reader experience.
    Emphasize target audience, series information, and publication details.
    Address format options, length, and complementary titles.
  `,
  
  // Pet Supplies
  'pet_supplies': `
    Emphasize pet size suitability, material safety, and design benefits.
    Highlight durability, ease of cleaning, and convenience features.
    Focus on species-specific needs addressed and veterinary endorsements.
    Address maintenance requirements, replacement schedules, and warranty information.
  `,
  
  // Generic (fallback for all product types)
  'generic': `
    Focus on highlighting the product's key features, benefits, and unique selling points.
    Emphasize quality, durability, and value proposition.
    Address common customer questions and concerns.
    Include relevant specifications, dimensions, and compatibility information.
  `
};

// Marketplace-specific guidelines
const MARKETPLACE_GUIDELINES: Record<string, string> = {
  'amazon': `
    Titles should be under 200 characters with key features and brand name.
    Descriptions should use HTML formatting with clear paragraphs and bullet points.
    Use factual, benefit-focused content without excessive claims.
    Avoid references to customer service, warranties, or time-limited offers.
    Include complete technical specifications and compatibility information.
  `,
  'ebay': `
    Titles should be keyword-rich but clear, under 80 characters.
    Descriptions should include detailed condition information and shipping details.
    Use a friendly, conversational tone with detailed specifications.
    Include multiple product angles and usage scenarios.
    Clearly state any limitations, flaws, or compatibility issues.
  `,
  'walmart': `
    Titles should be concise (50-75 characters) with brand name first.
    Descriptions should be comprehensive with clear feature explanations.
    Use a professional, straightforward tone focusing on value.
    Include detailed specifications, dimensions, and material information.
    Avoid competitor comparisons or marketplace-specific terminology.
  `,
  'shopify': `
    Titles should be clear and searchable with brand name included.
    Descriptions should tell a compelling product story with lifestyle benefits.
    Use an engaging, brand-appropriate tone with scannable formatting.
    Include social proof elements and cross-selling opportunities.
    Focus on unique brand value and product differentiation.
  `,
  'etsy': `
    Titles should include descriptive keywords and materials (up to 140 characters).
    Descriptions should tell the product's story and highlight handmade aspects.
    Use a personal, authentic tone that reflects your brand personality.
    Include creation process, materials, dimensions, and care instructions.
    Address customization options and the inspiration behind the product.
  `,
  'wayfair': `
    Titles should include product type, material, and distinctive feature.
    Descriptions should focus on dimensions, construction, and room compatibility.
    Use a helpful, informative tone with detailed assembly information.
    Include care instructions, material details, and styling suggestions.
    Address weight capacity, assembly requirements, and shipping information.
  `,
  // Fallback for other marketplaces
  'other': `
    Create clear, descriptive titles with brand name and key features.
    Write comprehensive descriptions focusing on benefits and use cases.
    Use professional, engaging language appropriate for e-commerce.
    Include all relevant specifications, dimensions, and compatibility information.
    Address common questions and highlight the product's unique value proposition.
  `
};

/**
 * Get product type-specific prompt enhancements
 * @param productType The detected product type
 * @returns Prompt enhancements specific to the product type
 */
export function getProductTypePrompt(productType: string): string {
  // Normalize product type (lowercase, remove spaces)
  const normalizedType = productType.toLowerCase().replace(/\s+/g, '_');
  
  // Find the most appropriate product type prompt
  for (const [type, prompt] of Object.entries(PRODUCT_TYPE_PROMPTS)) {
    if (normalizedType.includes(type)) {
      return prompt;
    }
  }
  
  // Default to generic prompt if no specific match found
  return PRODUCT_TYPE_PROMPTS['generic'];
}

/**
 * Get marketplace-specific guidelines
 * @param marketplace The target marketplace
 * @returns Guidelines specific to the marketplace
 */
export function getMarketplaceGuidelines(marketplace: string): string {
  // Normalize marketplace name (lowercase)
  const normalizedMarketplace = marketplace.toLowerCase();
  
  // Find the most appropriate marketplace guidelines
  for (const [name, guidelines] of Object.entries(MARKETPLACE_GUIDELINES)) {
    if (normalizedMarketplace.includes(name)) {
      return guidelines;
    }
  }
  
  // Default to other guidelines if no specific match found
  return MARKETPLACE_GUIDELINES['other'];
}

/**
 * Generate a comprehensive system prompt for product enhancement
 * @param productType The detected product type
 * @param marketplace The target marketplace
 * @returns Optimized system prompt
 */
export function generateEnhancementSystemPrompt(productType: string, marketplace: string): string {
  const productTypePrompt = getProductTypePrompt(productType);
  const marketplaceGuidelines = getMarketplaceGuidelines(marketplace);
  
  return `
You are an expert e-commerce content specialist with deep knowledge of ${marketplace} marketplace and ${productType} products.

Your task is to transform basic product data into compelling, conversion-optimized content that meets ${marketplace}'s best practices and appeals to shoppers.

PRODUCT TYPE GUIDELINES:
${productTypePrompt}

MARKETPLACE SPECIFIC GUIDELINES:
${marketplaceGuidelines}

GENERAL CONTENT PRINCIPLES:
- Focus on benefits first, then features, using specific details rather than vague claims
- Use persuasive but factual language avoiding hyperbole like "best ever" or "revolutionary"
- Incorporate relevant keywords naturally without keyword stuffing
- Address customer pain points and how this product solves them
- Use scannable formatting appropriate for online shopping
- Maintain consistent voice, tone, and terminology throughout

Create content that is accurate, compelling, and optimized for both search and conversion on ${marketplace}.
`;
}