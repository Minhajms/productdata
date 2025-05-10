/**
 * Field Validation Service
 * 
 * This service validates product fields against marketplace requirements,
 * identifies issues, and provides recommendations for improvement.
 */

import { getMarketplaceGuidelines, generateMarketplaceSystemPrompt } from './smart-prompts';
import { callOpenRouter } from './enhanced-openrouter-service';

/**
 * Interface for validation issues
 */
interface ValidationIssue {
  field: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  recommendation?: string;
}

/**
 * Interface for validation results
 */
interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  missingFields: string[];
  score: number;
}

/**
 * Validate product fields against marketplace requirements
 * 
 * @param product Product data to validate
 * @param marketplace Target marketplace
 * @returns Validation results
 */
export async function validateProductFields(
  product: any,
  marketplace: string
): Promise<ValidationResult> {
  try {
    // Try AI-powered validation first
    return await aiPoweredFieldValidation(product, marketplace);
  } catch (error) {
    console.error('AI-powered field validation failed, using fallback:', error);
    // Fall back to rule-based validation if AI fails
    return ruleBasedFieldValidation(product, marketplace);
  }
}

/**
 * Run an AI-powered field validation using OpenRouter
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Validation results
 */
async function aiPoweredFieldValidation(
  product: any,
  marketplace: string
): Promise<ValidationResult> {
  // Create system prompt for validation
  const systemPrompt = `You are a data quality specialist for ${marketplace} marketplace. Your job is to analyze product listings for quality, completeness, and marketplace readiness. You have expert knowledge of ${marketplace}'s requirements and best practices for product listings.`;
  
  // Format product fields for analysis
  const productFields = formatProductForValidation(product);
  
  // Generate user prompt
  const userPrompt = `
Analyze these product fields for quality and marketplace readiness on ${marketplace}.

Product Fields:
${productFields}

For each field, provide:
1. QUALITY SCORE (1-10): Rating based on completeness, accuracy, and marketplace standards
2. ISSUES: Any specific problems with the field content
3. IMPROVEMENT: Specific suggestions to improve the field

Focus on these critical aspects:
- TITLE: Length, keyword placement, readability, search relevance
- DESCRIPTION: Completeness, benefit focus, scannability, unique content
- BULLET POINTS: Specificity, benefit-feature connection, uniqueness
- CATEGORY: Accuracy, specificity, optimal placement

Also identify any MISSING REQUIRED FIELDS for ${marketplace}.

Return a comprehensive analysis in this JSON format:
{
  "overall_score": 0-100,
  "field_analysis": {
    "title": {
      "score": 1-10,
      "issues": ["Issue 1", "Issue 2"],
      "recommendation": "Specific suggestion to improve"
    },
    "description": {
      "score": 1-10,
      "issues": [],
      "recommendation": ""
    }
  },
  "missing_fields": ["field1", "field2"],
  "priority_improvements": [
    "Most important fix 1",
    "Most important fix 2",
    "Most important fix 3"
  ],
  "is_valid": true/false
}
`;
  
  // Call AI for field validation
  const response = await callOpenRouter(systemPrompt, userPrompt, "anthropic/claude-3-5-sonnet");
  
  try {
    // Parse response
    const result = JSON.parse(response);
    
    // Extract issues from field analysis
    const issues: ValidationIssue[] = [];
    const missingFields: string[] = Array.isArray(result.missing_fields) ? result.missing_fields : [];
    
    // Process field analysis
    if (result.field_analysis && typeof result.field_analysis === 'object') {
      Object.entries(result.field_analysis).forEach(([field, analysis]: [string, any]) => {
        // Add issues from each field
        if (analysis.issues && Array.isArray(analysis.issues)) {
          analysis.issues.forEach((issue: string) => {
            issues.push({
              field,
              type: analysis.score < 5 ? 'error' : analysis.score < 8 ? 'warning' : 'info',
              message: issue,
              recommendation: analysis.recommendation
            });
          });
        }
      });
    }
    
    // Add missing fields as issues
    missingFields.forEach(field => {
      issues.push({
        field,
        type: 'error',
        message: `Required field "${field}" is missing`,
        recommendation: `Add the required "${field}" field`
      });
    });
    
    // Calculate score
    const score = typeof result.overall_score === 'number' 
      ? Math.max(0, Math.min(100, result.overall_score))
      : calculateValidationScore(issues, missingFields);
    
    // Determine validity
    const isValid = typeof result.is_valid === 'boolean'
      ? result.is_valid
      : (score >= 70 && missingFields.length === 0);
    
    return {
      isValid,
      issues,
      missingFields,
      score
    };
  } catch (parseError) {
    console.error('Error parsing field validation response:', parseError);
    throw parseError; // Let it fall back to rule-based validation
  }
}

/**
 * Format product data for field validation
 * @param product Product data
 * @returns Formatted product string
 */
function formatProductForValidation(product: any): string {
  let details = '';
  
  // Add each field with its value
  Object.entries(product).forEach(([field, value]) => {
    // Skip complex nested objects or empty arrays
    if (value === null || value === undefined) {
      return;
    }
    
    if (typeof value === 'string') {
      details += `${field}: ${value}\n`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      details += `${field}: ${value}\n`;
    } else if (Array.isArray(value)) {
      // Only show non-empty arrays
      if (value.length > 0) {
        if (typeof value[0] === 'string') {
          details += `${field}: [${value.join(', ')}]\n`;
        } else {
          details += `${field}: [Array with ${value.length} items]\n`;
        }
      }
    } else if (typeof value === 'object') {
      details += `${field}: ${JSON.stringify(value)}\n`;
    }
  });
  
  return details;
}

/**
 * Rule-based field validation (fallback when AI fails)
 * @param product Product data
 * @param marketplace Target marketplace
 * @returns Validation results
 */
function ruleBasedFieldValidation(
  product: any,
  marketplace: string
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const missingFields: string[] = [];
  let score = 100;
  
  // Get marketplace guidelines
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check required fields
  guidelines.attributes.required.forEach(field => {
    if (!product[field] || 
        (typeof product[field] === 'string' && product[field].trim() === '') ||
        (Array.isArray(product[field]) && product[field].length === 0)) {
      missingFields.push(field);
      issues.push({
        field,
        type: 'error',
        message: `Required field "${field}" is missing`,
        recommendation: `Add the required ${field} field`
      });
      score -= 10;
    }
  });
  
  // Validate field formats
  if (product.title) {
    const titleIssues = validateTitle(product.title, marketplace);
    issues.push(...titleIssues);
    score -= titleIssues.length * 5;
  }
  
  if (product.description) {
    const descriptionIssues = validateDescription(product.description, marketplace);
    issues.push(...descriptionIssues);
    score -= descriptionIssues.length * 5;
  }
  
  if (product.bullet_points && Array.isArray(product.bullet_points)) {
    const bulletPointIssues = validateBulletPoints(product.bullet_points, marketplace);
    issues.push(...bulletPointIssues);
    score -= bulletPointIssues.length * 3;
  }
  
  if (product.images && Array.isArray(product.images)) {
    const imageIssues = validateImages(product.images, marketplace);
    issues.push(...imageIssues);
    score -= imageIssues.length * 5;
  }
  
  if (product.price) {
    const priceIssues = validatePrice(product.price, marketplace);
    issues.push(...priceIssues);
    score -= priceIssues.length * 5;
  }
  
  // Validate attributes
  if (product.attributes && typeof product.attributes === 'object') {
    const attributeIssues = validateAttributes(product.attributes, marketplace);
    issues.push(...attributeIssues);
    score -= attributeIssues.length * 2;
  }
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
  return {
    isValid: score >= 70 && missingFields.length === 0,
    issues,
    missingFields,
    score
  };
}

/**
 * Validate product title
 * @param title Product title
 * @param marketplace Target marketplace
 * @returns Validation issues
 */
function validateTitle(title: string, marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check title length
  if (title.length > guidelines.title.maxLength) {
    issues.push({
      field: 'title',
      type: 'error',
      message: `Title exceeds maximum length of ${guidelines.title.maxLength} characters`,
      recommendation: `Shorten title to ${guidelines.title.maxLength} characters or less`
    });
  }
  
  // Check for short titles
  if (title.length < 10) {
    issues.push({
      field: 'title',
      type: 'warning',
      message: 'Title is too short (less than 10 characters)',
      recommendation: 'Add more descriptive content to the title'
    });
  }
  
  // Check for ALL CAPS
  if (title === title.toUpperCase() && title.length > 5) {
    issues.push({
      field: 'title',
      type: 'warning',
      message: 'Title uses all capital letters',
      recommendation: 'Use title case instead of ALL CAPS'
    });
  }
  
  // Check for excessive punctuation
  if ((title.match(/[!?]/g) || []).length > 2) {
    issues.push({
      field: 'title',
      type: 'warning',
      message: 'Title contains excessive punctuation',
      recommendation: 'Remove excessive punctuation marks'
    });
  }
  
  return issues;
}

/**
 * Validate product description
 * @param description Product description
 * @param marketplace Target marketplace
 * @returns Validation issues
 */
function validateDescription(description: string, marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check description length
  if (description.length > guidelines.description.maxLength) {
    issues.push({
      field: 'description',
      type: 'error',
      message: `Description exceeds maximum length of ${guidelines.description.maxLength} characters`,
      recommendation: `Shorten description to ${guidelines.description.maxLength} characters or less`
    });
  }
  
  // Check for short descriptions
  if (description.length < guidelines.description.minLength) {
    issues.push({
      field: 'description',
      type: 'warning',
      message: `Description is too short (less than ${guidelines.description.minLength} characters)`,
      recommendation: `Add more descriptive content to reach at least ${guidelines.description.minLength} characters`
    });
  }
  
  // Check for excessive ALL CAPS
  const capsMatches = description.match(/[A-Z]{4,}/g) || [];
  if (capsMatches.length > 3) {
    issues.push({
      field: 'description',
      type: 'warning',
      message: 'Description contains excessive use of ALL CAPS',
      recommendation: 'Minimize use of all capital letters for better readability'
    });
  }
  
  // Check for placeholder text
  const placeholderPhrases = ['lorem ipsum', 'add description here', 'product description'];
  for (const phrase of placeholderPhrases) {
    if (description.toLowerCase().includes(phrase)) {
      issues.push({
        field: 'description',
        type: 'error',
        message: `Description contains placeholder text: "${phrase}"`,
        recommendation: 'Replace placeholder text with actual product description'
      });
      break;
    }
  }
  
  // Check for readability (very long paragraphs)
  if (description.includes('\n\n') === false && description.length > 300) {
    issues.push({
      field: 'description',
      type: 'warning',
      message: 'Description lacks paragraph breaks, reducing readability',
      recommendation: 'Break description into shorter paragraphs for better readability'
    });
  }
  
  return issues;
}

/**
 * Validate product bullet points
 * @param bulletPoints Array of bullet points
 * @param marketplace Target marketplace
 * @returns Validation issues
 */
function validateBulletPoints(bulletPoints: string[], marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check number of bullet points
  if (bulletPoints.length > guidelines.bulletPoints.maxCount) {
    issues.push({
      field: 'bullet_points',
      type: 'warning',
      message: `Too many bullet points (${bulletPoints.length} > ${guidelines.bulletPoints.maxCount})`,
      recommendation: `Reduce to ${guidelines.bulletPoints.maxCount} bullet points or less`
    });
  }
  
  // Check each bullet point
  bulletPoints.forEach((point, index) => {
    // Check length
    if (point.length > guidelines.bulletPoints.maxLength) {
      issues.push({
        field: 'bullet_points',
        type: 'warning',
        message: `Bullet point ${index + 1} exceeds maximum length of ${guidelines.bulletPoints.maxLength} characters`,
        recommendation: `Shorten bullet point to ${guidelines.bulletPoints.maxLength} characters or less`
      });
    }
    
    // Check for very short bullet points
    if (point.length < 5) {
      issues.push({
        field: 'bullet_points',
        type: 'warning',
        message: `Bullet point ${index + 1} is too short`,
        recommendation: 'Make bullet points more descriptive'
      });
    }
    
    // Check for duplicates
    for (let i = 0; i < bulletPoints.length; i++) {
      if (i !== index && bulletPoints[i].toLowerCase() === point.toLowerCase()) {
        issues.push({
          field: 'bullet_points',
          type: 'error',
          message: `Bullet point ${index + 1} is a duplicate of bullet point ${i + 1}`,
          recommendation: 'Remove or replace duplicate bullet points'
        });
        break;
      }
    }
  });
  
  return issues;
}

/**
 * Validate product images
 * @param images Array of image URLs
 * @param marketplace Target marketplace
 * @returns Validation issues
 */
function validateImages(images: string[], marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check number of images
  if (images.length < guidelines.images.minCount) {
    issues.push({
      field: 'images',
      type: 'error',
      message: `Not enough images (${images.length} < ${guidelines.images.minCount})`,
      recommendation: `Add at least ${guidelines.images.minCount} ${images.length === 0 ? 'image' : 'more images'}`
    });
  }
  
  if (images.length > guidelines.images.maxCount) {
    issues.push({
      field: 'images',
      type: 'warning',
      message: `Too many images (${images.length} > ${guidelines.images.maxCount})`,
      recommendation: `Reduce to ${guidelines.images.maxCount} images or less`
    });
  }
  
  // Check each image URL
  images.forEach((url, index) => {
    // Check for placeholder or default image URLs
    const placeholderPatterns = [
      'placeholder', 'default', 'no-image', 'sample', 'example', 'missing'
    ];
    
    for (const pattern of placeholderPatterns) {
      if (url.toLowerCase().includes(pattern)) {
        issues.push({
          field: 'images',
          type: 'error',
          message: `Image ${index + 1} appears to be a placeholder image`,
          recommendation: 'Replace placeholder images with actual product images'
        });
        break;
      }
    }
    
    // Check for supported file formats
    const supportedFormats = guidelines.images.formats.map(format => format.toLowerCase());
    let hasValidFormat = false;
    
    for (const format of supportedFormats) {
      if (url.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
        hasValidFormat = true;
        break;
      }
    }
    
    if (!hasValidFormat && !url.includes('data:image/')) {
      issues.push({
        field: 'images',
        type: 'warning',
        message: `Image ${index + 1} may not be in a supported format (${supportedFormats.join(', ')})`,
        recommendation: `Ensure image is in a supported format: ${supportedFormats.join(', ')}`
      });
    }
  });
  
  return issues;
}

/**
 * Validate product price
 * @param price Product price
 * @param marketplace Target marketplace
 * @returns Validation issues
 */
function validatePrice(price: string | number, marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check for valid number
  if (isNaN(numPrice)) {
    issues.push({
      field: 'price',
      type: 'error',
      message: 'Invalid price format',
      recommendation: 'Enter a valid numeric price'
    });
  } else {
    // Check for negative or zero price
    if (numPrice <= 0) {
      issues.push({
        field: 'price',
        type: 'error',
        message: 'Price must be greater than 0',
        recommendation: 'Enter a valid price greater than 0'
      });
    }
    
    // Check for unrealistically high price
    if (numPrice > 100000) {
      issues.push({
        field: 'price',
        type: 'warning',
        message: 'Price is unusually high',
        recommendation: 'Verify that the price is correct'
      });
    }
  }
  
  return issues;
}

/**
 * Validate product attributes
 * @param attributes Product attributes
 * @param marketplace Target marketplace
 * @returns Validation issues
 */
function validateAttributes(attributes: Record<string, any>, marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const guidelines = getMarketplaceGuidelines(marketplace);
  
  // Check for missing recommended attributes
  guidelines.attributes.recommended.forEach(attr => {
    if (!attributes[attr]) {
      issues.push({
        field: 'attributes',
        type: 'warning',
        message: `Missing recommended attribute: ${attr}`,
        recommendation: `Add the ${attr} attribute for better listing quality`
      });
    }
  });
  
  // Check attribute values
  Object.entries(attributes).forEach(([key, value]) => {
    // Check for empty values
    if (value === '' || value === null) {
      issues.push({
        field: 'attributes',
        type: 'warning',
        message: `Attribute "${key}" has an empty value`,
        recommendation: `Provide a value for the ${key} attribute or remove it`
      });
    }
    
    // Check for placeholder values
    if (typeof value === 'string' && 
        ['tbd', 'n/a', 'none', 'unknown', 'not specified'].includes(value.toLowerCase())) {
      issues.push({
        field: 'attributes',
        type: 'warning',
        message: `Attribute "${key}" has a placeholder value: "${value}"`,
        recommendation: `Replace placeholder value with actual information`
      });
    }
  });
  
  return issues;
}

/**
 * Calculate validation score based on issues and missing fields
 * @param issues Array of validation issues
 * @param missingFields Array of missing fields
 * @returns Validation score (0-100)
 */
function calculateValidationScore(issues: ValidationIssue[], missingFields: string[]): number {
  let score = 100;
  
  // Deduct points for each issue based on severity
  issues.forEach(issue => {
    switch (issue.type) {
      case 'error':
        score -= 10;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'info':
        score -= 1;
        break;
    }
  });
  
  // Deduct points for missing fields
  score -= missingFields.length * 10;
  
  // Ensure score doesn't go below 0
  return Math.max(0, score);
}