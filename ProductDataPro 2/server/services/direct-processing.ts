/**
 * Direct CSV Processing Service
 * A no-nonsense, direct approach to processing CSV files without API calls
 */

import { Product } from '@shared/schema';
import * as fs from 'fs';
import Papa from 'papaparse';

/**
 * Process a CSV file directly without unnecessary API calls
 * @param filePath Path to the uploaded CSV file
 * @returns Processed products with basic enhancement
 */
export async function processCSVFile(filePath: string): Promise<{
  products: Product[];
  stats: {
    totalProducts: number;
    missingFields: Record<string, number>;
    potentialImprovements: number;
  };
}> {
  console.log(`Direct processing of CSV file: ${filePath}`);
  
  try {
    // Read file content
    const csvContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV data
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
    
    if (!parseResult.data || parseResult.data.length === 0) {
      console.error("No data found in CSV file");
      return { 
        products: [], 
        stats: { 
          totalProducts: 0, 
          missingFields: {}, 
          potentialImprovements: 0 
        } 
      };
    }
    
    // Log the raw data for debugging
    console.log("CSV data (first row):", parseResult.data[0]);
    
    // Analyze the data structure
    const fieldNames = Object.keys(parseResult.data[0] as object);
    console.log("Detected fields:", fieldNames);
    
    // Map CSV data to products
    const products: Product[] = [];
    const missingFields: Record<string, number> = {};
    let potentialImprovements = 0;
    
    parseResult.data.forEach((row: any, index: number) => {
      const product: Partial<Product> = {
        id: row.id || row.ID || row.product_id || row.ProductID || row.SKU || row.sku || `product-${index}`,
        title: row.title || row.Title || row.product_name || row.ProductName || row.Name || row.name || '',
        description: row.description || row.Description || row.ProductDescription || row['Long description'] || '',
        price: row.price || row.Price || row['Regular price'] || row.RegularPrice || '0',
        brand: row.brand || row.Brand || row.vendor || row.Vendor || '',
        category: row.category || row.Category || row.ProductType || row.product_type || row.type || row.Type || '',
        images: getImageUrls(row),
        bulletPoints: getBulletPoints(row),
        color: row.color || row.Color || row.variation || row.Variation || '',
        size: row.size || row.Size || row.dimensions || row.Dimensions || '',
        material: row.material || row.Material || row.materials || row.Materials || '',
        features: getBulletPoints(row),
        keywords: getKeywords(row),
      };
      
      // Count missing fields for analysis
      Object.entries(product).forEach(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0) || value === '0') {
          missingFields[key] = (missingFields[key] || 0) + 1;
          potentialImprovements++;
        }
      });
      
      products.push(product as Product);
    });
    
    console.log(`Processed ${products.length} products from CSV`);
    console.log("Missing fields statistics:", missingFields);
    
    return {
      products,
      stats: {
        totalProducts: products.length,
        missingFields,
        potentialImprovements
      }
    };
  } catch (error) {
    console.error("Error processing CSV file:", error);
    throw error;
  }
}

/**
 * Extract image URLs from various possible field formats
 */
function getImageUrls(row: any): string[] {
  const imageUrls: string[] = [];
  
  // Try different field names that might contain image URLs
  const possibleFields = [
    'image', 'Image', 'image_url', 'ImageURL', 'images', 'Images',
    'image_src', 'ImageSrc', 'product_image', 'ProductImage', 
    'image_link', 'ImageLink', 'main_image', 'MainImage',
    'Variant Image', 'Variant image', 'variant_image', 'VariantImage'
  ];
  
  possibleFields.forEach(field => {
    if (row[field] && typeof row[field] === 'string' && row[field].trim() !== '') {
      // Handle comma-separated URLs
      if (row[field].includes(',')) {
        imageUrls.push(...row[field].split(',').map((url: string) => url.trim()).filter(Boolean));
      } else {
        imageUrls.push(row[field].trim());
      }
    }
  });
  
  return imageUrls;
}

/**
 * Extract bullet points from various possible field formats
 */
function getBulletPoints(row: any): string[] {
  const bulletPoints: string[] = [];
  
  // Try different field names that might contain bullet points
  const possibleFields = [
    'bullet_points', 'BulletPoints', 'features', 'Features',
    'key_features', 'KeyFeatures', 'highlights', 'Highlights',
    'bullet_point1', 'bullet_point2', 'bullet_point3', 'bullet_point4', 'bullet_point5',
    'BulletPoint1', 'BulletPoint2', 'BulletPoint3', 'BulletPoint4', 'BulletPoint5',
    'Feature1', 'Feature2', 'Feature3', 'Feature4', 'Feature5'
  ];
  
  possibleFields.forEach(field => {
    if (row[field] && typeof row[field] === 'string' && row[field].trim() !== '') {
      // Handle pipe-separated or comma-separated items
      if (row[field].includes('|')) {
        bulletPoints.push(...row[field].split('|').map((item: string) => item.trim()).filter(Boolean));
      } else if (row[field].includes(',') && field.toLowerCase().includes('bullet')) {
        bulletPoints.push(...row[field].split(',').map((item: string) => item.trim()).filter(Boolean));
      } else {
        bulletPoints.push(row[field].trim());
      }
    }
  });
  
  return bulletPoints;
}

/**
 * Extract keywords from various possible field formats
 */
function getKeywords(row: any): string[] {
  const keywords: string[] = [];
  
  // Try different field names that might contain keywords
  const possibleFields = [
    'keywords', 'Keywords', 'tags', 'Tags',
    'search_terms', 'SearchTerms', 'meta_keywords', 'MetaKeywords',
    'seo_keywords', 'SEOKeywords', 'search_keywords', 'SearchKeywords'
  ];
  
  possibleFields.forEach(field => {
    if (row[field] && typeof row[field] === 'string' && row[field].trim() !== '') {
      // Handle different delimiters
      const delimiters = [',', '|', ';', '+'];
      let processed = false;
      
      for (const delimiter of delimiters) {
        if (row[field].includes(delimiter)) {
          keywords.push(...row[field].split(delimiter).map((item: string) => item.trim()).filter(Boolean));
          processed = true;
          break;
        }
      }
      
      if (!processed) {
        keywords.push(row[field].trim());
      }
    }
  });
  
  return keywords;
}

/**
 * Generate a basic enhancement summary for a product
 */
export function generateEnhancementSummary(product: Product): {
  currentScore: number;
  suggestedImprovements: string[];
  missingFields: string[];
  potentialScore: number;
} {
  const missingFields: string[] = [];
  const suggestedImprovements: string[] = [];
  let currentScore = 100; // Start with perfect score
  
  // Check for missing or incomplete fields
  if (!product.title || product.title.length < 10) {
    missingFields.push('title');
    suggestedImprovements.push('Add a more descriptive title (50-75 characters ideal)');
    currentScore -= 15;
  }
  
  if (!product.description || product.description.length < 50) {
    missingFields.push('description');
    suggestedImprovements.push('Add a comprehensive product description (300+ characters ideal)');
    currentScore -= 20;
  }
  
  if (!product.bulletPoints || product.bulletPoints.length < 3) {
    missingFields.push('bulletPoints');
    suggestedImprovements.push('Add 5+ bullet points highlighting key product features');
    currentScore -= 15;
  }
  
  if (!product.images || product.images.length === 0) {
    missingFields.push('images');
    suggestedImprovements.push('Add product images showing different angles');
    currentScore -= 20;
  }
  
  if (!product.keywords || product.keywords.length < 3) {
    missingFields.push('keywords');
    suggestedImprovements.push('Add relevant keywords to improve search visibility');
    currentScore -= 15;
  }
  
  if (!product.brand) {
    missingFields.push('brand');
    suggestedImprovements.push('Add brand information');
    currentScore -= 5;
  }
  
  if (!product.category) {
    missingFields.push('category');
    suggestedImprovements.push('Add product category information');
    currentScore -= 5;
  }
  
  if (!product.features || product.features.length === 0) {
    missingFields.push('features');
    suggestedImprovements.push('Add product features for better description');
    currentScore -= 5;
  }
  
  // Ensure score is between 0 and 100
  currentScore = Math.max(0, Math.min(100, currentScore));
  
  // Calculate potential score after improvements
  const potentialScore = Math.min(100, currentScore + (missingFields.length * 10));
  
  return {
    currentScore,
    suggestedImprovements,
    missingFields,
    potentialScore
  };
}

/**
 * Generate a basic product enhancement without API calls
 */
export function enhanceProduct(product: Product): {
  enhancedProduct: Product;
  original: Product;
  enhancements: {
    title: { before: string; after: string; };
    description: { before: string; after: string; };
    bulletPoints: { before: string[]; after: string[]; };
    keywords: { before: string[]; after: string[]; };
  };
  score: { before: number; after: number; };
} {
  const original = { ...product };
  const enhancedProduct = { ...product };
  const summary = generateEnhancementSummary(product);
  
  // Basic title enhancement
  let enhancedTitle = product.title || '';
  if (!enhancedTitle || enhancedTitle.length < 10) {
    const type = product.category || 'Product';
    const brand = product.brand ? `${product.brand} ` : '';
    const color = product.color ? ` - ${product.color}` : '';
    const size = product.size ? ` - ${product.size}` : '';
    enhancedTitle = `${brand}Premium Quality ${type}${color}${size}`;
  }
  enhancedProduct.title = enhancedTitle;
  
  // Basic description enhancement
  let enhancedDescription = product.description || '';
  if (!enhancedDescription || enhancedDescription.length < 50) {
    const type = product.category || 'product';
    const brand = product.brand ? ` from ${product.brand}` : '';
    enhancedDescription = `Premium quality ${type}${brand} designed for optimal performance and durability. This ${type} combines exceptional quality with practical functionality, making it perfect for everyday use.`;
    
    if (product.material) {
      enhancedDescription += ` Made with high-quality ${product.material} for long-lasting performance.`;
    }
    
    enhancedDescription += ` This versatile ${type} is ideal for various applications and settings, making it an excellent addition to your collection.`;
  }
  enhancedProduct.description = enhancedDescription;
  
  // Basic bullet points enhancement
  let enhancedBulletPoints = [...(product.bulletPoints || [])];
  if (enhancedBulletPoints.length < 3) {
    const type = product.category || 'product';
    const defaultBullets = [
      `Premium Quality: High-grade ${type} designed for optimal performance`,
      `Versatile Use: Adaptable for various applications and settings`,
      `Thoughtful Design: Created with user experience in mind`,
      `Reliable Performance: Consistent quality you can count on`,
      `Customer Satisfaction: Backed by our commitment to excellence`
    ];
    
    // Add only the bullets that are missing
    const bulletsToAdd = 5 - enhancedBulletPoints.length;
    enhancedBulletPoints = [...enhancedBulletPoints, ...defaultBullets.slice(0, bulletsToAdd)];
  }
  enhancedProduct.bulletPoints = enhancedBulletPoints;
  
  // Basic keywords enhancement
  let enhancedKeywords = [...(product.keywords || [])];
  if (enhancedKeywords.length < 3) {
    const type = product.category || 'product';
    const defaultKeywords = [
      type,
      `quality ${type}`,
      `premium ${type}`,
      `best ${type}`,
      product.brand ? `${product.brand} ${type}` : '',
      product.color ? `${product.color} ${type}` : '',
      product.size ? `${product.size} ${type}` : '',
      `affordable ${type}`,
      `reliable ${type}`,
      `durable ${type}`
    ].filter(Boolean);
    
    // Add only the keywords that are missing
    const keywordsToAdd = 10 - enhancedKeywords.length;
    enhancedKeywords = [...enhancedKeywords, ...defaultKeywords.slice(0, keywordsToAdd)];
  }
  enhancedProduct.keywords = enhancedKeywords;
  
  // Calculate after-enhancement score
  const afterSummary = generateEnhancementSummary(enhancedProduct);
  
  return {
    enhancedProduct,
    original,
    enhancements: {
      title: { before: original.title || '', after: enhancedProduct.title || '' },
      description: { before: original.description || '', after: enhancedProduct.description || '' },
      bulletPoints: { before: original.bulletPoints || [], after: enhancedProduct.bulletPoints || [] },
      keywords: { before: original.keywords || [], after: enhancedProduct.keywords || [] },
    },
    score: { before: summary.currentScore, after: afterSummary.currentScore }
  };
}