import { Product } from "@shared/schema";
import { getMarketplaceRequirements, getMissingFields } from "../../client/src/lib/marketplace-requirements";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Enhances product data using the OpenAI API
 * @param products List of products to enhance
 * @param marketplace Target marketplace (e.g., "Amazon", "eBay")
 * @returns Enhanced product data
 */
export async function enhanceProductDataWithOpenAI(products: any[], marketplace: string): Promise<Product[]> {
  const enhancedProducts: Product[] = [];
  const apiKey = process.env.OPENAI_API_KEY || "";
  
  if (!apiKey) {
    console.error("Missing OpenAI API key");
    throw new Error("Missing OpenAI API key. Please set the OPENAI_API_KEY environment variable.");
  }
  
  const marketplaceConfig = getMarketplaceRequirements(marketplace);
  let quotaExceededError = false;
  
  for (const product of products) {
    try {
      // If we've already hit the quota limit, use fallback directly without attempting API calls
      if (quotaExceededError) {
        console.log(`Using fallback generation for product ${product.product_id} due to previous quota error`);
        const enhancedProduct = generateFallbackProduct(product, marketplace, marketplaceConfig);
        enhancedProducts.push(enhancedProduct);
        continue;
      }
      
      // Get missing fields for this product
      const missingFields = getMissingFields(product, marketplace);
      
      if (missingFields.length === 0) {
        // No missing fields, no enhancement needed
        enhancedProducts.push(product);
        continue;
      }
      
      // Research the product if it's missing significant information
      // This helps generate better titles, descriptions and bullet points
      let productResearch = null;
      const significantFieldsMissing = missingFields.some(field => 
        ['title', 'description', 'bullet_points', 'category'].includes(field.toLowerCase().replace(/\s+/g, '_'))
      );
      
      if (significantFieldsMissing) {
        try {
          productResearch = await researchProduct(product);
          console.log(`Product research completed for ${product.product_id}:`, 
            productResearch ? productResearch.product_type : 'No research data'
          );
        } catch (researchError) {
          console.warn(`Error researching product ${product.product_id}:`, researchError);
          // Continue even if research fails
        }
      }
      
      // Clone the product to avoid modifying the original
      const enhancedProduct = { ...product };
      
      // Apply product research insights if available
      if (productResearch) {
        // If we don't have a category yet, use the researched product type
        if (!enhancedProduct.category && productResearch.product_type) {
          enhancedProduct.category = productResearch.product_type;
        }
      }
      
      // Process each missing field
      for (const field of missingFields) {
        const normalizedField = field.toLowerCase().replace(/\s+/g, '_');
        
        try {
          // Generate content based on field type
          if (normalizedField === 'title') {
            enhancedProduct.title = await generateTitleWithOpenAI(
              product, 
              marketplace, 
              marketplaceConfig.formatGuidelines.title?.maxLength || 200
            );
          } else if (normalizedField === 'description') {
            enhancedProduct.description = await generateDescriptionWithOpenAI(
              product, 
              marketplace,
              marketplaceConfig.formatGuidelines.description?.maxLength || 2000
            );
          } else if (normalizedField === 'bullet_points') {
            enhancedProduct.bullet_points = await generateBulletPointsWithOpenAI(
              product, 
              marketplace,
              marketplaceConfig.formatGuidelines.bullet_points?.count || 5
            );
          } else if (normalizedField === 'brand' && !product.brand) {
            enhancedProduct.brand = await suggestBrandWithOpenAI(product);
          } else if (normalizedField === 'category' && !product.category) {
            enhancedProduct.category = await suggestCategoryWithOpenAI(product, marketplace);
          } else if (normalizedField === 'asin' && marketplace === 'Amazon' && !product.asin) {
            enhancedProduct.asin = generateRandomASIN();
          }
        } catch (fieldError: any) {
          // Check if it's a quota exceeded error
          if (fieldError.status === 429 || (fieldError.error && fieldError.error.type === 'insufficient_quota')) {
            console.warn(`OpenAI quota exceeded while processing ${normalizedField} for product ${product.product_id}`);
            quotaExceededError = true;
            
            // For this field, generate fallback content
            if (normalizedField === 'title') {
              enhancedProduct.title = `Premium Product - ${product.product_id}`;
            } else if (normalizedField === 'description') {
              enhancedProduct.description = `This is a high-quality product with excellent features. Great for everyday use and long-lasting performance. Customers love this product for its reliability and value.`;
            } else if (normalizedField === 'bullet_points') {
              enhancedProduct.bullet_points = [
                "Durable construction",
                "Easy to use",
                "Versatile application",
                "High-quality materials",
                "Satisfaction guaranteed"
              ];
            } else if (normalizedField === 'brand') {
              enhancedProduct.brand = "TechPro";
            } else if (normalizedField === 'category') {
              enhancedProduct.category = "General Merchandise";
            } else if (normalizedField === 'asin' && marketplace === 'Amazon') {
              enhancedProduct.asin = generateRandomASIN();
            }
          } else {
            // For non-quota errors, log and continue
            console.error(`Error enhancing ${normalizedField} for product ${product.product_id}:`, fieldError);
          }
        }
      }
      
      enhancedProducts.push(enhancedProduct);
    } catch (error) {
      console.error(`Error enhancing product ${product.product_id}:`, error);
      // Add the original product to maintain the count
      enhancedProducts.push(product);
    }
  }
  
  return enhancedProducts;
}

/**
 * Generates fallback product data when API calls fail
 */
function generateFallbackProduct(product: any, marketplace: string, marketplaceConfig: any): Product {
  const enhancedProduct = { ...product };
  const missingFields = getMissingFields(product, marketplace);
  
  for (const field of missingFields) {
    const normalizedField = field.toLowerCase().replace(/\s+/g, '_');
    
    if (normalizedField === 'title') {
      enhancedProduct.title = `Premium Product - ${product.product_id}`;
    } else if (normalizedField === 'description') {
      enhancedProduct.description = `This is a high-quality product with excellent features. Great for everyday use and long-lasting performance. Customers love this product for its reliability and value.`;
    } else if (normalizedField === 'bullet_points') {
      enhancedProduct.bullet_points = [
        "Durable construction",
        "Easy to use",
        "Versatile application",
        "High-quality materials",
        "Satisfaction guaranteed"
      ];
    } else if (normalizedField === 'brand') {
      enhancedProduct.brand = "TechPro";
    } else if (normalizedField === 'category') {
      enhancedProduct.category = "General Merchandise";
    } else if (normalizedField === 'asin' && marketplace === 'Amazon') {
      enhancedProduct.asin = generateRandomASIN();
    }
  }
  
  return enhancedProduct as Product;
}

/**
 * Calls the OpenAI API to generate content
 * @param prompt The prompt to send to OpenAI
 * @param systemPrompt Optional custom system prompt for more specific instructions
 * @param options Additional options for the API call
 * @returns Generated content
 */
async function callOpenAIAPI(
  prompt: string, 
  systemPrompt?: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    json_response?: boolean;
    product_research?: boolean;
  }
): Promise<string> {
  try {
    // Default system prompt for product enhancement
    const defaultSystemPrompt = options?.product_research 
      ? "You are a product research specialist who helps understand product data and enhance it for e-commerce marketplaces. You analyze product information to identify what a product is, what it does, and how to present it effectively online."
      : "You are a professional product listing optimizer that creates marketplace-ready product content. Create compelling titles, descriptions, and bullet points that highlight benefits and uses SEO best practices.";
      
    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;
    
    const apiOptions: any = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1024
    };
    
    // If JSON response is requested, add the appropriate format
    if (options?.json_response) {
      apiOptions.response_format = { type: "json_object" };
    }
    
    const response = await openai.chat.completions.create(apiOptions);

    const generatedContent = response.choices[0].message.content;
    return generatedContent ? generatedContent.trim() : "";
  } catch (error: any) {
    console.error("Error calling OpenAI API:", error);
    
    // Check if it's a quota error
    if (error.status === 429 || (error.error && error.error.type === 'insufficient_quota')) {
      console.warn("OpenAI API quota exceeded. Using fallback generation method.");
      
      // Try to use Gemini API instead
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (geminiApiKey) {
        try {
          // For product research, use a more specific prompt
          const geminiSystemPrompt = options?.product_research
            ? "As a product research specialist, analyze this product information to identify what it is, how it's used, and how to present it effectively online."
            : "As a product listing expert, optimize this content for marketplace listing. Create detailed and compelling product descriptions.";
          
          // Combine system message with user prompt for Gemini
          const combinedPrompt = `${geminiSystemPrompt}\n\n${prompt}`;
          
          // Use the Gemini service to process the prompt
          const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
          
          const response = await fetch(`${apiUrl}?key=${geminiApiKey}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: combinedPrompt
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: options?.temperature ?? 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: options?.max_tokens ?? 1024,
              }
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
              let responseText = data.candidates[0].content.parts[0].text;
              
              // If JSON was requested, try to extract JSON from the response
              if (options?.json_response) {
                try {
                  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    responseText = jsonMatch[0];
                    // Validate it's proper JSON
                    JSON.parse(responseText);
                  }
                } catch (jsonError) {
                  console.error("Failed to extract valid JSON from Gemini response");
                }
              }
              
              return responseText.trim();
            }
          }
          console.warn("Gemini API fallback attempt failed. Using local fallback method.");
        } catch (geminiError) {
          console.error("Error using Gemini API fallback:", geminiError);
        }
      }
      
      // Local fallback if Gemini also fails
      const promptLines = prompt.split('\n').filter(line => line.trim().length > 0);
      let context = "";
      
      // Find product details line
      const detailsLine = promptLines.find(line => line.includes("Product details:"));
      if (detailsLine) {
        context = detailsLine.split("Product details:")[1].trim();
      }
      
      // Based on prompt, determine what we're generating and provide appropriate fallback
      if (prompt.includes("product title")) {
        return `Premium Product - ${context.split(",")[0]}`;
      } else if (prompt.includes("product description")) {
        return `This is a high-quality product with excellent features. ${context} Great for everyday use and long-lasting performance. Customers love this product for its reliability and value.`;
      } else if (prompt.includes("bullet points")) {
        return "Durable construction\nEasy to use\nVersatile application\nHigh-quality materials\nSatisfaction guaranteed";
      } else if (prompt.includes("brand name")) {
        return "TechPro";
      } else if (prompt.includes("category")) {
        return "General Merchandise";
      } else {
        return "Content not available - API quota exceeded";
      }
    }
    
    // For other errors, just rethrow
    throw error;
  }
}

/**
 * Generates an SEO-optimized product title
 * @param product Product data
 * @param marketplace Target marketplace
 * @param maxLength Maximum title length
 * @returns Generated title
 */
async function generateTitleWithOpenAI(product: any, marketplace: string, maxLength: number): Promise<string> {
  try {
    // First, try to research the product if we don't have enough context
    let productResearch = null;
    if (!product.title || !product.description || !product.category) {
      try {
        productResearch = await researchProduct(product);
      } catch (error) {
        console.warn("Error researching product for title generation:", error);
      }
    }
    
    // Gather all available product information for better context
    const existingInfo = {
      product_id: product.product_id,
      description: product.description,
      brand: product.brand,
      category: product.category || (productResearch ? productResearch.product_type : null),
      features: product.bullet_points || [],
      price: product.price,
      dimensions: product.dimensions,
      weight: product.weight,
      material: product.material,
      color: product.color,
      current_title: product.title,
      research: productResearch ? {
        product_type: productResearch.product_type,
        likely_features: productResearch.likely_features,
        target_audience: productResearch.target_audience,
        search_terms: productResearch.search_terms
      } : null
    };
    
    // Create marketplace-specific title format guidance
    let marketplaceGuidance = "";
    if (marketplace === "Amazon") {
      marketplaceGuidance = `
        For Amazon listings:
        - Format: [Brand] + [Key Feature] + [Product Type] + [Size/Quantity/Color if applicable]
        - Example: "Sony X900H 65-Inch 4K Ultra HD Smart LED TV with HDR and Alexa Compatibility"
        - Start with the brand if available
        - Include 3-5 key features that differentiate the product
      `;
    } else if (marketplace === "eBay") {
      marketplaceGuidance = `
        For eBay listings:
        - Be specific and descriptive
        - Include brand, model, size, color as applicable
        - Use popular search terms but avoid keyword stuffing
        - Example: "Apple iPhone 12 Pro Max 256GB Pacific Blue Unlocked Excellent Condition"
      `;
    } else if (marketplace === "Etsy") {
      marketplaceGuidance = `
        For Etsy listings:
        - Highlight handmade, custom, or vintage aspects
        - Include materials and purpose
        - Be descriptive about uniqueness
        - Example: "Handcrafted Walnut Wood Desk Organizer with Phone Stand, Custom Office Accessory"
      `;
    } else if (marketplace === "Walmart") {
      marketplaceGuidance = `
        For Walmart listings:
        - Be direct and practical
        - Include brand, product type, key features
        - Example: "Samsung 55-inch 4K Smart TV with HDR, 120Hz Refresh Rate, Gaming Mode"
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
    
    const prompt = `
      Create a highly effective SEO-optimized product title for ${marketplace} marketplace.
      
      ${marketplaceGuidance}
      
      Constraints:
      - Maximum length: ${maxLength} characters
      - Must be descriptive and compelling
      - Include most important features and benefits
      - No ALL CAPS words (except for acronyms like "HD" or "USB")
      - No excessive special characters or emoji
      - No promotional language like "best", "amazing", etc.
      
      Product information:
      ${JSON.stringify(existingInfo, null, 2)}
      
      Return ONLY the title text with no additional explanation, quotation marks, or formatting.
    `;
    
    const title = await callOpenAIAPI(prompt);
    return title.substring(0, maxLength);
  } catch (error) {
    console.error(`Error generating title for product ${product.product_id}:`, error);
    
    // Create a more specific fallback title using available information
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
 * @returns Generated description
 */
async function generateDescriptionWithOpenAI(product: any, marketplace: string, maxLength: number): Promise<string> {
  try {
    // First, try to research the product if we don't have enough context
    let productResearch = null;
    if (!product.description || !product.category) {
      try {
        productResearch = await researchProduct(product);
      } catch (error) {
        console.warn("Error researching product for description generation:", error);
      }
    }
    
    // Gather all available product information for better context
    const existingInfo = {
      product_id: product.product_id,
      title: product.title,
      brand: product.brand,
      category: product.category || (productResearch ? productResearch.product_type : null),
      features: product.bullet_points || [],
      price: product.price,
      dimensions: product.dimensions,
      weight: product.weight,
      material: product.material,
      color: product.color,
      current_description: product.description,
      research: productResearch ? {
        product_type: productResearch.product_type,
        likely_features: productResearch.likely_features,
        target_audience: productResearch.target_audience,
        search_terms: productResearch.search_terms,
        enhanced_understanding: productResearch.enhanced_understanding
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
      `;
    } else if (marketplace === "eBay") {
      marketplaceGuidance = `
        For eBay listings:
        - Start with key product features
        - Include any condition details if applicable
        - Be factual and straightforward
        - Include dimensions, materials, and technical specs where relevant
      `;
    } else if (marketplace === "Etsy") {
      marketplaceGuidance = `
        For Etsy listings:
        - Highlight handmade, custom, or vintage aspects
        - Tell the story behind the product if applicable
        - Describe materials and creation process
        - Include care instructions and personalization options
      `;
    } else {
      marketplaceGuidance = `
        General description best practices:
        - Start with an engaging overview
        - Organize information into logical paragraphs
        - Balance features with benefits
        - Include practical use cases
        - End with specifications and technical details
      `;
    }
    
    const prompt = `
      Create a detailed, persuasive product description for ${marketplace} marketplace.
      
      ${marketplaceGuidance}
      
      Constraints:
      - Maximum length: ${maxLength} characters
      - Write in a professional, clear tone
      - Use natural paragraph breaks for readability
      - Include specific product features AND their benefits to users
      - Avoid clichés like "premium quality" without supporting details
      - No promotional superlatives like "best" or "amazing" without substantiation
      
      Product information:
      ${JSON.stringify(existingInfo, null, 2)}
      
      Return ONLY the description text with appropriate paragraph breaks. No additional formatting, explanations, or quotation marks.
    `;
    
    const description = await callOpenAIAPI(prompt);
    return description.substring(0, maxLength);
  } catch (error) {
    console.error(`Error generating description for product ${product.product_id}:`, error);
    
    // Create a more specific fallback description using available information
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
    
    // Add some generic quality statements
    fallbackDescription += "It features quality construction and reliable performance. ";
    
    // Add specifications if available
    if (product.dimensions || product.weight || product.material || product.color) {
      fallbackDescription += "Specifications: ";
      
      if (product.dimensions) fallbackDescription += `Dimensions: ${product.dimensions}. `;
      if (product.weight) fallbackDescription += `Weight: ${product.weight}. `;
      if (product.material) fallbackDescription += `Material: ${product.material}. `;
      if (product.color) fallbackDescription += `Color: ${product.color}. `;
    }
    
    // Add contact information suggestion
    fallbackDescription += "Contact us with any questions about this item.";
    
    return fallbackDescription;
  }
}

/**
 * Generates bullet points highlighting key product features
 * @param product Product data
 * @param marketplace Target marketplace
 * @param count Number of bullet points to generate
 * @returns Array of bullet points
 */
async function generateBulletPointsWithOpenAI(product: any, marketplace: string, count: number): Promise<string[]> {
  try {
    // Gather all available product information for better context
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
      current_bullet_points: product.bullet_points || []
    };
    
    // Create marketplace-specific bullet point guidance
    let marketplaceGuidance = "";
    if (marketplace === "Amazon") {
      marketplaceGuidance = `
        For Amazon bullet points:
        - Start with a benefit, followed by the feature that enables it
        - Use sentence case (capitalize first word only)
        - Keep each under 200 characters
        - Avoid including warranties or shipping info in bullet points
        - Focus on what differentiates the product
      `;
    } else if (marketplace === "eBay") {
      marketplaceGuidance = `
        For eBay bullet points:
        - Be concise and factual
        - Include key specifications and features
        - Mention compatibility or use cases
        - Focus on objective statements
      `;
    } else if (marketplace === "Etsy") {
      marketplaceGuidance = `
        For Etsy bullet points:
        - Highlight handmade aspects or uniqueness
        - Include materials, dimensions, and customization options
        - Mention ideal uses or occasions for the item
        - Note any sustainability aspects if applicable
      `;
    } else {
      marketplaceGuidance = `
        General bullet point best practices:
        - Lead with benefits, followed by features
        - Keep each point to one main idea
        - Be specific about dimensions, capabilities, and materials
        - Prioritize information by importance to the buyer
      `;
    }
    
    const prompt = `
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
      
      Product information:
      ${JSON.stringify(existingInfo, null, 2)}
      
      Return ONLY a list of ${count} bullet points, one per line, with no bullets, numbers, or other prefixes.
      Do not include any additional explanation or formatting.
    `;
    
    const bulletPointsText = await callOpenAIAPI(prompt);
    
    // Split by newlines and clean up
    const bulletPoints = bulletPointsText
      .split('\n')
      .map(point => point.trim())
      .filter(point => point.length > 0 && !point.startsWith('•') && !point.startsWith('*'))
      .map(point => {
        // Remove any bullet characters, numbers or dashes at the beginning
        return point.replace(/^[-•*]|\d+[.)]\s*|[*]\s+/, '').trim();
      })
      .slice(0, count);
    
    // If we don't have enough bullet points, generate more specific fallbacks
    if (bulletPoints.length < count) {
      const fallbacks = [];
      
      if (product.brand) fallbacks.push(`Made by ${product.brand} with attention to quality and detail`);
      if (product.material) fallbacks.push(`Constructed from durable ${product.material} for long-lasting performance`);
      if (product.color) fallbacks.push(`Available in ${product.color} to match your style preferences`);
      if (product.dimensions) fallbacks.push(`Perfect size at ${product.dimensions} for convenient use`);
      if (product.category) fallbacks.push(`Designed specifically for ${product.category} applications`);
      
      // Generic fallbacks if needed
      fallbacks.push(
        "Thoughtfully designed for ease of use and functionality",
        "Customer satisfaction is our top priority with this product",
        "Versatile design makes it suitable for multiple applications",
        "Quality construction ensures reliability and durability",
        "Excellent value for the price compared to similar products"
      );
      
      // Add unique fallbacks until we reach the desired count
      let fallbackIndex = 0;
      while (bulletPoints.length < count && fallbackIndex < fallbacks.length) {
        const fallback = fallbacks[fallbackIndex];
        if (!bulletPoints.includes(fallback)) {
          bulletPoints.push(fallback);
        }
        fallbackIndex++;
      }
      
      // If we still don't have enough, add simple numbered features
      while (bulletPoints.length < count) {
        bulletPoints.push(`Feature ${bulletPoints.length + 1}: Quality design and construction`);
      }
    }
    
    return bulletPoints;
  } catch (error) {
    console.error(`Error generating bullet points for product ${product.product_id}:`, error);
    
    // Create fallback bullet points with some specificity if possible
    const fallbacks = [];
    
    if (product.brand) fallbacks.push(`Made by ${product.brand} with attention to quality and detail`);
    if (product.material) fallbacks.push(`Constructed from durable ${product.material} for long-lasting performance`);
    if (product.color) fallbacks.push(`Available in ${product.color} to match your style preferences`);
    if (product.dimensions) fallbacks.push(`Perfect size at ${product.dimensions} for convenient use`);
    if (product.category) fallbacks.push(`Designed specifically for ${product.category} applications`);
    
    // Add generic fallbacks if needed
    const genericFallbacks = [
      "Durable construction designed for long-lasting use",
      "Intuitive design makes it easy to use right out of the box",
      "Versatile application suitable for multiple purposes",
      "Made with high-quality materials for superior performance",
      "Satisfaction guaranteed with excellent customer service"
    ];
    
    // Combine specific and generic fallbacks to reach the desired count
    const combinedFallbacks = [...fallbacks, ...genericFallbacks].slice(0, count);
    
    // If we still don't have enough, add simple numbered features
    while (combinedFallbacks.length < count) {
      combinedFallbacks.push(`Quality and reliability in every aspect`);
    }
    
    return combinedFallbacks;
  }
}

/**
 * Suggests a brand name based on product information
 * @param product Product data
 * @returns Suggested brand name
 */
async function suggestBrandWithOpenAI(product: any): Promise<string> {
  try {
    // Gather all available product information for better context
    const existingInfo = {
      product_id: product.product_id,
      title: product.title,
      description: product.description,
      category: product.category,
      bullet_points: product.bullet_points || [],
      current_brand: product.brand
    };
    
    const prompt = `
      Analyze this product information and identify or suggest an appropriate brand name.
      
      Guidelines:
      - If a brand name is clearly present in the product information, extract and return it (highest priority)
      - If product information contains model numbers with brand prefixes (like "SN-2000"), extract the brand part
      - Look for capitalized proper nouns that appear to be manufacturer names
      - If no brand is detected, suggest a plausible, professional brand name that would fit this type of product
      - Brand names should be concise (1-2 words) and appropriate for the product category
      - Avoid generic terms like "Premium" or "Quality" as stand-alone brand names
      
      Product information:
      ${JSON.stringify(existingInfo, null, 2)}
      
      Return ONLY the brand name with no additional explanation, quotation marks, or formatting.
    `;
    
    const brandName = await callOpenAIAPI(prompt);
    return brandName.trim();
  } catch (error) {
    console.error(`Error generating brand for product ${product.product_id}:`, error);
    
    // Create a more specific fallback brand using available information
    let fallbackBrand = "";
    
    // Try to extract brand from title if available
    if (product.title) {
      const words = product.title.split(' ');
      // Use the first word if it's not a generic descriptor
      const genericWords = ['new', 'premium', 'quality', 'best', 'professional', 'high', 'top'];
      if (words.length > 0 && !genericWords.includes(words[0].toLowerCase())) {
        fallbackBrand = words[0];
      }
    }
    
    // If we couldn't extract from title, use a more specific default based on category
    if (!fallbackBrand && product.category) {
      const category = product.category.toLowerCase();
      if (category.includes('tech') || category.includes('electronic')) {
        fallbackBrand = "TechPro";
      } else if (category.includes('home') || category.includes('kitchen')) {
        fallbackBrand = "HomeSmart";
      } else if (category.includes('fashion') || category.includes('cloth')) {
        fallbackBrand = "StyleLife";
      } else if (category.includes('sport') || category.includes('outdoor')) {
        fallbackBrand = "ActiveGear";
      } else if (category.includes('beauty') || category.includes('personal')) {
        fallbackBrand = "PureEssence";
      } else {
        fallbackBrand = "QualityPlus";
      }
    } else if (!fallbackBrand) {
      fallbackBrand = "QualityPlus";
    }
    
    return fallbackBrand;
  }
}

/**
 * Suggests a product category based on product information
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Suggested product category
 */
async function suggestCategoryWithOpenAI(product: any, marketplace: string): Promise<string> {
  try {
    // Gather all available product information for better context
    const existingInfo = {
      product_id: product.product_id,
      title: product.title,
      description: product.description,
      brand: product.brand,
      bullet_points: product.bullet_points || [],
      dimensions: product.dimensions,
      weight: product.weight,
      material: product.material,
      color: product.color,
      current_category: product.category
    };
    
    // Create marketplace-specific category guidance
    let marketplaceGuidance = "";
    if (marketplace === "Amazon") {
      marketplaceGuidance = `
        Amazon main categories include:
        - Electronics
        - Computers & Accessories
        - Smart Home
        - Arts & Crafts
        - Automotive
        - Baby
        - Beauty & Personal Care
        - Books
        - Fashion
        - Home & Kitchen
        - Industrial & Scientific
        - Movies & TV
        - Music, CDs & Vinyl
        - Pet Supplies
        - Software
        - Sports & Outdoors
        - Tools & Home Improvement
        - Toys & Games
        - Video Games
      `;
    } else if (marketplace === "eBay") {
      marketplaceGuidance = `
        eBay main categories include:
        - Antiques
        - Art
        - Baby
        - Books, Comics & Magazines
        - Business, Office & Industrial
        - Cameras & Photography
        - Cars, Motorcycles & Vehicles
        - Clothes, Shoes & Accessories
        - Coins
        - Collectables
        - Computing
        - Consumer Electronics
        - Crafts
        - Dolls & Bears
        - DVDs, Films & TV
        - Health & Beauty
        - Home, Furniture & DIY
        - Jewelry & Watches
        - Mobile Phones & Communication
        - Music
        - Musical Instruments
        - Pet Supplies
        - Pottery, Porcelain & Glass
        - Sporting Goods
        - Sports Memorabilia
        - Stamps
        - Tickets & Experiences
        - Toys & Games
        - Video Games & Consoles
      `;
    } else if (marketplace === "Etsy") {
      marketplaceGuidance = `
        Etsy main categories include:
        - Jewelry & Accessories
        - Clothing & Shoes
        - Home & Living
        - Wedding & Party
        - Toys & Entertainment
        - Art & Collectibles
        - Craft Supplies
        - Vintage
        - Gifts
      `;
    } else if (marketplace === "Walmart") {
      marketplaceGuidance = `
        Walmart main categories include:
        - Electronics
        - Office
        - Home
        - Furniture
        - Appliances
        - Toys
        - Video Games
        - Movies & TV Shows
        - Music
        - Books
        - Clothing
        - Baby
        - Patio & Garden
        - Health
        - Beauty
        - Sports & Outdoors
        - Auto & Tires
        - Photo
        - Art & Craft Supplies
        - Holiday & Seasonal
      `;
    } else {
      marketplaceGuidance = `
        Common ecommerce categories include:
        - Electronics & Computers
        - Smart Home
        - Home & Kitchen
        - Furniture
        - Appliances
        - Beauty & Personal Care
        - Fashion & Apparel
        - Sports & Outdoors
        - Toys & Games
        - Books & Media
        - Health & Wellness
        - Automotive
        - Tools & Home Improvement
        - Office Supplies
        - Pet Supplies
        - Grocery & Gourmet
        - Arts & Crafts
        - Garden & Outdoor
        - Baby & Kids
      `;
    }
    
    const prompt = `
      Analyze this product information and suggest the most appropriate product category for ${marketplace}.
      
      ${marketplaceGuidance}
      
      Guidelines:
      - Select the single most appropriate category from the ${marketplace} category list above
      - If the exact category isn't listed, choose the closest match
      - If the product could fit multiple categories, select the primary one that best describes its main purpose
      - Return only the category name, not subcategories
      - If a clear category is already present in the product information and it matches ${marketplace}'s taxonomy, use it
      
      Product information:
      ${JSON.stringify(existingInfo, null, 2)}
      
      Return ONLY the category name with no additional explanation, quotation marks, or formatting.
    `;
    
    const category = await callOpenAIAPI(prompt);
    return category.trim();
  } catch (error) {
    console.error(`Error generating category for product ${product.product_id}:`, error);
    
    // Create a more specific fallback category using available information
    let fallbackCategory = "General Merchandise";
    
    // Try to determine category from product title and description
    const productText = [
      product.title || "", 
      product.description || ""
    ].join(" ").toLowerCase();
    
    // Check for common category keywords
    if (/phone|smartphone|tablet|computer|laptop|desktop|monitor|router|camera|headphones|speaker|tv|television/i.test(productText)) {
      fallbackCategory = "Electronics";
    } else if (/shirt|dress|pants|shoes|clothing|jacket|hat|socks|fashion|wear|apparel/i.test(productText)) {
      fallbackCategory = "Clothing";
    } else if (/kitchen|cookware|utensil|appliance|refrigerator|microwave|blender|mixer|pot|pan/i.test(productText)) {
      fallbackCategory = "Home & Kitchen";
    } else if (/sofa|chair|table|bed|furniture|desk|drawer|cabinet|shelf/i.test(productText)) {
      fallbackCategory = "Furniture";
    } else if (/toy|game|puzzle|board game|doll|action figure|stuffed/i.test(productText)) {
      fallbackCategory = "Toys & Games";
    } else if (/book|novel|textbook|magazine|publication/i.test(productText)) {
      fallbackCategory = "Books";
    } else if (/beauty|makeup|skin care|cosmetic|lotion|perfume|cologne/i.test(productText)) {
      fallbackCategory = "Beauty & Personal Care";
    } else if (/sport|exercise|fitness|workout|gym|outdoor|camping|hiking/i.test(productText)) {
      fallbackCategory = "Sports & Outdoors";
    } else if (/tool|drill|saw|hammer|screwdriver|wrench|hardware/i.test(productText)) {
      fallbackCategory = "Tools & Home Improvement";
    } else if (/pet|dog|cat|bird|fish|animal/i.test(productText)) {
      fallbackCategory = "Pet Supplies";
    }
    
    return fallbackCategory;
  }
}

/**
 * Generates a random ASIN (Amazon Standard Identification Number)
 * @returns Random ASIN
 */
function generateRandomASIN(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let asin = "B0";
  
  // ASINs are 10 characters, starting with "B0"
  for (let i = 0; i < 8; i++) {
    asin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return asin;
}

/**
 * Researches product information to better understand what the product is
 * @param product The product data with limited information
 * @returns Enhanced understanding of the product
 */
export async function researchProduct(product: any): Promise<any> {
  try {
    // Gather all available product information
    const productInfo = {
      product_id: product.product_id,
      title: product.title,
      description: product.description,
      brand: product.brand,
      category: product.category,
      bullet_points: product.bullet_points || [],
      price: product.price,
      dimensions: product.dimensions,
      weight: product.weight,
      material: product.material,
      color: product.color
    };
    
    // Create a research prompt that focuses on understanding what the product is
    const prompt = `
      Analyze this product data and help me understand what this product is. The information may be incomplete.
      
      Product Information:
      ${JSON.stringify(productInfo, null, 2)}
      
      Please provide:
      1. What type of product is this? (Be specific about the product category)
      2. What are its likely key features and benefits?
      3. Who would be the target audience?
      4. What are likely search terms people would use to find this product?
      5. What additional information would make this listing more complete?
      
      Format your response as JSON with these fields:
      - product_type: String describing the specific product type
      - likely_features: Array of strings with likely key features
      - target_audience: String describing the target audience
      - search_terms: Array of strings with likely search terms
      - missing_information: Array of strings describing missing information
      - enhanced_understanding: String with overall assessment of what this product is
    `;
    
    const researchResult = await callOpenAIAPI(prompt, undefined, {
      temperature: 0.5,
      max_tokens: 800,
      json_response: true,
      product_research: true
    });
    
    try {
      return JSON.parse(researchResult);
    } catch (jsonError) {
      console.error("Failed to parse product research JSON:", jsonError);
      return {
        product_type: "Unknown",
        likely_features: [],
        target_audience: "General consumers",
        search_terms: [],
        missing_information: ["Unable to determine from provided data"],
        enhanced_understanding: "Insufficient data to determine product details"
      };
    }
  } catch (error) {
    console.error("Error researching product:", error);
    return null;
  }
}