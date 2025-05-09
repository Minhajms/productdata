// Re-export all types from shared schema as needed for client-side code
import type { Product as DbProduct } from '@shared/schema';

// Define client-side types, extending shared DB types as needed
export interface Product extends Omit<DbProduct, 'price'> {
  // Handle price as string or number for client-side flexibility
  price: string | number | null;
}

export interface Marketplace {
  id: string;
  name: string;
  description: string;
  requirements: MarketplaceRequirement[];
  logoUrl?: string;
  isCustom?: boolean;
}

export interface MarketplaceRequirement {
  field: string;
  display: string;
  required: boolean;
  type: 'text' | 'number' | 'select' | 'image' | 'list';
  options?: string[];
  maxLength?: number;
}

export enum ProcessStep {
  UPLOAD = 'upload',
  MARKETPLACE = 'marketplace',
  ANALYSIS = 'analysis',
  REVIEW = 'review',
  EXPORT = 'export',
}