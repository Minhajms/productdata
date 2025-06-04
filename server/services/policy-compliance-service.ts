import { getMarketplaceGuidelines } from './smart-prompts';

interface ComplianceIssue {
  type: 'critical' | 'warning' | 'suggestion';
  field: string;
  description: string;
  location?: string;
  recommendation: string;
  policyReference?: string;
}

interface ComplianceResult {
  score: number;
  issues: ComplianceIssue[];
  isCompliant: boolean;
}

// Prohibited terms and phrases by marketplace
const PROHIBITED_TERMS: Record<string, string[]> = {
  amazon: [
    'best seller',
    'best-selling',
    'top rated',
    'number one',
    'cheapest',
    'lowest price',
    'free shipping',
    'sale',
    'discount',
    'limited time',
    'while supplies last'
  ],
  shopify: [
    'best seller',
    'best-selling',
    'top rated',
    'number one'
  ],
  etsy: [
    'best seller',
    'best-selling',
    'top rated',
    'number one',
    'cheapest',
    'lowest price'
  ]
};

// Medical claims that require verification
const MEDICAL_CLAIMS = [
  'cures',
  'treats',
  'heals',
  'prevents',
  'relieves',
  'reduces',
  'eliminates',
  'improves',
  'enhances',
  'strengthens'
];

export async function checkPolicyCompliance(
  product: any,
  marketplace: string
): Promise<ComplianceResult> {
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
  if (product.bullet_points) {
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
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
  return {
    score,
    issues,
    isCompliant: score >= 70
  };
}

function checkTitleCompliance(title: string, marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  
  // Check length
  const maxLength = getMaxTitleLength(marketplace);
  if (title.length > maxLength) {
    issues.push({
      type: 'critical',
      field: 'title',
      description: `Title exceeds maximum length of ${maxLength} characters`,
      location: 'title',
      recommendation: `Shorten title to ${maxLength} characters or less`
    });
  }
  
  // Check for prohibited terms
  const prohibitedTerms = PROHIBITED_TERMS[marketplace.toLowerCase()] || [];
  prohibitedTerms.forEach(term => {
    if (title.toLowerCase().includes(term)) {
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

function checkDescriptionCompliance(description: string, marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  
  // Check length
  const maxLength = getMaxDescriptionLength(marketplace);
  if (description.length > maxLength) {
    issues.push({
      type: 'critical',
      field: 'description',
      description: `Description exceeds maximum length of ${maxLength} characters`,
      location: 'description',
      recommendation: `Shorten description to ${maxLength} characters or less`
    });
  }
  
  // Check for prohibited terms
  const prohibitedTerms = PROHIBITED_TERMS[marketplace.toLowerCase()] || [];
  prohibitedTerms.forEach(term => {
    if (description.toLowerCase().includes(term)) {
      issues.push({
        type: 'warning',
        field: 'description',
        description: `Description contains prohibited term: "${term}"`,
        location: 'description',
        recommendation: `Remove or replace the term "${term}"`
      });
    }
  });
  
  return issues;
}

function checkBulletPointsCompliance(bulletPoints: string[], marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  
  // Check number of bullet points
  const maxBulletPoints = getMaxBulletPoints(marketplace);
  if (bulletPoints.length > maxBulletPoints) {
    issues.push({
      type: 'warning',
      field: 'bullet_points',
      description: `Too many bullet points (${bulletPoints.length} > ${maxBulletPoints})`,
      location: 'bullet_points',
      recommendation: `Reduce to ${maxBulletPoints} bullet points or less`
    });
  }
  
  // Check each bullet point
  bulletPoints.forEach((point, index) => {
    const maxLength = getMaxBulletPointLength(marketplace);
    if (point.length > maxLength) {
      issues.push({
        type: 'warning',
        field: 'bullet_points',
        description: `Bullet point ${index + 1} exceeds maximum length of ${maxLength} characters`,
        location: `bullet_points[${index}]`,
        recommendation: `Shorten bullet point to ${maxLength} characters or less`
      });
    }
  });
  
  return issues;
}

function checkMedicalClaims(product: any): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const textToCheck = [
    product.title,
    product.description,
    ...(product.bullet_points || [])
  ].filter(Boolean).join(' ');
  
  MEDICAL_CLAIMS.forEach(claim => {
    if (textToCheck.toLowerCase().includes(claim)) {
      issues.push({
        type: 'critical',
        field: 'content',
        description: `Content contains unverified medical claim: "${claim}"`,
        location: 'content',
        recommendation: 'Remove or modify medical claims unless you have proper verification',
        policyReference: 'Medical Claims Policy'
      });
    }
  });
  
  return issues;
}

function checkProhibitedTerms(product: any, marketplace: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const prohibitedTerms = PROHIBITED_TERMS[marketplace.toLowerCase()] || [];
  
  // Check all text fields
  const fieldsToCheck = {
    title: product.title,
    description: product.description,
    bullet_points: product.bullet_points
  };
  
  Object.entries(fieldsToCheck).forEach(([field, content]) => {
    if (content) {
      const text = Array.isArray(content) ? content.join(' ') : content;
      prohibitedTerms.forEach(term => {
        if (text.toLowerCase().includes(term)) {
          issues.push({
            type: 'warning',
            field,
            description: `Content contains prohibited term: "${term}"`,
            location: field,
            recommendation: `Remove or replace the term "${term}"`
          });
        }
      });
    }
  });
  
  return issues;
}

// Helper functions for marketplace-specific limits
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