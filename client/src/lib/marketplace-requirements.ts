import { MarketplaceRequirement } from '@/types';

export interface MarketplaceRequirementData {
  [marketplace: string]: {
    requiredFields: MarketplaceRequirement[];
    description: string;
    formatGuidelines: {
      title?: { maxLength: number; pattern?: string };
      description?: { maxLength: number; minLength?: number };
      bullet_points?: { count: number; maxLength: number };
      price?: { min: number; max?: number };
      images?: { min: number; max: number; recommendedDimensions: string };
      [key: string]: any;
    };
  };
}

const marketplaceRequirements: MarketplaceRequirementData = {
  'Amazon': {
    requiredFields: [
      { name: 'ASIN', required: true },
      { name: 'Title', required: true },
      { name: 'Bullet Points', required: true },
      { name: 'Description', required: true },
      { name: 'Brand', required: true },
      { name: 'Category', required: true },
      { name: 'Price', required: true },
      { name: 'Images', required: true }
    ],
    description: 'Amazon requires specific product data including ASIN, bullet points, product descriptions with specific character limits, and multiple high-quality images.',
    formatGuidelines: {
      title: { maxLength: 200, pattern: 'Keyword-rich, descriptive title' },
      description: { maxLength: 2000, minLength: 100 },
      bullet_points: { count: 5, maxLength: 500 },
      images: { min: 1, max: 9, recommendedDimensions: '1000x1000 pixels minimum' }
    }
  },
  'eBay': {
    requiredFields: [
      { name: 'Item ID', required: true },
      { name: 'Title', required: true },
      { name: 'Condition', required: true },
      { name: 'Description', required: true },
      { name: 'Price', required: true },
      { name: 'Category', required: true },
      { name: 'Images', required: true }
    ],
    description: 'eBay requires clear item identification, accurate condition descriptions, and detailed product information.',
    formatGuidelines: {
      title: { maxLength: 80 },
      description: { maxLength: 4000, minLength: 100 },
      images: { min: 1, max: 12, recommendedDimensions: '800x800 pixels minimum' }
    }
  },
  'Shopify': {
    requiredFields: [
      { name: 'Product ID', required: true },
      { name: 'Title', required: true },
      { name: 'Body HTML', required: true },
      { name: 'Vendor', required: true },
      { name: 'Product Type', required: true },
      { name: 'Price', required: true }
    ],
    description: 'Shopify stores need well-formatted product descriptions with HTML formatting, vendor information, and product categorization.',
    formatGuidelines: {
      title: { maxLength: 255 },
      description: { maxLength: 5000 },
      images: { min: 1, max: 250, recommendedDimensions: '2048x2048 pixels optimum' }
    }
  },
  'Walmart': {
    requiredFields: [
      { name: 'SKU', required: true },
      { name: 'Product Name', required: true },
      { name: 'Short Description', required: true },
      { name: 'Long Description', required: true },
      { name: 'Brand', required: true },
      { name: 'Category', required: true },
      { name: 'Price', required: true },
      { name: 'Images', required: true }
    ],
    description: 'Walmart Marketplace has strict data quality requirements including detailed specifications and rich content guidelines.',
    formatGuidelines: {
      title: { maxLength: 200 },
      description: { maxLength: 4000, minLength: 150 },
      images: { min: 1, max: 8, recommendedDimensions: '1000x1000 pixels minimum' }
    }
  },
  'Etsy': {
    requiredFields: [
      { name: 'Listing ID', required: true },
      { name: 'Title', required: true },
      { name: 'Description', required: true },
      { name: 'Materials', required: true },
      { name: 'Price', required: true },
      { name: 'Category', required: true },
      { name: 'Tags', required: true },
      { name: 'Images', required: true }
    ],
    description: 'Etsy specializes in handmade and vintage items, requiring detailed materials descriptions and production methods.',
    formatGuidelines: {
      title: { maxLength: 140 },
      description: { maxLength: 5000, minLength: 100 },
      tags: { count: 13, maxLength: 20 },
      images: { min: 1, max: 10, recommendedDimensions: '1000x1000 pixels minimum' }
    }
  }
};

export const getMarketplaceRequirements = (marketplace: string): MarketplaceRequirementData[string] => {
  return marketplaceRequirements[marketplace] || marketplaceRequirements['Amazon'];
};

export const getMissingFields = (product: any, marketplace: string): string[] => {
  const requirements = getMarketplaceRequirements(marketplace);
  const missingFields: string[] = [];
  
  requirements.requiredFields.forEach(field => {
    if (field.required) {
      const fieldName = field.name.toLowerCase().replace(/\s+/g, '_');
      
      // Handle special cases for different marketplaces
      let fieldValue;
      
      if (marketplace === 'Amazon' && fieldName === 'bullet_points') {
        fieldValue = product.bullet_points;
      } else if (marketplace === 'Shopify' && fieldName === 'body_html') {
        fieldValue = product.description;
      } else if (marketplace === 'Walmart' && fieldName === 'product_name') {
        fieldValue = product.title;
      } else if (marketplace === 'Etsy' && fieldName === 'listing_id') {
        fieldValue = product.product_id;
      } else if (marketplace === 'eBay' && fieldName === 'item_id') {
        fieldValue = product.product_id;
      } else {
        fieldValue = product[fieldName];
      }
      
      if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        missingFields.push(field.name);
      }
    }
  });
  
  return missingFields;
};

export default marketplaceRequirements;
