/**
 * CSV Type Detector
 * A lightweight, non-API dependent detector for product types in CSV data
 */

import { Product } from '@shared/schema';

/**
 * Detect product types from CSV data without relying on external API calls
 * This uses pattern matching on available fields to determine product type
 * @param products Sample products from parsed CSV
 * @returns Product type information
 */
export async function detectProductType(products: Product[]): Promise<{
  productType: string;
  category: string;
  targetAudience: string;
  keyFeatures: string[];
}> {
  // Start with default values
  let productType = "Generic Product";
  let category = "General Merchandise";
  let targetAudience = "General consumers";
  let keyFeatures = ["Quality", "Value", "Utility"];
  
  // Skip if no products
  if (!products || products.length === 0) {
    console.log("No products provided for type detection");
    return { productType, category, targetAudience, keyFeatures };
  }

  try {
    console.log("Analyzing products for type detection without API call");
    
    // Collect all available field values for analysis
    const titles: string[] = [];
    const descriptions: string[] = [];
    const categories: string[] = [];
    const brands: string[] = [];
    const allProperties: Record<string, any>[] = [];
    
    // Gather data from all products
    products.forEach(product => {
      if (product.title) titles.push(product.title.toLowerCase());
      if (product.description) descriptions.push(product.description.toLowerCase());
      if (product.category) categories.push(product.category.toLowerCase());
      if (product.brand) brands.push(product.brand.toLowerCase());
      
      // Collect all properties for pattern matching
      const props: Record<string, any> = {};
      Object.entries(product).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          props[key] = value.toLowerCase();
        } else {
          props[key] = value;
        }
      });
      allProperties.push(props);
    });
    
    // Determine product type by looking for common patterns
    // Check product categories if available
    if (categories.length > 0) {
      const categoryText = categories.join(' ');
      
      // Clothing/Apparel detection
      if (categoryText.match(/cloth|apparel|shirt|dress|pant|sock|fashion|wear|garment|outfit/i)) {
        productType = "Clothing";
        category = "Apparel";
        targetAudience = "Fashion consumers";
        keyFeatures = ["Style", "Material", "Size", "Comfort", "Care Instructions"];
        return { productType, category, targetAudience, keyFeatures };
      }
      
      // Electronics detection
      if (categoryText.match(/electronic|tech|gadget|computer|laptop|phone|digital|device/i)) {
        productType = "Electronics";
        category = "Technology";
        targetAudience = "Tech consumers";
        keyFeatures = ["Specifications", "Battery Life", "Connectivity", "Compatibility", "Warranty"];
        return { productType, category, targetAudience, keyFeatures };
      }
      
      // Furniture detection
      if (categoryText.match(/furniture|chair|table|desk|sofa|couch|bed|cabinet|drawer/i)) {
        productType = "Furniture";
        category = "Home Furnishings";
        targetAudience = "Home decorators and furnishers";
        keyFeatures = ["Dimensions", "Material", "Weight Capacity", "Assembly", "Style"];
        return { productType, category, targetAudience, keyFeatures };
      }
    }
    
    // If no category match, try titles
    if (titles.length > 0) {
      const titleText = titles.join(' ');
      
      // Clothing/Apparel detection
      if (titleText.match(/shirt|tee|hoodie|sweater|dress|pant|jean|sock|hat|cap|jacket|coat/i)) {
        productType = "Clothing";
        category = "Apparel";
        targetAudience = "Fashion consumers";
        keyFeatures = ["Style", "Material", "Size", "Comfort", "Care Instructions"];
        return { productType, category, targetAudience, keyFeatures };
      }
      
      // Electronics detection
      if (titleText.match(/phone|laptop|computer|tablet|tv|television|headphone|earbud|speaker|charger|cable/i)) {
        productType = "Electronics";
        category = "Technology";
        targetAudience = "Tech consumers";
        keyFeatures = ["Specifications", "Battery Life", "Connectivity", "Compatibility", "Warranty"];
        return { productType, category, targetAudience, keyFeatures };
      }
      
      // Furniture detection
      if (titleText.match(/chair|table|desk|sofa|couch|bed|mattress|bookcase|shelf|cabinet|ottoman/i)) {
        productType = "Furniture";
        category = "Home Furnishings";
        targetAudience = "Home decorators and furnishers";
        keyFeatures = ["Dimensions", "Material", "Weight Capacity", "Assembly", "Style"];
        return { productType, category, targetAudience, keyFeatures };
      }
      
      // Kitchen/Cookware detection
      if (titleText.match(/pot|pan|knife|spatula|bowl|plate|cup|mug|mixer|blender|cookware/i)) {
        productType = "Cookware";
        category = "Kitchen";
        targetAudience = "Home cooks and chefs";
        keyFeatures = ["Material", "Dishwasher Safe", "Heat Resistance", "Capacity", "Quality"];
        return { productType, category, targetAudience, keyFeatures };
      }
      
      // Beauty/Cosmetics detection
      if (titleText.match(/makeup|lipstick|foundation|mascara|eyeshadow|cream|lotion|shampoo|conditioner/i)) {
        productType = "Beauty Products";
        category = "Cosmetics";
        targetAudience = "Beauty enthusiasts";
        keyFeatures = ["Ingredients", "Skin Type", "Benefits", "Application", "Duration"];
        return { productType, category, targetAudience, keyFeatures };
      }
      
      // Toys detection
      if (titleText.match(/toy|game|puzzle|doll|action figure|lego|block|stuffed|plush/i)) {
        productType = "Toys";
        category = "Children's Products";
        targetAudience = "Children and parents";
        keyFeatures = ["Age Range", "Educational Value", "Materials", "Safety", "Durability"];
        return { productType, category, targetAudience, keyFeatures };
      }
    }
    
    // If still no match, try descriptions
    if (descriptions.length > 0) {
      const descText = descriptions.join(' ');
      
      // More generic patterns
      if (descText.match(/wear|fashion|outfit|style|clothing|apparel|fabric|textile|garment/i)) {
        productType = "Clothing";
        category = "Apparel";
        targetAudience = "Fashion consumers";
        keyFeatures = ["Style", "Material", "Size", "Comfort", "Care Instructions"];
      } else if (descText.match(/electronic|digital|device|tech|smart|wireless|bluetooth|rechargeable/i)) {
        productType = "Electronics";
        category = "Technology";
        targetAudience = "Tech consumers";
        keyFeatures = ["Specifications", "Battery Life", "Connectivity", "Compatibility", "Warranty"];
      } else if (descText.match(/home|living room|bedroom|kitchen|furniture|decor|interior/i)) {
        productType = "Home Goods";
        category = "Home & Garden";
        targetAudience = "Homeowners and decorators";
        keyFeatures = ["Style", "Material", "Dimensions", "Use Case", "Durability"];
      }
    }
    
    console.log("Detected product type:", productType);
    console.log("Detected category:", category);
    
    return { productType, category, targetAudience, keyFeatures };
    
  } catch (error) {
    console.error("Error in local product type detection:", error);
    return { productType, category, targetAudience, keyFeatures };
  }
}