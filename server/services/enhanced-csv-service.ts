/**
 * Enhanced CSV processing service with improved AI analysis
 * This service uses AI to better understand CSV data and map fields correctly
 */

import Papa from 'papaparse';
import { Product } from '../../shared/schema';
import { analyzeCSVStructureWithAI } from './enhanced-openai-service';

/**
 * Parses CSV string into an array of product objects with intelligent field detection enhanced by AI
 * @param csvString CSV content as a string
 * @returns Array of product objects
 */
export async function parseCSVWithAI(csvString: string): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting AI-enhanced CSV parsing");
      
      // First, parse the CSV to get the data
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log(`Successfully parsed CSV with ${results.data.length} rows and ${Object.keys(results.data[0] || {}).length} columns`);
            
            // Check if we have any data
            if (!results.data.length) {
              return resolve([]);
            }
            
            // Get column names
            const columnNames = Object.keys(results.data[0]);
            console.log("CSV columns:", columnNames.join(", "));
            
            // Take a sample of rows for AI analysis (limit to save token usage)
            const sampleRows = results.data.slice(0, Math.min(5, results.data.length));
            
            // Perform AI analysis of CSV structure
            console.log("Analyzing CSV structure with AI...");
            const aiAnalysis = await analyzeCSVStructureWithAI(sampleRows, columnNames);
            console.log("AI analysis complete. Creating field mappings.");
            
            // Create field mappings based on AI analysis
            const fieldMappings: Record<string, string> = {};
            
            if (aiAnalysis && aiAnalysis.columns) {
              aiAnalysis.columns.forEach((col: any) => {
                if (col.standardMapping && col.confidence >= 0.6) {
                  fieldMappings[col.name] = col.standardMapping;
                }
              });
            }
            
            console.log("AI-suggested field mappings:", fieldMappings);
            
            // Process each row to create product objects
            const products: Product[] = [];
            let currentIndex = 0;
            
            for (const row of results.data) {
              currentIndex++;
              if (currentIndex % 100 === 0) {
                console.log(`Processing row ${currentIndex}/${results.data.length}`);
              }
              
              // Create product ID (use existing or generate new)
              const productId = extractProductId(row) || generateRandomId();
              
              // Initialize product object with required fields
              const product: Product = {
                product_id: productId,
                title: null,
                description: null,
                price: null,
                brand: null,
                category: null,
                bullet_points: null,
                images: [],
                asin: null,
                status: "pending",
                created_at: new Date(),
                updated_at: new Date()
              };
              
              // Map CSV fields to product properties using AI-suggested mappings
              mapCSVRowToProduct(row, product, fieldMappings);
              
              products.push(product);
            }
            
            console.log(`Successfully created ${products.length} product objects from CSV`);
            resolve(products);
          } catch (error) {
            console.error("Error during AI-enhanced CSV processing:", error);
            reject(new Error(`Failed to process CSV with AI enhancement: ${error.message}`));
          }
        },
        error: (error: any) => {
          const message = error.message || 'Unknown parsing error';
          console.error("Error during CSV parsing:", message);
          reject(new Error(`Failed to parse CSV: ${message}`));
        }
      });
    } catch (error) {
      console.error("Exception during CSV parsing setup:", error);
      reject(new Error(`Failed to set up CSV parsing: ${error.message}`));
    }
  });
}

/**
 * Maps CSV row data to product fields using AI-suggested field mappings
 * @param row The CSV row data
 * @param product The product object to map to
 * @param fieldMappings AI-suggested mappings between CSV columns and product fields
 */
function mapCSVRowToProduct(row: any, product: Product, fieldMappings: Record<string, string>): void {
  // Process each field in the row
  for (const [key, value] of Object.entries(row)) {
    if (value === undefined || value === null || value === '') continue;
    
    const strValue = String(value).trim();
    
    // Use AI mapping if available, otherwise use simple normalization
    const mappedField = fieldMappings[key] || normalizeFieldName(key);
    
    // Handle special fields with custom processing
    if (mappedField === 'price') {
      // Extract numeric part if the price has currency symbols
      const numericPrice = strValue.replace(/[^0-9.]/g, '');
      const price = parseFloat(numericPrice);
      // Store as string (will be handled as decimal in the database)
      product.price = isNaN(price) ? null : String(price);
    }
    else if (mappedField === 'images') {
      // Handle image URLs (comma or semicolon separated)
      const imageUrls = strValue.split(/[,;]/).map(url => url.trim()).filter(url => url.length > 0);
      if (imageUrls.length > 0) {
        product.images = imageUrls;
      }
    }
    else if (mappedField === 'bullet_points') {
      // Handle bullet points (comma or semicolon separated)
      const bulletPoints = strValue.split(/[,;]/).map(point => point.trim()).filter(point => point.length > 0);
      if (bulletPoints.length > 0) {
        product.bullet_points = bulletPoints;
      }
    }
    else if (mappedField in product) {
      // Assign value to mapped field if it exists in the product object
      product[mappedField as keyof Product] = strValue;
    }
  }
}

/**
 * Normalizes a field name by converting to lowercase, removing special chars, and replacing spaces with underscores
 * @param fieldName The original field name
 * @returns Normalized field name
 */
function normalizeFieldName(fieldName: string): string {
  return fieldName
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_');
}

/**
 * Extracts a product ID from a CSV row, looking at various possible column names
 * @param row A row from the CSV data
 * @returns Product ID if found, or undefined
 */
function extractProductId(row: any): string | undefined {
  // Check various possible column names for product ID
  const idColumns = [
    'product_id', 'productid', 'id', 'sku', 'item_id', 'itemid',
    'product_code', 'productcode', 'asin', 'upc', 'ean', 'isbn',
    'part_number', 'partnumber', 'mpn', 'model_number', 'modelnumber',
    // Add capitalized versions
    'Product_ID', 'ProductID', 'ID', 'SKU', 'Item_ID', 'ItemID',
    'Product_Code', 'ProductCode', 'ASIN', 'UPC', 'EAN', 'ISBN',
    'Part_Number', 'PartNumber', 'MPN', 'Model_Number', 'ModelNumber',
    // Add spaced versions
    'Product ID', 'Product Id', 'Item ID', 'Item Id',
    'Product Code', 'Part Number', 'Model Number'
  ];
  
  // Try to find a column with a product ID
  for (const column of idColumns) {
    if (row[column] && String(row[column]).trim()) {
      return String(row[column]).trim();
    }
  }
  
  return undefined;
}

/**
 * Generates a random product ID
 * @returns Random product ID string
 */
function generateRandomId(): string {
  const prefix = 'PROD-';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}${id}`;
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
  products: any[],
  format: string = 'standard',
  includeHeaders: boolean = true,
  encodeUtf8: boolean = true
): string {
  if (!products || !products.length) {
    return '';
  }
  
  // Define fields based on format
  let fields: string[] = [];
  
  if (format === 'amazon') {
    fields = ['product_id', 'title', 'description', 'bullet_points', 'brand', 'category', 'price', 'images', 'asin'];
  } else if (format === 'ebay') {
    fields = ['product_id', 'title', 'description', 'bullet_points', 'brand', 'category', 'price', 'images'];
  } else if (format === 'etsy') {
    fields = ['product_id', 'title', 'description', 'brand', 'category', 'price', 'images', 'material', 'color'];
  } else {
    // Standard format with all fields
    fields = [
      'product_id', 'title', 'description', 'price', 'brand', 'category',
      'bullet_points', 'images', 'asin', 'status', 'created_at', 'updated_at'
    ];
  }
  
  // Convert products to format-specific rows
  const rows = products.map(product => {
    const row: Record<string, any> = {};
    
    fields.forEach(field => {
      // Special handling for arrays
      if (field === 'bullet_points' && Array.isArray(product[field])) {
        row[field] = product[field].join('; ');
      } else if (field === 'images' && Array.isArray(product[field])) {
        row[field] = product[field].join(', ');
      } else {
        row[field] = product[field] || '';
      }
    });
    
    return row;
  });
  
  // Generate CSV
  const csv = Papa.unparse({
    fields: includeHeaders ? fields : [],
    data: rows
  });
  
  // Add UTF-8 BOM if requested
  if (encodeUtf8) {
    return '\ufeff' + csv;
  }
  
  return csv;
}