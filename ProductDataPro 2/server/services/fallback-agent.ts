/**
 * MarketMind AI - Fallback Agent Module
 * This module provides offline-first product enhancement capabilities,
 * operating completely without API calls for reliable performance
 */

import { Product } from '@shared/schema';

/**
 * Core agent result interface including real-time thought process
 */
export interface AgentResult {
  enhancedProduct: any;
  originalProduct: any;
  marketplaceInsights: {
    seoScore: number;
    complianceScore: number;
    competitiveAnalysis: {
      titleOptimization: string;
      keywordGaps: string[];
      suggestedImprovements: string[];
    };
    potentialROI: {
      clickThroughEstimate: string;
      conversionImpact: string;
      visibilityScore: string;
    };
  };
  transformations: {
    title: {
      before: string;
      after: string;
      reasoning: string;
    };
    description: {
      before: string;
      after: string;
      reasoning: string;
    };
    bulletPoints: {
      before: string[];
      after: string[];
      reasoning: string;
    };
    keywords: {
      before: string[];
      after: string[];
      reasoning: string;
    };
    images: {
      before: any[];
      after: any[];
      reasoning: string;
    };
  };
  thoughtProcess: string[];
  issues: {
    critical: any[];
    recommendations: any[];
  };
  overallScore: number;
  processingTime: number;
}

/**
 * Process a single product with fallback agent (no API calls)
 */
export async function fallbackAnalyzeProduct(product: any, marketplace: string): Promise<AgentResult> {
  console.log("Using fallback agent processing (no API calls) for marketplace:", marketplace);
  
  // Start timing the process
  const startTime = Date.now();
  
  // Initialize the thought process
  const thoughtProcess: string[] = [
    "Analyzing product with offline capabilities...",
    "Extracting key product attributes...",
    "Identifying opportunities for marketplace-specific optimizations..."
  ];
  
  // Store the original product for before/after comparison
  const originalProduct = { ...product };
  
  // TITLE OPTIMIZATION
  thoughtProcess.push("Analyzing product title for optimization opportunities...");
  
  let originalTitle = product.title || "";
  let enhancedTitle = originalTitle;
  let titleReasoning = "No changes needed to the title.";
  
  if (originalTitle.length < 10) {
    enhancedTitle = createImprovedTitle(product);
    titleReasoning = "Added more descriptive elements to make the title more appealing and informative.";
    thoughtProcess.push("Title is too short - enhancing with product attributes and keywords.");
  } else if (originalTitle.length > 150) {
    enhancedTitle = originalTitle.substring(0, 145) + "...";
    titleReasoning = "Shortened overly long title to improve readability while maintaining key information.";
    thoughtProcess.push("Title exceeds recommended length - trimming to ideal length.");
  } else if (!containsKeyAttributes(originalTitle, product)) {
    enhancedTitle = createImprovedTitle(product);
    titleReasoning = "Restructured title to include more key product attributes and targeted keywords.";
    thoughtProcess.push("Title missing key attributes - adding for improved discoverability.");
  }
  
  // DESCRIPTION OPTIMIZATION
  thoughtProcess.push("Evaluating product description for completeness and persuasiveness...");
  
  let originalDescription = product.description || "";
  let enhancedDescription = originalDescription;
  let descriptionReasoning = "No changes needed to the description.";
  
  if (originalDescription.length < 50) {
    enhancedDescription = createImprovedDescription(product, marketplace);
    descriptionReasoning = "Created a comprehensive description that highlights key product benefits and features.";
    thoughtProcess.push("Description is too short - generating more detailed content.");
  } else if (!descriptionIncludesKeyElements(originalDescription)) {
    enhancedDescription = improveExistingDescription(originalDescription, product);
    descriptionReasoning = "Enhanced existing description with additional key product information and benefits.";
    thoughtProcess.push("Description missing key elements - adding to improve persuasiveness.");
  }
  
  // BULLET POINTS OPTIMIZATION
  thoughtProcess.push("Reviewing bullet points for clarity and impact...");
  
  const originalBullets = product.bulletPoints || product.features || [];
  let enhancedBullets = [...originalBullets];
  let bulletReasoning = "No changes needed to the bullet points.";
  
  if (originalBullets.length === 0) {
    enhancedBullets = generateBulletPoints(product, marketplace);
    bulletReasoning = "Created bullet points to highlight key product features and benefits.";
    thoughtProcess.push("No bullet points found - generating from product information.");
  } else if (originalBullets.length < 3) {
    const additionalBullets = generateAdditionalBulletPoints(product, marketplace, 5 - originalBullets.length);
    enhancedBullets = [...originalBullets, ...additionalBullets];
    bulletReasoning = "Added more bullet points to better highlight product features and benefits.";
    thoughtProcess.push("Insufficient bullet points - adding more for better feature coverage.");
  }
  
  // KEYWORDS OPTIMIZATION
  thoughtProcess.push("Identifying optimal keywords for marketplace visibility...");
  
  const originalKeywords = product.keywords || [];
  let enhancedKeywords = [...originalKeywords];
  let keywordReasoning = "No changes needed to the keywords.";
  
  if (originalKeywords.length === 0) {
    enhancedKeywords = generateKeywords(product, marketplace);
    keywordReasoning = "Generated keywords to improve product discoverability.";
    thoughtProcess.push("No keywords found - generating marketplace-optimized terms.");
  } else if (originalKeywords.length < 5) {
    const additionalKeywords = generateAdditionalKeywords(product, marketplace, 10 - originalKeywords.length);
    enhancedKeywords = [...originalKeywords, ...additionalKeywords];
    keywordReasoning = "Added more keywords to improve product discoverability.";
    thoughtProcess.push("Insufficient keywords - adding more for better search visibility.");
  }
  
  // IMAGES ANALYSIS
  thoughtProcess.push("Analyzing product images for completeness...");
  
  const originalImages = product.images || [];
  let enhancedImages = [...originalImages];
  let imagesReasoning = "No changes needed to the images.";
  
  // MARKETPLACE COMPLIANCE ANALYSIS
  thoughtProcess.push(`Checking compliance with ${marketplace} guidelines...`);
  
  const complianceIssues = checkMarketplaceCompliance(product, marketplace);
  const seoIssues = checkSEOOptimization(product, marketplace);
  
  const criticalIssues = [...complianceIssues.critical, ...seoIssues.critical];
  const recommendations = [...complianceIssues.recommendations, ...seoIssues.recommendations];
  
  // Calculate scores
  const seoScore = calculateSEOScore(product, enhancedTitle, enhancedDescription, enhancedKeywords);
  const complianceScore = calculateComplianceScore(product, marketplace, criticalIssues.length);
  
  // Create the enhanced product
  const enhancedProduct = {
    ...product,
    title: enhancedTitle,
    description: enhancedDescription,
    bulletPoints: enhancedBullets,
    keywords: enhancedKeywords,
    images: enhancedImages
  };
  
  // Calculate overall score
  const overallScore = Math.round((seoScore + complianceScore) / 2);
  
  // End timing the process
  const endTime = Date.now();
  const processingTime = endTime - startTime;
  
  // Final thoughts
  thoughtProcess.push(`Optimization complete. Overall product score: ${overallScore}/100.`);
  
  // Return the result
  return {
    enhancedProduct,
    originalProduct,
    marketplaceInsights: {
      seoScore,
      complianceScore,
      competitiveAnalysis: {
        titleOptimization: getTitleOptimizationAdvice(product, enhancedTitle, marketplace),
        keywordGaps: getKeywordGaps(product, enhancedKeywords, marketplace),
        suggestedImprovements: getSuggestedImprovements(product, enhancedProduct, marketplace)
      },
      potentialROI: {
        clickThroughEstimate: getClickThroughEstimate(product, enhancedProduct),
        conversionImpact: getConversionImpact(product, enhancedProduct),
        visibilityScore: getVisibilityScore(product, enhancedProduct, marketplace)
      }
    },
    transformations: {
      title: {
        before: originalTitle,
        after: enhancedTitle,
        reasoning: titleReasoning
      },
      description: {
        before: originalDescription,
        after: enhancedDescription,
        reasoning: descriptionReasoning
      },
      bulletPoints: {
        before: originalBullets,
        after: enhancedBullets,
        reasoning: bulletReasoning
      },
      keywords: {
        before: originalKeywords,
        after: enhancedKeywords,
        reasoning: keywordReasoning
      },
      images: {
        before: originalImages,
        after: enhancedImages,
        reasoning: imagesReasoning
      }
    },
    thoughtProcess,
    issues: {
      critical: criticalIssues,
      recommendations
    },
    overallScore,
    processingTime
  };
}

/**
 * Process multiple products with fallback agent
 */
export async function fallbackAnalyzeProducts(
  products: any[],
  marketplace: string
): Promise<AgentResult[]> {
  try {
    console.log(`Processing ${products.length} products with fallback agent...`);
    
    // Process each product in the list
    const results: AgentResult[] = [];
    
    for (const product of products) {
      const result = await fallbackAnalyzeProduct(product, marketplace);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error("Error in fallback product analysis:", error);
    throw error;
  }
}

// Helper functions for product enhancement

function containsKeyAttributes(title: string, product: any): boolean {
  const lowerTitle = title.toLowerCase();
  const keyAttrs = [
    product.brand?.toLowerCase(),
    product.color?.toLowerCase(),
    product.detectedType?.toLowerCase(),
    product.productType?.toLowerCase(),
    product.model?.toLowerCase()
  ].filter(Boolean);
  
  return keyAttrs.some(attr => lowerTitle.includes(attr));
}

function createImprovedTitle(product: any): string {
  const elements = [
    product.brand,
    product.detectedType || product.productType || product.type || product.category || "Product",
    product.model,
    product.color ? `- ${product.color}` : "",
    product.size ? `- ${product.size}` : "",
    product.material ? `- ${product.material}` : ""
  ].filter(Boolean);
  
  return elements.join(" ").substring(0, 150);
}

function descriptionIncludesKeyElements(description: string): boolean {
  const lowerDesc = description.toLowerCase();
  
  // Check for key elements every good description should have
  const hasFeatures = lowerDesc.includes("feature") || (lowerDesc.match(/benefit|advantage|quality|design/i) !== null);
  const hasMaterials = lowerDesc.match(/made of|material|construct|built/i) !== null;
  const hasUseCases = lowerDesc.match(/use|ideal for|perfect for|great for|suitable/i) !== null;
  
  return hasFeatures && (hasMaterials || hasUseCases);
}

function improveExistingDescription(description: string, product: any): string {
  let improved = description;
  
  // Add missing elements as needed
  if (!description.match(/feature|benefit|advantage/i)) {
    improved += `\n\nKey Features: This ${product.detectedType || "product"} offers exceptional quality`;
    if (product.material) improved += `, made from premium ${product.material}`;
    improved += ".";
  }
  
  if (!description.match(/use|ideal for|perfect for|great for|suitable/i)) {
    improved += `\n\nIdeal for: This ${product.detectedType || "product"} is perfect for `;
    if (product.detectedType?.toLowerCase().includes("furniture")) {
      improved += "home, office, or any space where comfort and style are valued.";
    } else if (product.detectedType?.toLowerCase().includes("clothing") || product.detectedType?.toLowerCase().includes("apparel")) {
      improved += "everyday wear, special occasions, or adding a stylish touch to your wardrobe.";
    } else if (product.detectedType?.toLowerCase().includes("electronic")) {
      improved += "daily use, enhancing productivity, or providing entertainment with its reliable performance.";
    } else {
      improved += "everyday use with its reliable performance and quality construction.";
    }
  }
  
  return improved;
}

function createImprovedDescription(product: any, marketplace: string): string {
  const typeDesc = product.detectedType || product.productType || product.category || "product";
  
  let description = `Introducing this premium quality ${typeDesc}`;
  if (product.brand) description += ` from ${product.brand}`;
  description += ". ";
  
  description += `This ${typeDesc} combines style, functionality, and durability`;
  if (product.material) description += ` with its high-quality ${product.material} construction`;
  description += ". ";
  
  // Add marketplace-specific elements
  if (marketplace.toLowerCase() === "amazon") {
    description += `Perfect for anyone looking for a reliable ${typeDesc} that delivers on performance. `;
    description += "Add to cart now to enjoy fast delivery with your Prime membership!";
  } else if (marketplace.toLowerCase() === "ebay") {
    description += `This ${typeDesc} is in excellent condition and ready to ship immediately. `;
    description += "Buy with confidence from a trusted seller with positive feedback!";
  } else if (marketplace.toLowerCase() === "etsy") {
    description += `Each ${typeDesc} is carefully crafted with attention to detail. `;
    description += "Support small businesses by adding this unique item to your collection today!";
  } else {
    description += `Enhance your lifestyle with this exceptional ${typeDesc}. `;
    description += "Order now for a quality product that meets your needs!";
  }
  
  return description;
}

function generateBulletPoints(product: any, marketplace: string): string[] {
  const bullets: string[] = [];
  const type = product.detectedType || product.productType || product.category || "product";
  
  // Generate standard bullet points based on product type
  if (type.toLowerCase().includes("furniture") || type.toLowerCase().includes("chair")) {
    bullets.push(`Premium Quality: Expertly crafted ${type} designed for comfort and durability`);
    bullets.push(`Versatile Use: Perfect for home, office, or any space where comfort is valued`);
    bullets.push(`Stylish Design: Modern aesthetic that complements any decor style`);
    if (product.material) bullets.push(`Quality Materials: Made from high-grade ${product.material} for long-lasting performance`);
    bullets.push(`Customer Satisfaction: Backed by our commitment to quality and service`);
  } else if (type.toLowerCase().includes("clothing") || type.toLowerCase().includes("apparel")) {
    bullets.push(`Premium Quality: High-quality ${type} designed for comfort and style`);
    bullets.push(`Versatile Wear: Perfect for everyday use or special occasions`);
    bullets.push(`Stylish Design: Contemporary aesthetic that complements various outfits`);
    if (product.material) bullets.push(`Quality Materials: Made from comfortable ${product.material} for long-lasting wear`);
    bullets.push(`Easy Care: Simple maintenance to keep your ${type} looking great`);
  } else if (type.toLowerCase().includes("electronic")) {
    bullets.push(`Advanced Technology: Feature-rich ${type} designed for optimal performance`);
    bullets.push(`Versatile Use: Perfect for work, entertainment, or everyday tasks`);
    bullets.push(`User-Friendly: Intuitive design for seamless operation`);
    bullets.push(`Reliable Performance: Built to deliver consistent results`);
    bullets.push(`Quality Assurance: Backed by warranty and customer support`);
  } else {
    bullets.push(`Premium Quality: High-grade ${type} designed for optimal performance`);
    bullets.push(`Versatile Use: Adaptable for various applications and settings`);
    bullets.push(`Thoughtful Design: Created with user experience in mind`);
    bullets.push(`Reliable Performance: Consistent quality you can count on`);
    bullets.push(`Customer Satisfaction: Backed by our commitment to excellence`);
  }
  
  return bullets;
}

function generateAdditionalBulletPoints(product: any, marketplace: string, count: number): string[] {
  const existingBullets = product.bulletPoints || product.features || [];
  const type = product.detectedType || product.productType || product.category || "product";
  const additionalBullets: string[] = [];
  
  // Standard additional bullets that work for most products
  const potentialBullets = [
    `Premium Quality: Superior ${type} crafted for exceptional performance`,
    `Versatile Application: Suitable for a variety of uses and settings`,
    `Customer Satisfaction: Backed by positive reviews and satisfaction guarantee`,
    `Value: Excellent price-to-quality ratio for discerning buyers`,
    `Easy Maintenance: Simple care instructions to maintain optimal condition`
  ];
  
  // Add marketplace-specific bullets
  if (marketplace.toLowerCase() === "amazon") {
    potentialBullets.push(`Fast Shipping: Eligible for Prime delivery to your door`);
    potentialBullets.push(`Trusted Quality: Join thousands of satisfied Amazon customers`);
  } else if (marketplace.toLowerCase() === "ebay") {
    potentialBullets.push(`Reliable Shipping: Fast dispatch and careful packaging`);
    potentialBullets.push(`Seller Guarantee: Purchase with confidence from a top-rated seller`);
  } else if (marketplace.toLowerCase() === "etsy") {
    potentialBullets.push(`Unique Item: Distinctive ${type} not found in mass-market stores`);
    potentialBullets.push(`Artisan Quality: Crafted with care and attention to detail`);
  }
  
  // Filter out bullets that might be similar to existing ones
  const existingLower = existingBullets.map(b => b.toLowerCase());
  const filteredBullets = potentialBullets.filter(bullet => {
    const bulletLower = bullet.toLowerCase();
    return !existingLower.some(existing => 
      existing.includes(bulletLower.split(':')[0].toLowerCase()) || 
      bulletLower.includes(existing.split(':')[0].toLowerCase())
    );
  });
  
  // Return the requested number of bullets
  return filteredBullets.slice(0, count);
}

function generateKeywords(product: any, marketplace: string): string[] {
  const type = product.detectedType || product.productType || product.category || "product";
  const keywords: string[] = [];
  
  // Add base keywords
  keywords.push(type);
  if (product.brand) keywords.push(product.brand);
  if (product.color) keywords.push(product.color);
  if (product.material) keywords.push(product.material);
  if (product.size) keywords.push(product.size);
  
  // Add compound keywords
  if (product.brand) keywords.push(`${product.brand} ${type}`);
  if (product.color) keywords.push(`${product.color} ${type}`);
  
  // Add general qualifiers
  keywords.push(`quality ${type}`);
  keywords.push(`premium ${type}`);
  keywords.push(`best ${type}`);
  
  // Add marketplace-specific keywords
  if (marketplace.toLowerCase() === "amazon") {
    keywords.push(`${type} with prime shipping`);
    keywords.push(`top rated ${type}`);
  } else if (marketplace.toLowerCase() === "ebay") {
    keywords.push(`${type} for sale`);
    keywords.push(`best deal ${type}`);
  } else if (marketplace.toLowerCase() === "etsy") {
    keywords.push(`handmade ${type}`);
    keywords.push(`unique ${type}`);
  }
  
  // Add type-specific keywords
  if (type.toLowerCase().includes("furniture") || type.toLowerCase().includes("chair")) {
    keywords.push(`comfortable ${type}`);
    keywords.push(`ergonomic ${type}`);
    keywords.push(`stylish ${type}`);
    keywords.push(`modern ${type}`);
    keywords.push(`${type} for home office`);
  } else if (type.toLowerCase().includes("clothing") || type.toLowerCase().includes("apparel")) {
    keywords.push(`stylish ${type}`);
    keywords.push(`comfortable ${type}`);
    keywords.push(`casual ${type}`);
    keywords.push(`trendy ${type}`);
    keywords.push(`fashion ${type}`);
  } else if (type.toLowerCase().includes("electronic")) {
    keywords.push(`high-performance ${type}`);
    keywords.push(`reliable ${type}`);
    keywords.push(`advanced ${type}`);
    keywords.push(`smart ${type}`);
    keywords.push(`tech ${type}`);
  }
  
  // Remove duplicates and return
  return [...new Set(keywords)];
}

function generateAdditionalKeywords(product: any, marketplace: string, count: number): string[] {
  const existingKeywords = product.keywords || [];
  const type = product.detectedType || product.productType || product.category || "product";
  
  // Generate a pool of potential keywords
  const allKeywords = generateKeywords(product, marketplace);
  
  // Filter out existing keywords
  const newKeywords = allKeywords.filter(keyword => 
    !existingKeywords.includes(keyword) && 
    !existingKeywords.some((existing: string) => 
      existing.toLowerCase() === keyword.toLowerCase() ||
      existing.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(existing.toLowerCase())
    )
  );
  
  // Return the requested number of keywords
  return newKeywords.slice(0, count);
}

function checkMarketplaceCompliance(product: any, marketplace: string): { critical: any[], recommendations: any[] } {
  const critical: any[] = [];
  const recommendations: any[] = [];
  
  // Common checks for all marketplaces
  if (!product.title) {
    critical.push({
      issue: "Missing Title",
      fix: "Add a descriptive product title"
    });
  } else if (product.title.length < 5) {
    critical.push({
      issue: "Title Too Short",
      fix: "Create a more descriptive title that includes key product attributes"
    });
  }
  
  if (!product.description) {
    critical.push({
      issue: "Missing Description",
      fix: "Add a comprehensive product description"
    });
  } else if (product.description.length < 20) {
    critical.push({
      issue: "Description Too Short",
      fix: "Expand description to include product features, benefits, and use cases"
    });
  }
  
  if (!product.price) {
    critical.push({
      issue: "Missing Price",
      fix: "Add product price"
    });
  }
  
  // Marketplace-specific checks
  if (marketplace.toLowerCase() === "amazon") {
    if (!product.bulletPoints || product.bulletPoints.length === 0) {
      critical.push({
        issue: "Missing Bullet Points",
        fix: "Add 5-7 bullet points highlighting key product features"
      });
    }
    
    if (!product.brand) {
      recommendations.push({
        issue: "Missing Brand",
        fix: "Add brand information to improve product discoverability"
      });
    }
    
    if (!product.keywords || product.keywords.length < 5) {
      recommendations.push({
        issue: "Insufficient Keywords",
        fix: "Add at least 5-7 relevant keywords for better searchability"
      });
    }
  } else if (marketplace.toLowerCase() === "ebay") {
    if (!product.condition) {
      critical.push({
        issue: "Missing Condition",
        fix: "Specify product condition (New, Used, Refurbished, etc.)"
      });
    }
    
    if (!product.shipping || !product.shipping.cost) {
      recommendations.push({
        issue: "Missing Shipping Information",
        fix: "Add shipping costs and details"
      });
    }
  } else if (marketplace.toLowerCase() === "etsy") {
    if (!product.materials || product.materials.length === 0) {
      recommendations.push({
        issue: "Missing Materials Information",
        fix: "Specify materials used, especially important for Etsy marketplace"
      });
    }
    
    if (!product.handmade) {
      recommendations.push({
        issue: "Handmade Status Not Specified",
        fix: "Indicate whether the item is handmade, as this is valued on Etsy"
      });
    }
  }
  
  return { critical, recommendations };
}

function checkSEOOptimization(product: any, marketplace: string): { critical: any[], recommendations: any[] } {
  const critical: any[] = [];
  const recommendations: any[] = [];
  
  // Title checks
  if (product.title) {
    if (product.title.length < 30) {
      recommendations.push({
        issue: "Title Too Short for SEO",
        fix: "Expand title to 50-75 characters with relevant keywords"
      });
    } else if (product.title.length > 200) {
      recommendations.push({
        issue: "Title Too Long",
        fix: "Shorten title to 50-75 characters while keeping key information"
      });
    }
    
    if (!containsKeyAttributes(product.title, product)) {
      recommendations.push({
        issue: "Title Missing Key Attributes",
        fix: "Include brand, product type, and key features in title"
      });
    }
  }
  
  // Description checks
  if (product.description) {
    if (product.description.length < 100) {
      recommendations.push({
        issue: "Description Too Short for SEO",
        fix: "Expand description to at least 300-500 characters with relevant keywords"
      });
    }
    
    if (!descriptionIncludesKeyElements(product.description)) {
      recommendations.push({
        issue: "Description Missing Key Elements",
        fix: "Include product features, materials, and use cases in description"
      });
    }
  }
  
  // Keyword checks
  if (!product.keywords || product.keywords.length === 0) {
    critical.push({
      issue: "Missing Keywords",
      fix: "Add relevant keywords to improve search visibility"
    });
  } else if (product.keywords.length < 3) {
    recommendations.push({
      issue: "Insufficient Keywords",
      fix: "Add more relevant keywords to improve search visibility"
    });
  }
  
  // Image checks
  if (!product.images || product.images.length === 0) {
    critical.push({
      issue: "Missing Images",
      fix: "Add product images to improve listing appeal"
    });
  } else if (product.images.length < 3) {
    recommendations.push({
      issue: "Insufficient Images",
      fix: "Add more product images showing different angles and details"
    });
  }
  
  return { critical, recommendations };
}

function calculateSEOScore(product: any, enhancedTitle: string, enhancedDescription: string, enhancedKeywords: string[]): number {
  let score = 0;
  
  // Title score (max 25 points)
  if (enhancedTitle) {
    if (enhancedTitle.length >= 50 && enhancedTitle.length <= 75) {
      score += 25; // Ideal length
    } else if (enhancedTitle.length >= 30 && enhancedTitle.length < 50) {
      score += 20; // Good length
    } else if (enhancedTitle.length > 75 && enhancedTitle.length <= 100) {
      score += 20; // Good but slightly long
    } else if (enhancedTitle.length >= 10 && enhancedTitle.length < 30) {
      score += 15; // Too short
    } else if (enhancedTitle.length > 100) {
      score += 10; // Too long
    } else {
      score += 5; // Very short
    }
  }
  
  // Description score (max 25 points)
  if (enhancedDescription) {
    if (enhancedDescription.length >= 300 && enhancedDescription.length <= 1000) {
      score += 25; // Ideal length
    } else if (enhancedDescription.length >= 100 && enhancedDescription.length < 300) {
      score += 20; // Good length
    } else if (enhancedDescription.length > 1000 && enhancedDescription.length <= 2000) {
      score += 20; // Good but slightly long
    } else if (enhancedDescription.length >= 50 && enhancedDescription.length < 100) {
      score += 15; // Too short
    } else if (enhancedDescription.length > 2000) {
      score += 10; // Too long
    } else {
      score += 5; // Very short
    }
  }
  
  // Keywords score (max 25 points)
  if (enhancedKeywords && enhancedKeywords.length > 0) {
    if (enhancedKeywords.length >= 7) {
      score += 25; // Ideal number
    } else if (enhancedKeywords.length >= 5 && enhancedKeywords.length < 7) {
      score += 20; // Good number
    } else if (enhancedKeywords.length >= 3 && enhancedKeywords.length < 5) {
      score += 15; // Moderate number
    } else {
      score += 10; // Few keywords
    }
  }
  
  // Images score (max 25 points)
  const images = product.images || [];
  if (images.length >= 5) {
    score += 25; // Ideal number
  } else if (images.length >= 3 && images.length < 5) {
    score += 20; // Good number
  } else if (images.length >= 1 && images.length < 3) {
    score += 15; // Few images
  } else {
    score += 0; // No images
  }
  
  return score;
}

function calculateComplianceScore(product: any, marketplace: string, criticalIssuesCount: number): number {
  let score = 100; // Start with perfect score
  
  // Deduct points for critical issues
  score -= criticalIssuesCount * 15;
  
  // Check for essential fields
  if (!product.title) score -= 20;
  if (!product.description) score -= 20;
  if (!product.price) score -= 15;
  
  // Marketplace-specific checks
  if (marketplace.toLowerCase() === "amazon") {
    if (!product.bulletPoints || product.bulletPoints.length === 0) score -= 15;
    if (!product.brand) score -= 10;
  } else if (marketplace.toLowerCase() === "ebay") {
    if (!product.condition) score -= 15;
  } else if (marketplace.toLowerCase() === "etsy") {
    if (!product.materials) score -= 10;
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

function getTitleOptimizationAdvice(product: any, enhancedTitle: string, marketplace: string): string {
  if (product.title === enhancedTitle) {
    return "Your title is already well-optimized for the marketplace.";
  }
  
  if (marketplace.toLowerCase() === "amazon") {
    return "Amazon favors titles that include brand name, product type, key features, and model number when applicable. Keep titles under 200 characters for best visibility.";
  } else if (marketplace.toLowerCase() === "ebay") {
    return "eBay's search algorithm favors titles with specific, relevant keywords. Include brand, model, size, color, and condition for best visibility.";
  } else if (marketplace.toLowerCase() === "etsy") {
    return "Etsy shoppers often look for unique, handmade items. Include keywords related to materials, style, and uniqueness in your title.";
  } else {
    return "For optimal visibility, include your brand name, product type, and 2-3 key features in your title.";
  }
}

function getKeywordGaps(product: any, enhancedKeywords: string[], marketplace: string): string[] {
  const gaps: string[] = [];
  const type = product.detectedType || product.productType || product.category || "product";
  
  // Suggested keywords based on marketplace
  if (marketplace.toLowerCase() === "amazon") {
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("quality") || k.toLowerCase().includes("premium"))) {
      gaps.push(`quality ${type}`);
    }
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("best") || k.toLowerCase().includes("top"))) {
      gaps.push(`best ${type}`);
    }
  } else if (marketplace.toLowerCase() === "ebay") {
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("sale") || k.toLowerCase().includes("deal"))) {
      gaps.push(`${type} for sale`);
    }
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("ship"))) {
      gaps.push(`fast shipping ${type}`);
    }
  } else if (marketplace.toLowerCase() === "etsy") {
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("handmade") || k.toLowerCase().includes("handcrafted"))) {
      gaps.push(`handmade ${type}`);
    }
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("unique") || k.toLowerCase().includes("custom"))) {
      gaps.push(`unique ${type}`);
    }
  }
  
  // Add type-specific keyword suggestions
  if (type.toLowerCase().includes("furniture") || type.toLowerCase().includes("chair")) {
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("ergonomic"))) {
      gaps.push(`ergonomic ${type}`);
    }
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("modern") || k.toLowerCase().includes("contemporary"))) {
      gaps.push(`modern ${type}`);
    }
  } else if (type.toLowerCase().includes("clothing") || type.toLowerCase().includes("apparel")) {
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("fashion") || k.toLowerCase().includes("style"))) {
      gaps.push(`fashion ${type}`);
    }
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("comfortable") || k.toLowerCase().includes("soft"))) {
      gaps.push(`comfortable ${type}`);
    }
  } else if (type.toLowerCase().includes("electronic")) {
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("smart") || k.toLowerCase().includes("digital"))) {
      gaps.push(`smart ${type}`);
    }
    if (!enhancedKeywords.some(k => k.toLowerCase().includes("wireless") || k.toLowerCase().includes("bluetooth"))) {
      gaps.push(`wireless ${type}`);
    }
  }
  
  // Limit to 5 gaps
  return gaps.slice(0, 5);
}

function getSuggestedImprovements(product: any, enhancedProduct: any, marketplace: string): string[] {
  const improvements: string[] = [];
  
  // Compare original and enhanced product to suggest improvements
  if (product.title !== enhancedProduct.title) {
    improvements.push("Optimize product title to include key attributes and marketplace-specific keywords");
  }
  
  if (product.description !== enhancedProduct.description) {
    improvements.push("Enhance product description with more detailed features, benefits, and use cases");
  }
  
  if (JSON.stringify(product.bulletPoints) !== JSON.stringify(enhancedProduct.bulletPoints)) {
    improvements.push("Improve or add bullet points to highlight key product features and benefits");
  }
  
  if (JSON.stringify(product.keywords) !== JSON.stringify(enhancedProduct.keywords)) {
    improvements.push("Expand keywords to improve search visibility and reach target customers");
  }
  
  // Add marketplace-specific suggestions
  if (marketplace.toLowerCase() === "amazon") {
    if (!product.brand) {
      improvements.push("Add brand information to improve product discoverability on Amazon");
    }
    if (!product.bulletPoints || product.bulletPoints.length < 5) {
      improvements.push("Ensure at least 5 detailed bullet points for Amazon's product page format");
    }
  } else if (marketplace.toLowerCase() === "ebay") {
    if (!product.condition) {
      improvements.push("Specify product condition clearly for eBay buyers");
    }
    if (!product.shipping || !product.shipping.cost) {
      improvements.push("Add detailed shipping information for eBay listings");
    }
  } else if (marketplace.toLowerCase() === "etsy") {
    if (!product.materials) {
      improvements.push("Detail the materials used in your product for Etsy's crafts-focused audience");
    }
    if (!product.handmade) {
      improvements.push("Highlight handmade or custom aspects of your product for Etsy buyers");
    }
  }
  
  // Add general improvements if needed
  if (!product.images || product.images.length < 3) {
    improvements.push("Add more high-quality images showing product from different angles");
  }
  
  return improvements;
}

function getClickThroughEstimate(product: any, enhancedProduct: any): string {
  // Simple estimate based on improvements
  let improvementCount = 0;
  
  if (product.title !== enhancedProduct.title) improvementCount++;
  if (product.description !== enhancedProduct.description) improvementCount++;
  if (JSON.stringify(product.bulletPoints) !== JSON.stringify(enhancedProduct.bulletPoints)) improvementCount++;
  if (JSON.stringify(product.keywords) !== JSON.stringify(enhancedProduct.keywords)) improvementCount++;
  
  if (improvementCount >= 4) {
    return "Potential increase of 40-50% in click-through rate with all optimizations applied";
  } else if (improvementCount >= 3) {
    return "Potential increase of 30-40% in click-through rate with these optimizations";
  } else if (improvementCount >= 2) {
    return "Potential increase of 20-30% in click-through rate with these optimizations";
  } else if (improvementCount >= 1) {
    return "Potential increase of 10-20% in click-through rate with these optimizations";
  } else {
    return "Minimal increase expected as listing is already well-optimized";
  }
}

function getConversionImpact(product: any, enhancedProduct: any): string {
  // Simple estimate based on improvements
  let improvementCount = 0;
  
  if (product.description !== enhancedProduct.description) improvementCount++;
  if (JSON.stringify(product.bulletPoints) !== JSON.stringify(enhancedProduct.bulletPoints)) improvementCount++;
  if (!product.images || product.images.length < 3) improvementCount++;
  
  if (improvementCount >= 3) {
    return "Potential conversion rate increase of 25-35% with all optimizations applied";
  } else if (improvementCount >= 2) {
    return "Potential conversion rate increase of 15-25% with these optimizations";
  } else if (improvementCount >= 1) {
    return "Potential conversion rate increase of 5-15% with these optimizations";
  } else {
    return "Minimal conversion impact expected as listing is already well-optimized";
  }
}

function getVisibilityScore(product: any, enhancedProduct: any, marketplace: string): string {
  // Simple estimate based on improvements
  let improvementCount = 0;
  
  if (product.title !== enhancedProduct.title) improvementCount++;
  if (JSON.stringify(product.keywords) !== JSON.stringify(enhancedProduct.keywords)) improvementCount++;
  
  // Marketplace-specific checks
  if (marketplace.toLowerCase() === "amazon" && (!product.bulletPoints || product.bulletPoints.length < 5)) {
    improvementCount++;
  } else if (marketplace.toLowerCase() === "ebay" && !product.condition) {
    improvementCount++;
  } else if (marketplace.toLowerCase() === "etsy" && !product.materials) {
    improvementCount++;
  }
  
  if (improvementCount >= 3) {
    return "Significant visibility improvement expected across search results";
  } else if (improvementCount >= 2) {
    return "Moderate visibility improvement expected in marketplace search";
  } else if (improvementCount >= 1) {
    return "Slight visibility improvement expected in some search queries";
  } else {
    return "Minimal visibility improvement as listing is already well-optimized";
  }
}