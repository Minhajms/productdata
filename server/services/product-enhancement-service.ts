import { generateSEOKeywords } from './seo-keyword-service';
import { generateImageAltText } from './image-alt-text-service';
import { checkPolicyCompliance } from './policy-compliance-service';
import { validateProductFields } from './field-validation-service';
import { getMarketplaceGuidelines } from './smart-prompts';

interface EnhancementResult {
  product: any;
  seoKeywords: any;
  imageAltTexts: string[];
  complianceResult: any;
  validationResult: any;
  issues: string[];
  score: number;
}

export async function enhanceProduct(
  product: any,
  marketplace: string
): Promise<EnhancementResult> {
  const issues: string[] = [];
  let score = 100;
  
  // Validate product fields
  const validationResult = await validateProductFields(product, marketplace);
  if (!validationResult.isValid) {
    issues.push(...validationResult.issues.map(issue => issue.message));
    score -= (100 - validationResult.score);
  }
  
  // Check policy compliance
  const complianceResult = await checkPolicyCompliance(product, marketplace);
  if (!complianceResult.isCompliant) {
    issues.push(...complianceResult.issues.map(issue => issue.description));
    score -= (100 - complianceResult.score);
  }
  
  // Generate SEO keywords
  const seoKeywords = await generateSEOKeywords(product, marketplace);
  
  // Generate image alt texts
  const imageAltTexts: string[] = [];
  if (product.images && Array.isArray(product.images)) {
    for (let i = 0; i < product.images.length; i++) {
      const imageContext = {
        url: product.images[i],
        position: i + 1,
        isMainImage: i === 0,
        productType: product.category || 'product',
        brand: product.brand,
        features: product.bullet_points,
        attributes: product.attributes
      };
      
      const altText = await generateImageAltText(imageContext, marketplace);
      imageAltTexts.push(altText);
    }
  }
  
  // Apply enhancements to product
  const enhancedProduct = { ...product };
  
  // Add SEO keywords to product metadata
  enhancedProduct.metadata = {
    ...enhancedProduct.metadata,
    seoKeywords
  };
  
  // Add image alt texts
  enhancedProduct.images = enhancedProduct.images.map((url: string, index: number) => ({
    url,
    altText: imageAltTexts[index] || ''
  }));
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
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

export async function enhanceProducts(
  products: any[],
  marketplace: string
): Promise<EnhancementResult[]> {
  const results: EnhancementResult[] = [];
  
  for (const product of products) {
    try {
      const result = await enhanceProduct(product, marketplace);
      results.push(result);
    } catch (error: any) {
      console.error(`Error enhancing product ${product.product_id}:`, error);
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
  
  return results;
}

export function getEnhancementSummary(results: EnhancementResult[]): {
  totalProducts: number;
  averageScore: number;
  totalIssues: number;
  issueBreakdown: Record<string, number>;
} {
  const totalProducts = results.length;
  const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalProducts;
  const allIssues = results.flatMap(result => result.issues);
  const totalIssues = allIssues.length;
  
  // Count occurrences of each issue type
  const issueBreakdown = allIssues.reduce((acc, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalProducts,
    averageScore,
    totalIssues,
    issueBreakdown
  };
} 