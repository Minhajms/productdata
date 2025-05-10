/**
 * Product Enhancement Service
 * 
 * This is the main service that coordinates all enhancement services
 * to provide comprehensive product data enhancement.
 */

import { generateSEOKeywords } from './seo-keyword-service';
import { generateImageAltText } from './image-alt-text-service';
import { checkPolicyCompliance } from './policy-compliance-service';
import { validateProductFields } from './field-validation-service';
import { getMarketplaceGuidelines } from './smart-prompts';

/**
 * Result of the product enhancement process
 */
interface EnhancementResult {
  product: any;
  seoKeywords: any;
  imageAltTexts: string[];
  complianceResult: any;
  validationResult: any;
  issues: string[];
  score: number;
}

/**
 * Enhance a single product with all enhancement services
 * 
 * @param product Product data to enhance
 * @param marketplace Target marketplace
 * @returns Enhanced product with analysis results
 */
export async function enhanceProduct(
  product: any,
  marketplace: string
): Promise<EnhancementResult> {
  console.log(`Enhancing product ${product.product_id || 'unknown'} for ${marketplace} marketplace`);
  const startTime = Date.now();
  
  const issues: string[] = [];
  let score = 100;
  
  // Step 1: Validate product fields
  console.log('Validating product fields...');
  const validationResult = await validateProductFields(product, marketplace);
  if (!validationResult.isValid) {
    issues.push(...validationResult.issues.map(issue => issue.message));
    score -= (100 - validationResult.score) * 0.3; // 30% weight
  }
  
  // Step 2: Check policy compliance
  console.log('Checking policy compliance...');
  const complianceResult = await checkPolicyCompliance(product, marketplace);
  if (!complianceResult.isCompliant) {
    issues.push(...complianceResult.issues.map(issue => issue.description));
    score -= (100 - complianceResult.score) * 0.3; // 30% weight
  }
  
  // Step 3: Generate SEO keywords
  console.log('Generating SEO keywords...');
  const seoKeywords = await generateSEOKeywords(product, marketplace);
  
  // Step 4: Generate image alt texts
  console.log('Generating image alt texts...');
  const imageAltTexts: string[] = [];
  
  if (product.images && Array.isArray(product.images)) {
    for (let i = 0; i < product.images.length; i++) {
      try {
        // Check if image is URL string or object with URL
        const imageUrl = typeof product.images[i] === 'string' 
          ? product.images[i] 
          : product.images[i].url || '';
        
        if (imageUrl) {
          const imageContext = {
            url: imageUrl,
            position: i + 1,
            isMainImage: i === 0,
            productType: product.category || product.product_type || 'product',
            brand: product.brand,
            features: product.bullet_points,
            attributes: product.attributes
          };
          
          const altText = await generateImageAltText(imageContext, marketplace);
          imageAltTexts.push(altText);
        } else {
          imageAltTexts.push('');
        }
      } catch (error) {
        console.error(`Error generating alt text for image ${i}:`, error);
        imageAltTexts.push('');
      }
    }
  }
  
  // Apply enhancements to product
  const enhancedProduct = { ...product };
  
  // Add SEO keywords to product metadata
  enhancedProduct.metadata = {
    ...enhancedProduct.metadata,
    seoKeywords
  };
  
  // Add image alt texts to images
  if (enhancedProduct.images) {
    enhancedProduct.images = enhancedProduct.images.map((imgData: any, index: number) => {
      // Handle both string URLs and image objects
      if (typeof imgData === 'string') {
        return {
          url: imgData,
          altText: imageAltTexts[index] || ''
        };
      } else if (typeof imgData === 'object') {
        return {
          ...imgData,
          altText: imageAltTexts[index] || imgData.altText || ''
        };
      }
      return imgData;
    });
  }
  
  // Add enhancement metadata
  enhancedProduct.enhancement = {
    marketplace,
    timestamp: new Date().toISOString(),
    validationScore: validationResult.score,
    complianceScore: complianceResult.score,
    enhancementScore: Math.round(score)
  };
  
  // Update status
  enhancedProduct.status = issues.length > 0 ? 'enhanced_with_issues' : 'enhanced';
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
  // Log completion time
  const duration = (Date.now() - startTime) / 1000;
  console.log(`Product enhancement completed in ${duration.toFixed(1)} seconds with score ${Math.round(score)}`);
  
  return {
    product: enhancedProduct,
    seoKeywords,
    imageAltTexts,
    complianceResult,
    validationResult,
    issues,
    score
  };
}

/**
 * Enhance multiple products
 * 
 * @param products Array of products to enhance
 * @param marketplace Target marketplace
 * @returns Array of enhancement results
 */
export async function enhanceProducts(
  products: any[],
  marketplace: string
): Promise<EnhancementResult[]> {
  console.log(`Starting batch enhancement for ${products.length} products on ${marketplace} marketplace`);
  const startTime = Date.now();
  const results: EnhancementResult[] = [];
  
  for (const product of products) {
    try {
      const result = await enhanceProduct(product, marketplace);
      results.push(result);
    } catch (error: any) {
      console.error(`Error enhancing product ${product.product_id || 'unknown'}:`, error);
      results.push({
        product,
        seoKeywords: null,
        imageAltTexts: [],
        complianceResult: null,
        validationResult: null,
        issues: [`Error enhancing product: ${error.message || 'Unknown error'}`],
        score: 0
      });
    }
  }
  
  // Log batch completion
  const duration = (Date.now() - startTime) / 1000;
  console.log(`Batch enhancement completed in ${duration.toFixed(1)} seconds for ${products.length} products`);
  
  return results;
}

/**
 * Get a summary of enhancement results
 * 
 * @param results Array of enhancement results
 * @returns Summary statistics
 */
export function getEnhancementSummary(results: EnhancementResult[]): {
  totalProducts: number;
  enhancedProducts: number;
  productsWithIssues: number;
  averageScore: number;
  totalIssues: number;
  issueBreakdown: Record<string, number>;
  timeStamp: string;
} {
  const totalProducts = results.length;
  const enhancedProducts = results.filter(r => r.score > 0).length;
  const productsWithIssues = results.filter(r => r.issues.length > 0).length;
  const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalProducts;
  
  // Get all issues
  const allIssues = results.flatMap(result => result.issues);
  const totalIssues = allIssues.length;
  
  // Count occurrences of each issue type
  const issueBreakdown = allIssues.reduce((acc, issue) => {
    // Group similar issues by using the first 30 chars as a key
    const issueKey = issue.substring(0, 30) + '...';
    acc[issueKey] = (acc[issueKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalProducts,
    enhancedProducts,
    productsWithIssues,
    averageScore,
    totalIssues,
    issueBreakdown,
    timeStamp: new Date().toISOString()
  };
}