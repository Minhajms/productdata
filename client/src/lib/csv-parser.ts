import Papa from 'papaparse';
import { Product } from '@/types';

export async function parseCSVToProducts(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const products: Product[] = [];
          
          for (const row of results.data) {
            if (typeof row !== 'object' || row === null) continue;
            
            const product: Product = {
              product_id: (row as any).product_id || generateRandomId()
            };
            
            // Map CSV columns to product fields
            for (const [key, value] of Object.entries(row)) {
              // Skip empty values
              if (value === undefined || value === null || value === '') continue;
              
              const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
              
              // Handle special fields
              if (normalizedKey === 'price') {
                product.price = parseFloat(value as string) || 0;
              } else if (normalizedKey === 'images') {
                product.images = (value as string).split(';').map(img => img.trim());
              } else if (normalizedKey === 'bullet_points') {
                product.bullet_points = (value as string).split(';').map(point => point.trim());
              } else {
                product[normalizedKey] = value;
              }
            }
            
            products.push(product);
          }
          
          resolve(products);
        } catch (error) {
          reject(new Error('Failed to parse CSV: ' + error));
        }
      },
      error: (error) => {
        reject(new Error('Failed to parse CSV: ' + error.message));
      }
    });
  });
}

export function generateProductsCSV(
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
    case 'ebay_format':
      columns = [
        'product_id', 'title', 'description', 'condition', 'price', 
        'category', 'images', 'brand'
      ];
      break;
    case 'shopify_format':
      columns = [
        'product_id', 'title', 'body_html', 'vendor', 'product_type', 
        'price', 'compare_at_price', 'images'
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
        'category', 'bullet_points', 'images'
      ];
  }
  
  // Format product data based on selected format
  const formattedProducts = products.map(product => {
    const formattedProduct: Record<string, any> = {};
    
    // Map product fields to CSV columns
    columns.forEach(column => {
      if (column === 'product_id' && format === 'walmart_format') {
        formattedProduct['sku'] = product.product_id;
      } else if (column === 'product_id' && format === 'etsy_format') {
        formattedProduct['listing_id'] = product.product_id;
      } else if (column === 'title' && format === 'walmart_format') {
        formattedProduct['product_name'] = product.title || '';
      } else if (column === 'description' && format === 'shopify_format') {
        formattedProduct['body_html'] = product.description || '';
      } else if (column === 'brand' && format === 'shopify_format') {
        formattedProduct['vendor'] = product.brand || '';
      } else if (column === 'category' && format === 'shopify_format') {
        formattedProduct['product_type'] = product.category || '';
      } else if (column === 'bullet_points') {
        formattedProduct[column] = product.bullet_points ? product.bullet_points.join(';') : '';
      } else if (column === 'images') {
        formattedProduct[column] = product.images ? product.images.join(';') : '';
      } else {
        formattedProduct[column] = product[column] || '';
      }
    });
    
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

function generateRandomId(): string {
  return 'PROD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}
