import { getMarketplaceGuidelines } from './smart-prompts';

interface ValidationIssue {
  field: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  recommendation?: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  missingFields: string[];
  score: number;
}

export async function validateProductFields(
  product: any,
  marketplace: string
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];
  const missingFields: string[] = [];
  let score = 100;
  
  // Get marketplace requirements
  const requirements = getMarketplaceRequirements(marketplace);
  
  // Check required fields
  requirements.requiredFields.forEach(field => {
    if (!product[field.name] || product[field.name].toString().trim() === '') {
      missingFields.push(field.name);
      issues.push({
        field: field.name,
        type: 'error',
        message: `Required field "${field.name}" is missing`,
        recommendation: `Add the required ${field.name} field`
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
  
  if (product.bullet_points) {
    const bulletPointIssues = validateBulletPoints(product.bullet_points, marketplace);
    issues.push(...bulletPointIssues);
    score -= bulletPointIssues.length * 3;
  }
  
  if (product.images) {
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
  if (product.attributes) {
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

function validateTitle(title: string, marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const maxLength = getMaxTitleLength(marketplace);
  
  if (title.length > maxLength) {
    issues.push({
      field: 'title',
      type: 'error',
      message: `Title exceeds maximum length of ${maxLength} characters`,
      recommendation: `Shorten title to ${maxLength} characters or less`
    });
  }
  
  if (title.length < 10) {
    issues.push({
      field: 'title',
      type: 'warning',
      message: 'Title is too short (less than 10 characters)',
      recommendation: 'Add more descriptive content to the title'
    });
  }
  
  return issues;
}

function validateDescription(description: string, marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const maxLength = getMaxDescriptionLength(marketplace);
  const minLength = getMinDescriptionLength(marketplace);
  
  if (description.length > maxLength) {
    issues.push({
      field: 'description',
      type: 'error',
      message: `Description exceeds maximum length of ${maxLength} characters`,
      recommendation: `Shorten description to ${maxLength} characters or less`
    });
  }
  
  if (description.length < minLength) {
    issues.push({
      field: 'description',
      type: 'warning',
      message: `Description is too short (less than ${minLength} characters)`,
      recommendation: `Add more descriptive content to reach at least ${minLength} characters`
    });
  }
  
  return issues;
}

function validateBulletPoints(bulletPoints: string[], marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const maxCount = getMaxBulletPoints(marketplace);
  const maxLength = getMaxBulletPointLength(marketplace);
  
  if (bulletPoints.length > maxCount) {
    issues.push({
      field: 'bullet_points',
      type: 'warning',
      message: `Too many bullet points (${bulletPoints.length} > ${maxCount})`,
      recommendation: `Reduce to ${maxCount} bullet points or less`
    });
  }
  
  bulletPoints.forEach((point, index) => {
    if (point.length > maxLength) {
      issues.push({
        field: 'bullet_points',
        type: 'warning',
        message: `Bullet point ${index + 1} exceeds maximum length of ${maxLength} characters`,
        recommendation: `Shorten bullet point to ${maxLength} characters or less`
      });
    }
  });
  
  return issues;
}

function validateImages(images: string[], marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const requirements = getImageRequirements(marketplace);
  
  if (images.length < requirements.min) {
    issues.push({
      field: 'images',
      type: 'error',
      message: `Not enough images (${images.length} < ${requirements.min})`,
      recommendation: `Add at least ${requirements.min} images`
    });
  }
  
  if (images.length > requirements.max) {
    issues.push({
      field: 'images',
      type: 'warning',
      message: `Too many images (${images.length} > ${requirements.max})`,
      recommendation: `Reduce to ${requirements.max} images or less`
    });
  }
  
  return issues;
}

function validatePrice(price: string | number, marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    issues.push({
      field: 'price',
      type: 'error',
      message: 'Invalid price format',
      recommendation: 'Enter a valid numeric price'
    });
  } else if (numPrice <= 0) {
    issues.push({
      field: 'price',
      type: 'error',
      message: 'Price must be greater than 0',
      recommendation: 'Enter a valid price greater than 0'
    });
  }
  
  return issues;
}

function validateAttributes(attributes: Record<string, any>, marketplace: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const requiredAttributes = getRequiredAttributes(marketplace);
  
  requiredAttributes.forEach(attr => {
    if (!attributes[attr]) {
      issues.push({
        field: 'attributes',
        type: 'warning',
        message: `Missing required attribute: ${attr}`,
        recommendation: `Add the ${attr} attribute`
      });
    }
  });
  
  return issues;
}

// Helper functions for marketplace-specific requirements
function getMarketplaceRequirements(marketplace: string) {
  switch (marketplace.toLowerCase()) {
    case 'amazon':
      return {
        requiredFields: [
          { name: 'title', required: true },
          { name: 'description', required: true },
          { name: 'price', required: true },
          { name: 'images', required: true },
          { name: 'bullet_points', required: true }
        ]
      };
    case 'shopify':
      return {
        requiredFields: [
          { name: 'title', required: true },
          { name: 'description', required: true },
          { name: 'price', required: true },
          { name: 'images', required: true }
        ]
      };
    default:
      return {
        requiredFields: [
          { name: 'title', required: true },
          { name: 'description', required: true },
          { name: 'price', required: true }
        ]
      };
  }
}

function getMaxTitleLength(marketplace: string): number {
  switch (marketplace.toLowerCase()) {
    case 'amazon': return 200;
    case 'shopify': return 255;
    case 'etsy': return 140;
    default: return 200;
  }
}

function getMaxDescriptionLength(marketplace: string): number {
  switch (marketplace.toLowerCase()) {
    case 'amazon': return 2000;
    case 'shopify': return 5000;
    case 'etsy': return 5000;
    default: return 2000;
  }
}

function getMinDescriptionLength(marketplace: string): number {
  switch (marketplace.toLowerCase()) {
    case 'amazon': return 100;
    case 'shopify': return 150;
    case 'etsy': return 100;
    default: return 100;
  }
}

function getMaxBulletPoints(marketplace: string): number {
  switch (marketplace.toLowerCase()) {
    case 'amazon': return 5;
    case 'shopify': return 10;
    case 'etsy': return 8;
    default: return 5;
  }
}

function getMaxBulletPointLength(marketplace: string): number {
  switch (marketplace.toLowerCase()) {
    case 'amazon': return 200;
    case 'shopify': return 500;
    case 'etsy': return 500;
    default: return 200;
  }
}

function getImageRequirements(marketplace: string): { min: number; max: number } {
  switch (marketplace.toLowerCase()) {
    case 'amazon': return { min: 1, max: 9 };
    case 'shopify': return { min: 1, max: 250 };
    case 'etsy': return { min: 1, max: 10 };
    default: return { min: 1, max: 10 };
  }
}

function getRequiredAttributes(marketplace: string): string[] {
  switch (marketplace.toLowerCase()) {
    case 'amazon': return ['brand', 'category', 'condition'];
    case 'shopify': return ['vendor', 'product_type'];
    case 'etsy': return ['materials', 'category'];
    default: return [];
  }
} 