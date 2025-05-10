/**
 * Policy Compliance Service
 * 
 * This service checks product listings for compliance with marketplace policies,
 * detects potential issues, and provides recommendations for fixes.
 */

import { getMarketplaceGuidelines, generateMarketplaceSystemPrompt } from './smart-prompts';
import { callOpenRouter } from './enhanced-openrouter-service';

/**
 * Interface for compliance issues
 */
interface ComplianceIssue {
  type: 'critical' | 'warning' | 'suggestion';
  field: string;
  description: string;
  location?: string;
  recommendation: string;
  policyReference?: string;
}

/**
 * Interface for compliance check results
 */
interface ComplianceResult {
  score: number;
  issues: ComplianceIssue[];
  isCompliant: boolean;
}

// Prohibited terms and phrases by marketplace
const PROHIBITED_TERMS: Record<string, string[]> = {
  amazon: [
    'best seller', 'best-selling', 'top rated', 'number one',
    'cheapest', 'lowest price', 'free shipping', 'sale',
    'discount', 'limited time', 'while supplies last'
  ],
  shopify: [
    'best seller', 'best-selling', 'top rated', 'number one'
  ],
  etsy: [
    'best seller', 'best-selling', 'top rated', 'number one',
    'cheapest', 'lowest price'
  ],
  ebay: [
    'best seller', 'L@@K', '***', 'contact me', 'email me',
    'outside of ebay', 'paypal', 'avoid fees'
  ],
  walmart: [
    'best seller', 'top seller', 'amazon', 'ebay', 'free shipping',
    'limited time', 'clearance', 'sale'
  ]
};

// Medical claims that require verification
const MEDICAL_CLAIMS = [
  'cures', 'treats', 'heals', 'prevents', 'relieves',
  'reduces', 'eliminates', 'improves', 'enhances', 'strengthens',
  'therapy', 'therapeutic', 'medicinal', 'remedy', 'medicine',
  'health benefit', 'clinically proven', 'doctor recommended'
];

/**
 * Check product listing for policy compliance issues
 * 
 * @param product Product data to check
 * @param marketplace Target marketplace
 * @returns Compliance check results
 */
export async function checkPolicyCompliance(
  product: any,
  marketplace: string
): Promise<ComplianceResult> {
  try {
    // Try AI-powered compliance check first
    return await aiPoweredComplianceCheck(product, marketplace);
  } catch (error) {
    console.error('AI-powered compliance check failed, using fallback:', error);
    // Fall back to rule-based check if AI fails
    return ruleBasedComplianceCheck(product, marketplace);
  }
}

/**
 * Run an AI-powered compliance check using OpenRouter
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Compliance check results
 */
async function aiPoweredComplianceCheck(
  product: any,
  marketplace: string
): Promise<ComplianceResult> {
  // Get system prompt for compliance checking
  const systemPrompt = generateMarketplaceSystemPrompt(marketplace, 'compliance');
  
  // Format product data for analysis
  const productDetails = formatProductForCompliance(product);
  
  // Generate user prompt
  const userPrompt = `
As a ${marketplace} policy compliance expert, analyze this product listing for potential policy violations or optimization issues.

Full Product Listing:
${productDetails}

Check for these specific compliance issues:
1. Prohibited content or restricted product categories
2. Trademark or copyright violations in text
3. Inappropriate claims (medical, comparative, superlative)
4. Prohibited terms or phrases in title/description
5. Missing required information for this product category
6. Character count/formatting issues for specific fields
7. Category-specific requirements violations

Also evaluate against ${marketplace}'s quality guidelines:
1. Keyword stuffing or repetition
2. Poor readability or formatting issues
3. Vague or generic content
4. Missing key product attributes

For each issue found, provide:
- Specific policy violation or recommendation
- Exact location in the listing (field and content)
- Suggested correction or improvement

Return in JSON format:
{
  "compliance_score": 0-100,
  "critical_issues": [
    {
      "type": "critical",
      "field": "field_name",
      "description": "Issue description",
      "location": "specific location",
      "recommendation": "How to fix it",
      "policy_reference": "Policy name or URL"
    }
  ],
  "warnings": [
    {
      "type": "warning",
      "field": "field_name",
      "description": "Issue description",
      "location": "specific location",
      "recommendation": "How to fix it"
    }
  ],
  "suggestions": [
    {
      "type": "suggestion",
      "field": "field_name",
      "description": "Suggestion description",
      "recommendation": "How to improve"
    }
  ],
  "is_compliant": true/false
}
`;
  
  // Call AI for compliance check
  const response = await callOpenRouter(systemPrompt, userPrompt, "anthropic/claude-3-5-sonnet");
  
  try {
    // Parse response
    const result = JSON.parse(response);
    
    // Validate and format response
    const issues: ComplianceIssue[] = [];
    
    // Add critical issues
    if (result.critical_issues && Array.isArray(result.critical_issues)) {
      issues.push(...result.critical_issues.map((issue: any) => ({
        type: 'critical',
        field: issue.field || 'unknown',
        description: issue.description || 'Unknown issue',
        location: issue.location,
        recommendation: issue.recommendation || 'Review and fix this issue',
        policyReference: issue.policy_reference
      })));
    }
    
    // Add warnings
    if (result.warnings && Array.isArray(result.warnings)) {
      issues.push(...result.warnings.map((issue: any) => ({
        type: 'warning',
        field: issue.field || 'unknown',
        description: issue.description || 'Unknown issue',
        location: issue.location,
        recommendation: issue.recommendation || 'Consider fixing this issue',
        policyReference: issue.policy_reference
      })));
    }
    
    // Add suggestions
    if (result.suggestions && Array.isArray(result.suggestions)) {
      issues.push(...result.suggestions.map((issue: any) => ({
        type: 'suggestion',
        field: issue.field || 'unknown',
        description: issue.description || 'Unknown suggestion',
        location: issue.location,
        recommendation: issue.recommendation || 'Consider this improvement',
        policyReference: issue.policy_reference
      })));
    }
    
    // Calculate score
    const score = typeof result.compliance_score === 'number' 
      ? Math.max(0, Math.min(100, result.compliance_score))
      : calculateComplianceScore(issues);
    
    // Determine compliance status
    const isCompliant = typeof result.is_compliant === 'boolean'
      ? result.is_compliant
      : (score >= 70);
    
    return {
      score,
      issues,
      isCompliant
    };
  } catch (parseError) {
    console.error('Error parsing compliance check response:', parseError);
    throw parseError; // Let it fall back to rule-based check
  }
}

/**
 * Format product data for compliance check
 * @param product Product data
 * @returns Formatted product string
 */
function formatProductForCompliance(product: any): string {
  let details = '';
  
  // Add product ID
  if (product.product_id) {
    details += `Product ID: ${product.product_id}\n`;
  }
  
  // Add title
  if (product.title) {
    details += `Title: ${product.title}\n`;
  }
  
  // Add description
  if (product.description) {
    details += `Description: ${product.description}\n\n`;
  }
  
  // Add brand
  if (product.brand) {
    details += `Brand: ${product.brand}\n`;
  }
  
  // Add category
  if (product.category) {
    details += `Category: ${product.category}\n`;
  }
  
  // Add price
  if (product.price) {
    details += `Price: ${product.price}\n`;
  }
  
  // Add bullet points
  if (product.bullet_points && product.bullet_points.length > 0) {
    details += 'Bullet Points:\n';
    product.bullet_points.forEach((point: string, index: number) => {
      details += `${index + 1}. ${point}\n`;
    });
    details += '\n';
  }
  
  // Add attributes
  if (product.attributes && Object.keys(product.attributes).length > 0) {
    details += 'Attributes:\n';
    Object.entries(product.attributes).forEach(([key, value]) => {
      details += `- ${key}: ${value}\n`;
    });
  }
  
  return details;
}

/**
 * Rule-based compliance check (fallback when AI fails)
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Compliance check results
 */
function ruleBasedComplianceCheck(
  product: any,
  marketplace: string
): ComplianceResult {
  const issues: ComplianceIssue[] = [];
  let score = 100;
  
  // Check title compliance
  if (product.title) {
    const titleIssues = checkTitleCompliance(product.title, marketplace);
    issues.push(...titleIssues);
    score -= titleIssues.length * 5;
  }
  
  // Check description compliance
  if (product.description) {
    const descriptionIssues = checkDescriptionCompliance(product.description, marketplace);
    issues.push(...descriptionIssues);
    score -= descriptionIssues.length * 5;
  }
  
  // Check bullet points compliance
  if (product.bullet_points && Array.isArray(product.bullet_points)) {
    const bulletPointIssues = checkBulletPointsCompliance(product.bullet_points, marketplace);
    issues.push(...bulletPointIssues);
    score -= bulletPointIssues.length * 3;
  }
  
  // Check for medical claims
  const medicalClaimIssues = checkMedicalClaims(product);
  issues.push(...medicalClaimIssues);
  score -= medicalClaimIssues.length * 10;
  
  // Check for prohibited terms
  const prohibitedTermIssues = checkProhibitedTerms(product, marketplace);
  issues.push(...prohibitedTermIssues);
  score -= prohibitedTermIssues.length * 8;
  
  // Check for missing required fields
  const missingFieldIssues = checkRequiredFields(product, marketplace);
  issues.push(...missingFieldIssues);
  score -= missingFieldIssues.length * 10;
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
  return {
    score,
    issues,
    isCompliant: score >= 70
  };
}

/**
 * Check title compliance with marketplace guidelines
 * @param title Product title
 * @param marketplace Target marketplace
 * @returns Compliance issues
 */
function checkTitleCompliance(title: string, marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  
  // Get guidelines
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check length
  if (title.length > guidelines.title.maxLength) {
    issues.push({
      type: 'critical',
      field: 'title',
      description: `Title exceeds maximum length of ${guidelines.title.maxLength} characters`,
      location: 'title',
      recommendation: `Shorten title to ${guidelines.title.maxLength} characters or less`
    });
  }
  
  // Check for too short titles
  if (title.length < 10) {
    issues.push({
      type: 'warning',
      field: 'title',
      description: 'Title is too short (less than 10 characters)',
      location: 'title',
      recommendation: 'Expand title to include more product information'
    });
  }
  
  // Check for ALL CAPS
  if (title === title.toUpperCase() && title.length > 10) {
    issues.push({
      type: 'warning',
      field: 'title',
      description: 'Title uses ALL CAPS',
      location: 'title',
      recommendation: 'Use title case instead of ALL CAPS'
    });
  }
  
  // Check for prohibited terms
  const prohibitedTerms = PROHIBITED_TERMS[marketplace.toLowerCase()] || [];
  prohibitedTerms.forEach(term => {
    if (title.toLowerCase().includes(term.toLowerCase())) {
      issues.push({
        type: 'warning',
        field: 'title',
        description: `Title contains prohibited term: "${term}"`,
        location: 'title',
        recommendation: `Remove or replace the term "${term}"`
      });
    }
  });
  
  return issues;
}

/**
 * Check description compliance with marketplace guidelines
 * @param description Product description
 * @param marketplace Target marketplace
 * @returns Compliance issues
 */
function checkDescriptionCompliance(description: string, marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  
  // Get guidelines
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check length
  if (description.length > guidelines.description.maxLength) {
    issues.push({
      type: 'critical',
      field: 'description',
      description: `Description exceeds maximum length of ${guidelines.description.maxLength} characters`,
      location: 'description',
      recommendation: `Shorten description to ${guidelines.description.maxLength} characters or less`
    });
  }
  
  // Check for too short descriptions
  if (description.length < guidelines.description.minLength) {
    issues.push({
      type: 'warning',
      field: 'description',
      description: `Description is too short (less than ${guidelines.description.minLength} characters)`,
      location: 'description',
      recommendation: `Expand description to at least ${guidelines.description.minLength} characters`
    });
  }
  
  // Check for prohibited terms
  const prohibitedTerms = PROHIBITED_TERMS[marketplace.toLowerCase()] || [];
  prohibitedTerms.forEach(term => {
    if (description.toLowerCase().includes(term.toLowerCase())) {
      issues.push({
        type: 'warning',
        field: 'description',
        description: `Description contains prohibited term: "${term}"`,
        location: 'description',
        recommendation: `Remove or replace the term "${term}"`
      });
    }
  });
  
  // Check for external URLs (prohibited on most marketplaces)
  const urlRegex = /(https?:\/\/\S+)/gi;
  if (urlRegex.test(description)) {
    issues.push({
      type: 'critical',
      field: 'description',
      description: 'Description contains external URLs',
      location: 'description',
      recommendation: 'Remove external URLs from the description'
    });
  }
  
  // Check for email addresses (prohibited on most marketplaces)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  if (emailRegex.test(description)) {
    issues.push({
      type: 'critical',
      field: 'description',
      description: 'Description contains email addresses',
      location: 'description',
      recommendation: 'Remove email addresses from the description'
    });
  }
  
  return issues;
}

/**
 * Check bullet points compliance with marketplace guidelines
 * @param bulletPoints Bullet points array
 * @param marketplace Target marketplace
 * @returns Compliance issues
 */
function checkBulletPointsCompliance(bulletPoints: string[], marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  
  // Get guidelines
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check number of bullet points
  if (bulletPoints.length > guidelines.bulletPoints.maxCount) {
    issues.push({
      type: 'warning',
      field: 'bullet_points',
      description: `Too many bullet points (${bulletPoints.length} > ${guidelines.bulletPoints.maxCount})`,
      location: 'bullet_points',
      recommendation: `Reduce to ${guidelines.bulletPoints.maxCount} bullet points or less`
    });
  }
  
  // Check each bullet point
  bulletPoints.forEach((point, index) => {
    // Check length
    if (point.length > guidelines.bulletPoints.maxLength) {
      issues.push({
        type: 'warning',
        field: 'bullet_points',
        description: `Bullet point ${index + 1} exceeds maximum length of ${guidelines.bulletPoints.maxLength} characters`,
        location: `bullet_points[${index}]`,
        recommendation: `Shorten bullet point to ${guidelines.bulletPoints.maxLength} characters or less`
      });
    }
    
    // Check for prohibited terms
    const prohibitedTerms = PROHIBITED_TERMS[marketplace.toLowerCase()] || [];
    prohibitedTerms.forEach(term => {
      if (point.toLowerCase().includes(term.toLowerCase())) {
        issues.push({
          type: 'warning',
          field: 'bullet_points',
          description: `Bullet point ${index + 1} contains prohibited term: "${term}"`,
          location: `bullet_points[${index}]`,
          recommendation: `Remove or replace the term "${term}"`
        });
      }
    });
  });
  
  return issues;
}

/**
 * Check for medical claims in product content
 * @param product Product data
 * @returns Compliance issues
 */
function checkMedicalClaims(product: any): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  
  // Combine all text fields for checking
  const textToCheck = [
    product.title || '',
    product.description || '',
    ...(product.bullet_points || [])
  ].join(' ').toLowerCase();
  
  // Check for medical claims
  MEDICAL_CLAIMS.forEach(claim => {
    const regex = new RegExp(`\\b${claim}\\b`, 'i');
    if (regex.test(textToCheck)) {
      issues.push({
        type: 'critical',
        field: 'content',
        description: `Content contains unverified medical claim: "${claim}"`,
        recommendation: 'Remove or modify medical claims unless you have proper verification',
        policyReference: 'Medical Claims Policy'
      });
    }
  });
  
  return issues;
}

/**
 * Check for prohibited terms in product content
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Compliance issues
 */
function checkProhibitedTerms(product: any, marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const prohibitedTerms = PROHIBITED_TERMS[marketplace.toLowerCase()] || [];
  
  // Define fields to check
  const fieldsToCheck = {
    title: product.title || '',
    description: product.description || '',
    bullet_points: (product.bullet_points || []).join(' ')
  };
  
  // Check each field
  Object.entries(fieldsToCheck).forEach(([field, content]) => {
    const contentStr = String(content).toLowerCase();
    
    prohibitedTerms.forEach(term => {
      const regex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'i');
      if (regex.test(contentStr)) {
        issues.push({
          type: 'warning',
          field,
          description: `Content contains prohibited term: "${term}"`,
          recommendation: `Remove or replace the term "${term}"`
        });
      }
    });
  });
  
  return issues;
}

/**
 * Check for missing required fields
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Compliance issues
 */
function checkRequiredFields(product: any, marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  
  // Get required fields for this marketplace
  const guidelines = getMarketplaceGuidelines(marketplace);
  const requiredFields = guidelines.attributes.required;
  
  // Check each required field
  requiredFields.forEach(field => {
    if (!product[field] || 
        (typeof product[field] === 'string' && product[field].trim() === '') ||
        (Array.isArray(product[field]) && product[field].length === 0)) {
      issues.push({
        type: 'critical',
        field,
        description: `Required field "${field}" is missing`,
        recommendation: `Add the required "${field}" field to the product data`
      });
    }
  });
  
  return issues;
}

/**
 * Calculate compliance score based on issues
 * @param issues Array of compliance issues
 * @returns Compliance score (0-100)
 */
function calculateComplianceScore(issues: ComplianceIssue[]): number {
  let score = 100;
  
  // Deduct points for each issue based on severity
  issues.forEach(issue => {
    switch (issue.type) {
      case 'critical':
        score -= 10;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'suggestion':
        score -= 2;
        break;
    }
  });
  
  // Ensure score doesn't go below 0
  return Math.max(0, score);
}