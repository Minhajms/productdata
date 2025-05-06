import { IconType } from "react-icons";

export type ProcessStep = "upload" | "marketplace" | "analyze" | "review" | "export";

export interface MarketplaceRequirement {
  name: string;
  required: boolean;
}

export interface Marketplace {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  requirements: MarketplaceRequirement[];
}

export interface Product {
  product_id: string;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  brand?: string;
  images?: string[];
  bullet_points?: string[];
  asin?: string; // Amazon specific
  [key: string]: any; // Allow for custom fields
}

export interface ProcessLog {
  timestamp: Date;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface EnhancementStats {
  totalProducts: number;
  completedProducts: number;
  productsWithWarnings: number;
  productsWithErrors: number;
  missingFields: number;
}

export interface ExportOptions {
  format: string;
  includeHeaders: boolean;
  filterComplete: boolean;
  selectedOnly: boolean;
  encodeUtf8: boolean;
  saveAsTemplate: boolean;
}
