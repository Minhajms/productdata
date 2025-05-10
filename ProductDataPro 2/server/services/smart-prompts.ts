/**
 * Smart Prompts Service
 * 
 * This service contains marketplace-specific prompts, guidelines, and
 * utility functions for generating optimized prompts across different
 * e-commerce platforms.
 */

// System prompts for various AI tasks
export const systemPrompts = {
  // General product content generation
  contentGeneration: `You are an expert e-commerce content specialist with deep knowledge of creating persuasive, detailed, and SEO-optimized product descriptions, titles, and bullets. Focus on highlighting features in terms of benefits, using persuasive language, and creating content that drives both search visibility and conversion rate.`,
  
  // Product research (understanding products with limited information)
  productResearch: `You are a product research expert with extensive knowledge of consumer goods across all major categories. Your task is to analyze limited product information and provide insights about the likely product type, features, target audience, and search terms. Focus on accuracy rather than creativity - avoid inventing specific details not supported by the provided information.`,
  
  // Marketplace optimization
  marketplaceOptimization: `You are an e-commerce marketplace specialist with deep knowledge of major marketplaces like Amazon, eBay, Walmart, Etsy, and Shopify. You understand the specific content requirements, character limits, and optimization strategies that perform best on each platform. Focus on creating content that aligns with marketplace best practices while maximizing search visibility and conversion potential.`,
  
  // CSV analysis
  csvAnalysis: `You are a data specialist focused on product data quality for e-commerce. Your expertise is in analyzing CSV product data, identifying gaps, determining product types, and suggesting improvements that would make listings more effective on marketplaces. Focus on practical, specific insights rather than general advice.`,
  
  // Policy compliance
  policyCompliance: `You are a marketplace policy expert with deep knowledge of content policies for major e-commerce platforms. You specialize in identifying potential policy violations, prohibited content, and restricted claims in product listings. Your analysis helps sellers avoid listing rejections, account warnings, and ensure compliance with platform rules.`
};

// Types of marketplace guidelines
export interface MarketplaceGuidelines {
  keyPoints: string[];
  title: {
    maxLength: number;
    minLength: number;
    bestPractices: string[];
  };
  description: {
    maxLength: number;
    minLength: number;
    bestPractices: string[];
  };
  bulletPoints: {
    maxCount: number;
    maxLength: number;
    bestPractices: string[];
  };
  images: {
    minCount: number;
    maxCount: number;
    formats: string[];
    bestPractices: string[];
  };
  attributes: {
    required: string[];
    recommended: string[];
  };
}

// Guidelines by marketplace
const MARKETPLACE_GUIDELINES: Record<string, MarketplaceGuidelines> = {
  amazon: {
    keyPoints: [
      'Use descriptive titles with important keywords at the beginning',
      'Create detailed bullet points focusing on features and benefits',
      'Include all relevant product specifications and dimensions',
      'Comply with Amazon\'s prohibited content policies',
      'Use high-quality images with white backgrounds for main photos'
    ],
    title: {
      maxLength: 200,
      minLength: 10,
      bestPractices: [
        'Include the brand name',
        'Include key product features',
        'Avoid promotional phrases like "free shipping"',
        'Avoid all caps',
        'Use title case (capitalize first letter of each word)',
        'Don\'t include pricing information'
      ]
    },
    description: {
      maxLength: 2000,
      minLength: 200,
      bestPractices: [
        'Format with paragraphs and bullet points',
        'Include technical specifications',
        'Focus on benefits, not just features',
        'Avoid promotional language',
        'Don\'t include seller information',
        'Don\'t include external links'
      ]
    },
    bulletPoints: {
      maxCount: 5,
      maxLength: 500,
      bestPractices: [
        'Start with a capital letter',
        'Don\'t end with punctuation',
        'Don\'t include promotional language',
        'Focus on unique selling points',
        'Keep each point under 500 characters'
      ]
    },
    images: {
      minCount: 1,
      maxCount: 9,
      formats: ['jpg', 'png', 'gif'],
      bestPractices: [
        'Use high resolution (minimum 1000px on longest side)',
        'Main image should be on white background',
        'Main image should show product only, no accessories',
        'Don\'t include text in images',
        'Don\'t include promotional messages in images'
      ]
    },
    attributes: {
      required: ['title', 'description', 'bullet_points', 'category', 'images'],
      recommended: ['brand', 'color', 'size', 'material', 'item_dimensions', 'weight']
    }
  },
  
  shopify: {
    keyPoints: [
      'Focus on mobile-friendly content and layout',
      'Create unique product descriptions that tell a story',
      'Optimize images for fast loading times',
      'Include clear sizing information and product details',
      'Use structured data for SEO benefits'
    ],
    title: {
      maxLength: 70,
      minLength: 10,
      bestPractices: [
        'Keep it concise but descriptive',
        'Include key search terms',
        'Use your brand name if recognizable',
        'Avoid keyword stuffing',
        'Use title case (capitalize first letter of each word)'
      ]
    },
    description: {
      maxLength: 5000,
      minLength: 100,
      bestPractices: [
        'Use HTML formatting for better readability',
        'Include all relevant product information',
        'Avoid overly promotional language',
        'Group information in logical sections',
        'Include size charts where relevant'
      ]
    },
    bulletPoints: {
      maxCount: 10,
      maxLength: 300,
      bestPractices: [
        'Focus on key features and benefits',
        'Keep format consistent across all points',
        'Highlight unique selling points',
        'Consider using emojis for visual separation',
        'Be specific with details like dimensions, materials, etc.'
      ]
    },
    images: {
      minCount: 1,
      maxCount: 10,
      formats: ['jpg', 'png', 'gif'],
      bestPractices: [
        'Use consistent aspect ratio (recommend square 1:1)',
        'Minimum 2048px on longest side recommended',
        'Include multiple angles',
        'Show product in use when relevant',
        'Consider using lifestyle images'
      ]
    },
    attributes: {
      required: ['title', 'description', 'price', 'images'],
      recommended: ['vendor', 'product_type', 'tags', 'collections', 'variants']
    }
  },
  
  etsy: {
    keyPoints: [
      'Emphasize handmade, unique, and custom qualities',
      'Use long-tail keywords in titles and tags',
      'Tell the story behind your product and creative process',
      'Include specific details about materials and techniques',
      'Add clear information about customization options and timing'
    ],
    title: {
      maxLength: 140,
      minLength: 10,
      bestPractices: [
        'Use all 140 characters for maximum SEO benefit',
        'Include keywords that shoppers would search for',
        'Put most important keywords at the beginning',
        'Balance keyword usage with readability',
        'Avoid excessive punctuation and special characters'
      ]
    },
    description: {
      maxLength: 5000,
      minLength: 100,
      bestPractices: [
        'Format with paragraphs for readability',
        'Include dimensions and materials',
        'Describe how the item is made',
        'Specify customization options if applicable',
        'Include shipping and return information',
        'Tell the product\'s story or inspiration'
      ]
    },
    bulletPoints: {
      maxCount: 5,
      maxLength: 500,
      bestPractices: [
        'Not commonly used on Etsy, but can be included in description',
        'Focus on handmade aspects and uniqueness',
        'Include customization options',
        'Specify materials and dimensions',
        'Mention care instructions'
      ]
    },
    images: {
      minCount: 1,
      maxCount: 10,
      formats: ['jpg', 'png', 'gif'],
      bestPractices: [
        'Minimum 1000px on longest side',
        'Show scale with props when relevant',
        'Show multiple angles',
        'Use natural light when possible',
        'Show detail shots for handmade items',
        'Include lifestyle images showing product in use'
      ]
    },
    attributes: {
      required: ['title', 'description', 'price', 'category', 'images', 'shipping_profile'],
      recommended: ['materials', 'when_made', 'who_made', 'tags', 'processing_time']
    }
  },
  
  ebay: {
    keyPoints: [
      'Use all 80 characters in your item title with relevant keywords',
      'Include specific product identifiers (MPN, UPC, etc.)',
      'Add detailed item specifics for better search visibility',
      'Create professional, thorough descriptions with spacing and formatting',
      'Use high-quality photos from multiple angles'
    ],
    title: {
      maxLength: 80,
      minLength: 10,
      bestPractices: [
        'Include brand, model, size, color when applicable',
        'Use all 80 characters when possible',
        'Include important keywords',
        'Avoid promotional phrases like "wow" or "L@@K"',
        'Avoid special characters and excessive punctuation'
      ]
    },
    description: {
      maxLength: 50000,
      minLength: 100,
      bestPractices: [
        'Include detailed specifications',
        'List any defects or issues honestly',
        'Include shipping policy information',
        'Provide dimensions and measurements',
        'Use simple HTML formatting for readability'
      ]
    },
    bulletPoints: {
      maxCount: 5,
      maxLength: 500,
      bestPractices: [
        'Focus on condition details for used items',
        'Include measurements and specifications',
        'Highlight key features',
        'Mention any accessories included',
        'Note warranty information if applicable'
      ]
    },
    images: {
      minCount: 1,
      maxCount: 12,
      formats: ['jpg', 'png', 'gif'],
      bestPractices: [
        'Minimum 500px on longest side',
        'Show any defects or wear for used items',
        'Include photos of all included accessories',
        'Show product from multiple angles',
        'Avoid stock photos for used items'
      ]
    },
    attributes: {
      required: ['title', 'description', 'price', 'condition', 'images', 'item_specifics'],
      recommended: ['brand', 'model', 'color', 'size', 'material', 'upc', 'mpn']
    }
  },
  
  walmart: {
    keyPoints: [
      'Always include product identifiers like UPC, GTIN, ISBN',
      'Focus on detailed specifications and product dimensions',
      'Use structured bullet points with consistent formatting',
      'Include comprehensive warranty and support information',
      'Optimize all content for Walmart\'s search algorithm'
    ],
    title: {
      maxLength: 200,
      minLength: 10,
      bestPractices: [
        'Format as Brand + Defining Qualities + Item Name + Style + Pack Count',
        'Include key product features or attributes',
        'Avoid promotional language',
        'Use title case',
        'Include size/quantity information'
      ]
    },
    description: {
      maxLength: 4000,
      minLength: 150,
      bestPractices: [
        'Format in clear paragraphs',
        'Include detailed specifications',
        'Focus on product benefits',
        'Avoid promotional language',
        'Don\'t include competitor references',
        'Don\'t include HTML or special formatting'
      ]
    },
    bulletPoints: {
      maxCount: 10,
      maxLength: 100,
      bestPractices: [
        'Start with capital letter',
        'Don\'t end with punctuation',
        'Focus on key selling points',
        'Keep bullets concise - ideally under 100 characters each',
        'Be factual rather than promotional'
      ]
    },
    images: {
      minCount: 1,
      maxCount: 8,
      formats: ['jpg', 'png'],
      bestPractices: [
        'Main image on white background',
        'Minimum 1000x1000 pixels',
        'Show product from multiple angles',
        'Include lifestyle images showing product in use',
        'Show scale when relevant'
      ]
    },
    attributes: {
      required: ['title', 'description', 'product_type', 'brand', 'images', 'price', 'key_features'],
      recommended: ['model_number', 'manufacturer', 'color', 'size', 'upc', 'gtin']
    }
  }
};

/**
 * Get marketplace-specific guidelines
 * @param marketplace Target marketplace
 * @returns Guidelines for the specified marketplace
 */
export function getMarketplaceGuidelines(marketplace: string): MarketplaceGuidelines {
  // Default to Amazon if marketplace not found
  return MARKETPLACE_GUIDELINES[marketplace.toLowerCase()] || MARKETPLACE_GUIDELINES.amazon;
}

/**
 * Generate marketplace-specific system prompt
 * @param marketplace Target marketplace
 * @param promptType Type of prompt to generate
 * @returns System prompt for AI
 */
export function generateMarketplaceSystemPrompt(
  marketplace: string,
  promptType: string
): string {
  const marketplaceLC = marketplace.toLowerCase();
  
  // Base system prompt
  let systemPrompt = `You are an expert e-commerce product content specialist for ${marketplace} marketplace. `;
  
  // Add marketplace-specific guidance
  switch (marketplaceLC) {
    case 'amazon':
      systemPrompt += `You have deep knowledge of Amazon's A9 algorithm, search ranking factors, and content guidelines. `;
      break;
    case 'shopify':
      systemPrompt += `You understand how to create compelling product content that converts visitors to customers on Shopify stores. `;
      break;
    case 'etsy':
      systemPrompt += `You specialize in highlighting handmade, vintage, and unique aspects of products that perform well on Etsy. `;
      break;
    case 'ebay':
      systemPrompt += `You understand eBay's search algorithm and how to create listings that stand out in competitive categories. `;
      break;
    case 'walmart':
      systemPrompt += `You know Walmart Marketplace content requirements and how to optimize product listings for their search system. `;
      break;
  }
  
  // Add prompt type-specific guidance
  switch (promptType.toLowerCase()) {
    case 'title':
      systemPrompt += `You excel at creating product titles that optimize for both search visibility and conversion rate, carefully balancing keyword placement with compelling, customer-focused language.`;
      break;
    case 'description':
      systemPrompt += `You craft detailed, well-structured product descriptions that highlight benefits, overcome objections, and provide all necessary information while maintaining readability and search optimization.`;
      break;
    case 'bullets':
      systemPrompt += `You create concise, benefit-focused bullet points that highlight the most important product features in a way that addresses customer needs and pain points.`;
      break;
    case 'keywords':
      systemPrompt += `You identify the most effective search keywords for products, including both high-volume terms and long-tail opportunities that will increase visibility to targeted customers.`;
      break;
    case 'compliance':
      systemPrompt += `You thoroughly check product listings for policy compliance issues, identifying prohibited content, potential trademark issues, restricted claims, and other marketplace policy violations.`;
      break;
    case 'validation':
      systemPrompt += `You validate product data against marketplace requirements and best practices, identifying missing required fields, format issues, and optimization opportunities.`;
      break;
    default:
      systemPrompt += `You provide expert guidance on creating high-quality product content that meets marketplace requirements and resonates with customers.`;
  }
  
  return systemPrompt;
}