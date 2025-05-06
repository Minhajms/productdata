import Papa from 'papaparse';
import { Product } from '@shared/schema';

/**
 * Parses CSV string into an array of product objects
 * @param csvString CSV content as a string
 * @returns Array of product objects
 */
export async function parseCSV(csvString: string): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const products: Product[] = [];
          
          for (const row of results.data) {
            if (typeof row !== 'object' || row === null) continue;
            
            const product: Product = {
              product_id: (row as any).product_id || generateRandomId(),
              status: 'pending',
              created_at: new Date(),
              updated_at: new Date()
            };
            
            // Map CSV columns to product fields
            for (const [key, value] of Object.entries(row)) {
              if (value === undefined || value === null || value === '') continue;
              
              const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
              
              // Handle special fields
              if (normalizedKey === 'price') {
                product.price = parseFloat(value as string) || undefined;
              } else if (normalizedKey === 'images') {
                product.images = (value as string).split(';').map(img => img.trim());
              } else if (normalizedKey === 'bullet_points') {
                product.bullet_points = (value as string).split(';').map(point => point.trim());
              } else if (Object.prototype.hasOwnProperty.call(product, normalizedKey)) {
                // Only set known properties
                (product as any)[normalizedKey] = value;
              }
            }
            
            products.push(product);
          }
          
          resolve(products);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error}`));
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

/**
 * Generates a CSV string from product data
 * @param products Array of product objects
 * @param format Export format
 * @param includeHeaders Whether to include headers in the CSV
 * @param encodeUtf8 Whether to add UTF-8 BOM marker
 * @returns CSV string
 */
export function generateCSV(
  products: Product[], 
  format: string = 'standard_csv',
  includeHeaders: boolean = true,
  encodeUtf8: boolean = true
): string {
  // Define columns based on export format
  let columns: string[] = [];
  
  switch (format) {
    case 'amazon_seller':
      columns = [
        'product_id', 'asin', 'title', 'description', 'bullet_points', 
        'brand', 'category', 'price', 'images'
      ];
      break;
    case 'amazon_vendor':
      columns = [
        'product_id', 'asin', 'item_name', 'product_description', 'bullet_point1', 
        'bullet_point2', 'bullet_point3', 'bullet_point4', 'bullet_point5',
        'brand_name', 'department', 'standard_price', 'main_image_url'
      ];
      break;
    case 'amazon_flat':
      columns = [
        'sku', 'product-id', 'product-id-type', 'title', 'product-description',
        'bullet-point-1', 'bullet-point-2', 'bullet-point-3', 'bullet-point-4', 'bullet-point-5',
        'brand', 'recommended-browse-nodes', 'price', 'main-image-url'
      ];
      break;
    case 'ebay_format':
      columns = [
        'item_id', 'title', 'description', 'condition', 'price', 
        'category', 'images', 'brand'
      ];
      break;
    case 'shopify_format':
      columns = [
        'Handle', 'Title', 'Body HTML', 'Vendor', 'Type', 
        'Price', 'Compare at Price', 'Image Src'
      ];
      break;
    case 'walmart_format':
      columns = [
        'sku', 'product_name', 'short_description', 'long_description', 
        'brand', 'category', 'price', 'images'
      ];
      break;
    case 'etsy_format':
      columns = [
        'listing_id', 'title', 'description', 'materials', 'price', 
        'category', 'tags', 'images'
      ];
      break;
    default: // standard_csv
      columns = [
        'product_id', 'title', 'description', 'price', 'brand', 
        'category', 'bullet_points', 'images', 'asin'
      ];
  }
  
  // Format product data based on selected format
  const formattedProducts = products.map(product => {
    const formattedProduct: Record<string, any> = {};
    
    // Map product fields to CSV columns based on format
    if (format === 'standard_csv' || format === 'amazon_seller') {
      // Standard or Amazon Seller format
      columns.forEach(column => {
        if (column === 'bullet_points' && product.bullet_points) {
          formattedProduct[column] = product.bullet_points.join(';');
        } else if (column === 'images' && product.images) {
          formattedProduct[column] = product.images.join(';');
        } else if (column === 'price' && product.price) {
          formattedProduct[column] = product.price.toString();
        } else {
          formattedProduct[column] = (product as any)[column] || '';
        }
      });
    } else if (format === 'amazon_vendor') {
      // Amazon Vendor format
      formattedProduct['product_id'] = product.product_id;
      formattedProduct['asin'] = product.asin || '';
      formattedProduct['item_name'] = product.title || '';
      formattedProduct['product_description'] = product.description || '';
      
      // Handle bullet points
      if (product.bullet_points && product.bullet_points.length > 0) {
        for (let i = 0; i < 5; i++) {
          formattedProduct[`bullet_point${i+1}`] = product.bullet_points[i] || '';
        }
      } else {
        for (let i = 0; i < 5; i++) {
          formattedProduct[`bullet_point${i+1}`] = '';
        }
      }
      
      formattedProduct['brand_name'] = product.brand || '';
      formattedProduct['department'] = product.category || '';
      formattedProduct['standard_price'] = product.price ? product.price.toString() : '';
      formattedProduct['main_image_url'] = product.images && product.images.length > 0 ? product.images[0] : '';
    } else if (format === 'amazon_flat') {
      // Amazon Flat File format
      formattedProduct['sku'] = product.product_id;
      formattedProduct['product-id'] = product.asin || '';
      formattedProduct['product-id-type'] = 'ASIN';
      formattedProduct['title'] = product.title || '';
      formattedProduct['product-description'] = product.description || '';
      
      // Handle bullet points
      if (product.bullet_points && product.bullet_points.length > 0) {
        for (let i = 0; i < 5; i++) {
          formattedProduct[`bullet-point-${i+1}`] = product.bullet_points[i] || '';
        }
      } else {
        for (let i = 0; i < 5; i++) {
          formattedProduct[`bullet-point-${i+1}`] = '';
        }
      }
      
      formattedProduct['brand'] = product.brand || '';
      formattedProduct['recommended-browse-nodes'] = product.category || '';
      formattedProduct['price'] = product.price ? product.price.toString() : '';
      formattedProduct['main-image-url'] = product.images && product.images.length > 0 ? product.images[0] : '';
    } else if (format === 'ebay_format') {
      // eBay format
      formattedProduct['item_id'] = product.product_id;
      formattedProduct['title'] = product.title || '';
      formattedProduct['description'] = product.description || '';
      formattedProduct['condition'] = 'New';
      formattedProduct['price'] = product.price ? product.price.toString() : '';
      formattedProduct['category'] = product.category || '';
      formattedProduct['images'] = product.images ? product.images.join(';') : '';
      formattedProduct['brand'] = product.brand || '';
    } else if (format === 'shopify_format') {
      // Shopify format
      formattedProduct['Handle'] = product.product_id;
      formattedProduct['Title'] = product.title || '';
      formattedProduct['Body HTML'] = product.description || '';
      formattedProduct['Vendor'] = product.brand || '';
      formattedProduct['Type'] = product.category || '';
      formattedProduct['Price'] = product.price ? product.price.toString() : '';
      formattedProduct['Compare at Price'] = '';
      formattedProduct['Image Src'] = product.images && product.images.length > 0 ? product.images[0] : '';
    } else if (format === 'walmart_format') {
      // Walmart format
      formattedProduct['sku'] = product.product_id;
      formattedProduct['product_name'] = product.title || '';
      formattedProduct['short_description'] = product.bullet_points ? product.bullet_points.join('. ') : '';
      formattedProduct['long_description'] = product.description || '';
      formattedProduct['brand'] = product.brand || '';
      formattedProduct['category'] = product.category || '';
      formattedProduct['price'] = product.price ? product.price.toString() : '';
      formattedProduct['images'] = product.images ? product.images.join(';') : '';
    } else if (format === 'etsy_format') {
      // Etsy format
      formattedProduct['listing_id'] = product.product_id;
      formattedProduct['title'] = product.title || '';
      formattedProduct['description'] = product.description || '';
      formattedProduct['materials'] = '';
      formattedProduct['price'] = product.price ? product.price.toString() : '';
      formattedProduct['category'] = product.category || '';
      formattedProduct['tags'] = product.bullet_points ? product.bullet_points.join(',') : '';
      formattedProduct['images'] = product.images ? product.images.join(';') : '';
    }
    
    return formattedProduct;
  });
  
  // Convert to CSV string
  const csv = Papa.unparse(formattedProducts, {
    header: includeHeaders,
    skipEmptyLines: true
  });
  
  // Add BOM for UTF-8 encoding if requested
  return encodeUtf8 ? '\ufeff' + csv : csv;
}

/**
 * Generates a random product ID
 * @returns Random product ID
 */
function generateRandomId(): string {
  return 'PROD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}
