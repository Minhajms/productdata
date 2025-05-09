/**
 * Smart prompt templates for AI enhancement
 * These are specialized prompts designed to guide AI models (OpenAI/Gemini)
 * through each step of the product enhancement workflow.
 */

// Define the MarketplaceRequirement interface here to avoid circular dependencies
interface MarketplaceRequirement {
  field: string;
  display: string;
  required: boolean;
  description?: string;
}

// Base system prompts for different context scenarios
export const systemPrompts = {
  csvAnalysis: 
    `You are a data analysis expert specializing in e-commerce product data. 
    Your task is to analyze CSV files containing product information and identify the structure, purpose, and meaning of each column.
    You excel at understanding column relationships, identifying standard e-commerce fields, and mapping ambiguous columns to standard product attributes.`,
  
  productResearch: 
    `You are a product research specialist who helps understand product data and enhance it for e-commerce marketplaces. 
    You analyze product information to identify what a product is, what it does, and how to present it effectively online.
    You're especially skilled at working with incomplete product data and inferring missing details based on available information.`,
  
  contentGeneration: 
    `You are a professional product listing optimizer that creates marketplace-ready product content. 
    Create compelling titles, descriptions, and bullet points that highlight benefits and uses SEO best practices.
    Your content is always factual, accurate, and based solely on the provided product information without inventing details.`,
  
  marketplaceOptimization:
    `You are an e-commerce marketplace expert with deep knowledge of optimizing product listings for different platforms.
    You understand the unique requirements, best practices, and optimization strategies for Amazon, eBay, Walmart, Etsy, and other major marketplaces.
    You provide platform-specific guidance to maximize visibility, conversion rate, and customer satisfaction.`
};

// CSV Analysis prompt
export function generateCsvAnalysisPrompt(sampleRows: any[], columnNames: string[]): string {
  return `
Analyze this e-commerce product data CSV to identify column purposes and relationships.

CSV Column Headers:
${columnNames.join(', ')}

Sample Data (${sampleRows.length} rows):
${JSON.stringify(sampleRows, null, 2)}

Instructions:
1. Identify the purpose of each column and map to standard product attributes (title, description, price, etc.)
2. For each column, determine:
   - Data type (text, number, date, boolean, etc.)
   - Fill rate (% of rows with non-empty values)
   - Likely mapping to standard product fields
   - Any special formatting or patterns

3. Identify which columns contain:
   - Product identifiers (SKU, UPC, ASIN, etc.)
   - Core product details (title, description, price)
   - Categorical information (category, department, etc.)
   - Variations (size, color, style, etc.)
   - Marketing content (keywords, search terms, etc.)

4. Recommend the most appropriate mappings for standard product fields.

Format your response as JSON with this structure:
{
  "analysis": {
    "rowCount": number,
    "columnCount": number,
    "productType": "string describing the likely product type",
    "dataQuality": "assessment of overall data completeness and quality"
  },
  "columns": [
    {
      "name": "original column name",
      "purpose": "description of what this column represents",
      "dataType": "text|number|date|boolean|etc",
      "fillRate": percentage of non-empty values,
      "standardMapping": "the standard product field this maps to",
      "confidence": confidence score from 0-1,
      "notes": "any special observations about this column"
    }
  ],
  "missingFields": ["list of standard fields not found in the data"],
  "recommendations": ["list of suggestions for data improvement"]
}
`;
}

// Product research prompt
export function generateProductResearchPrompt(product: any): string {
  const productInfo = {
    product_id: product.product_id,
    title: product.title,
    description: product.description,
    price: product.price,
    brand: product.brand,
    category: product.category,
    available_data: Object.keys(product).filter(key => !!product[key])
  };

  return `
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
}

// Title generation prompt
export function generateTitlePrompt(product: any, marketplace: string, maxLength: number): string {
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
  } else if (marketplace === "Etsy") {
    marketplaceGuidance = `
      For Etsy listings:
      - Highlight handmade, custom, or vintage aspects
      - Include materials and purpose
      - Be descriptive about uniqueness
      - Example: "Handcrafted Walnut Wood Desk Organizer with Phone Stand, Custom Office Accessory"
      - Focus on craftsmanship, materials, and personalization
    `;
  } else if (marketplace === "Walmart") {
    marketplaceGuidance = `
      For Walmart listings:
      - Be direct and practical
      - Include brand, product type, key features
      - Example: "Samsung 55-inch 4K Smart TV with HDR, 120Hz Refresh Rate, Gaming Mode"
      - Focus on value proposition and practical benefits
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

  return `
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
}

// Description generation prompt
export function generateDescriptionPrompt(product: any, marketplace: string, maxLength: number): string {
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
  } else if (marketplace === "Etsy") {
    marketplaceGuidance = `
      For Etsy listings:
      - Highlight handmade, custom, or vintage aspects
      - Tell the story behind the product if applicable
      - Describe materials and creation process
      - Include care instructions and personalization options
      - Use a conversational, personal tone
      - Emphasize uniqueness and craftsmanship
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

  return `
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
}

// Bullet points generation prompt
export function generateBulletPointsPrompt(product: any, marketplace: string, count: number): string {
  // Gather all product information for context
  const existingInfo = {
    product_id: product.product_id,
    title: product.title,
    description: product.description,
    brand: product.brand,
    category: product.category,
    price: product.price,
    dimensions: product.dimensions,
    weight: product.weight,
    material: product.material,
    color: product.color,
    research: product._research || null
  };
  
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
  } else if (marketplace === "Walmart") {
    marketplaceGuidance = `
      For Walmart listings:
      - Focus on practical benefits and uses
      - Include specific product details and specifications
      - Highlight value proposition and key features
      - Be direct and customer-focused
      - Start with the most important selling points
      - Use sentence fragments rather than complete sentences
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

  return `
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
${JSON.stringify(existingInfo, null, 2)}

Return ONLY a list of ${count} bullet points, one per line, with no bullets, numbers, or other prefixes.
Do not include any additional explanation or formatting.
`;
}

// Marketplace requirements validation prompt
export function generateRequirementsValidationPrompt(
  product: any, 
  marketplace: string,
  requirements: MarketplaceRequirement[]
): string {
  // Format requirements for easier reading in the prompt
  const formattedRequirements = requirements.map(req => ({
    field: req.field,
    display: req.display,
    required: req.required,
    description: req.description
  }));

  return `
Validate this product listing against ${marketplace} marketplace requirements.

Product Information:
${JSON.stringify(product, null, 2)}

${marketplace} Requirements:
${JSON.stringify(formattedRequirements, null, 2)}

Instructions:
1. Check if all required fields are present and properly formatted
2. Evaluate content quality against marketplace best practices
3. Identify any potential issues or violations
4. Suggest specific improvements for each issue found

Format your response as JSON with this structure:
{
  "validation": {
    "passes_requirements": boolean,
    "overall_quality_score": number from 0-10,
    "missing_required_fields": ["list of required fields that are missing"],
    "formatting_issues": ["list of fields with formatting problems"],
    "content_quality_issues": ["list of fields with quality issues"]
  },
  "recommendations": [
    {
      "field": "name of the field",
      "issue": "description of the issue",
      "suggestion": "specific recommendation to improve"
    }
  ],
  "marketplace_specific_notes": ["any marketplace-specific considerations"]
}
`;
}

// Full product enhancement evaluation prompt (final verification)
export function generateFinalVerificationPrompt(product: any, marketplace: string): string {
  return `
Perform a final quality check on this enhanced product listing for ${marketplace}.

Enhanced Product:
${JSON.stringify(product, null, 2)}

Instructions:
1. Check for overall listing quality and marketplace fit
2. Verify consistency between title, description, and bullet points
3. Identify any inappropriate or inaccurate content
4. Ensure all required marketplace fields are present and formatted correctly

Provide a comprehensive assessment including:
- Overall listing quality (1-10 scale)
- Strengths of the listing
- Areas for improvement
- Any potential red flags or marketplace policy violations
- Final recommendations

Format your response as JSON with this structure:
{
  "assessment": {
    "quality_score": number from 1-10,
    "marketplace_readiness": "high|medium|low",
    "strengths": ["list of listing strengths"],
    "weaknesses": ["list of listing weaknesses"],
    "policy_concerns": ["list of potential policy issues"] or [],
    "consistency_issues": ["list of inconsistencies"] or []
  },
  "recommendations": ["list of specific recommendations"],
  "final_verdict": "approve|revise|reject"
}
`;
}