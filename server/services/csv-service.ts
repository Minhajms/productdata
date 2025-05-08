import Papa from 'papaparse';
import { Product } from '@shared/schema';

/**
 * Parses CSV string into an array of product objects with intelligent field detection
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
          // Analyze CSV structure first to better understand the data
          const csvStructure = analyzeCSVStructure(results.data);
          console.log("CSV Analysis:", JSON.stringify(csvStructure, null, 2));
          
          const products: Product[] = [];
          
          for (const row of results.data) {
            if (typeof row !== 'object' || row === null) continue;
            
            const product: Product = {
              product_id: extractProductId(row) || generateRandomId(),
              title: null,
              description: null,
              price: null,
              brand: null,
              category: null,
              bullet_points: null,
              images: null,
              asin: null,
              status: 'pending',
              created_at: new Date(),
              updated_at: new Date()
            };
            
            // Map CSV columns to product fields using intelligent mapping
            mapCSVRowToProduct(row, product, csvStructure);
            
            products.push(product);
          }
          
          resolve(products);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error}`));
        }
      },
      error: (error: Papa.ParseError) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
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
    'part_number', 'partnumber', 'mpn', 'model_number', 'modelnumber'
  ];
  
  // Also check for capitalized and spaced versions
  const capitalizedIdColumns = idColumns.map(col => 
    col.charAt(0).toUpperCase() + col.slice(1)
  );
  const spacedIdColumns = idColumns.map(col => 
    col.replace(/_/g, ' ')
  );
  const capitalizedSpacedIdColumns = spacedIdColumns.map(col => 
    col.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
  
  // Complete list of possible ID column names
  const allPossibleIdColumns = [
    ...idColumns, 
    ...capitalizedIdColumns, 
    ...spacedIdColumns,
    ...capitalizedSpacedIdColumns
  ];
  
  // Check each possible column name
  for (const column of allPossibleIdColumns) {
    if (row[column] && typeof row[column] === 'string' && row[column].trim() !== '') {
      return row[column].trim();
    }
  }
  
  return undefined;
}

/**
 * Analyzes CSV structure to understand data formats and column patterns
 * @param data The parsed CSV data
 * @returns Analysis of the CSV structure
 */
function analyzeCSVStructure(data: any[]): any {
  if (!data || data.length === 0) {
    return { columnCount: 0, columns: {}, rowCount: 0 };
  }
  
  // Get the first row to determine columns
  const firstRow = data[0];
  const columns: Record<string, { 
    type: string, 
    nonEmptyCount: number,
    valueExamples: string[],
    possibleMappings: string[]
  }> = {};
  
  // Analyze column names and guess their purpose
  for (const key of Object.keys(firstRow)) {
    columns[key] = {
      type: 'unknown',
      nonEmptyCount: 0,
      valueExamples: [],
      possibleMappings: []
    };
  }
  
  // Analyze all rows to determine column types and non-empty counts
  for (const row of data) {
    for (const [key, value] of Object.entries(row)) {
      if (!columns[key]) continue;
      
      const strValue = String(value || '').trim();
      
      // Count non-empty values
      if (strValue !== '') {
        columns[key].nonEmptyCount++;
      
        // Collect value examples (up to 3 per column)
        if (columns[key].valueExamples.length < 3 && !columns[key].valueExamples.includes(strValue)) {
          columns[key].valueExamples.push(strValue);
        }
      }
      
      // Determine column type
      if (columns[key].type === 'unknown') {
        if (strValue === '') {
          continue; // Skip empty values for type detection
        } else if (!isNaN(Number(strValue)) && strValue.indexOf('.') !== -1) {
          columns[key].type = 'decimal';
        } else if (!isNaN(Number(strValue))) {
          columns[key].type = 'integer';
        } else if (strValue.toLowerCase() === 'true' || strValue.toLowerCase() === 'false') {
          columns[key].type = 'boolean';
        } else if (strValue.indexOf(';') !== -1 || strValue.indexOf(',') !== -1) {
          columns[key].type = 'list';
        } else if (new Date(strValue).toString() !== 'Invalid Date' && isNaN(Number(strValue))) {
          columns[key].type = 'date';
        } else {
          columns[key].type = 'string';
        }
      }
      
      // Try to map column names to standard product fields
      if (columns[key].possibleMappings.length === 0) {
        const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
        
        if (/product[_\s]*id|item[_\s]*id|sku|asin|upc|ean|isbn|mpn|product[_\s]*code/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('product_id');
        } else if (/title|name|product[_\s]*name|item[_\s]*name/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('title');
        } else if (/desc|description|product[_\s]*desc|product[_\s]*description|long[_\s]*desc/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('description');
        } else if (/price|cost|msrp|retail[_\s]*price|sale[_\s]*price/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('price');
        } else if (/brand|manufacturer|vendor|supplier/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('brand');
        } else if (/category|department|product[_\s]*type|type|group/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('category');
        } else if (/bullet|feature|highlight|key[_\s]*feature|point/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('bullet_points');
        } else if (/image|picture|photo|img|url|image[_\s]*url|main[_\s]*image/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('images');
        } else if (/weight/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('weight');
        } else if (/dimension|size|length|width|height|measurement/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('dimensions');
        } else if (/color|colour/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('color');
        } else if (/material|fabric|composition/i.test(normalizedKey)) {
          columns[key].possibleMappings.push('material');
        }
      }
    }
  }
  
  // Calculate fill rate for each column
  const totalRows = data.length;
  const columnArray = Object.entries(columns).map(([name, info]) => ({
    name,
    type: info.type,
    fillRate: totalRows > 0 ? (info.nonEmptyCount / totalRows) * 100 : 0,
    examples: info.valueExamples,
    possibleMappings: info.possibleMappings
  }));
  
  // Sort columns by fill rate (descending)
  columnArray.sort((a, b) => b.fillRate - a.fillRate);
  
  return {
    rowCount: data.length,
    columnCount: Object.keys(columns).length,
    columns: columnArray
  };
}

/**
 * Maps CSV row data to product fields using intelligent field detection
 * @param row The CSV row data
 * @param product The product object to map to
 * @param csvStructure Analysis of the CSV structure
 */
function mapCSVRowToProduct(row: any, product: Product, csvStructure: any): void {
  // Create a mapping from CSV columns to product fields
  const columnMappings: Record<string, string> = {};
  
  // Use the CSV structure analysis to determine field mappings
  for (const column of csvStructure.columns) {
    if (column.possibleMappings.length > 0) {
      columnMappings[column.name] = column.possibleMappings[0];
    }
  }
  
  // Process each field in the row
  for (const [key, value] of Object.entries(row)) {
    if (value === undefined || value === null || value === '') continue;
    
    const strValue = String(value).trim();
    const mappedField = columnMappings[key] || key.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Handle special fields
    if (mappedField === 'price') {
      // Extract numeric part if the price has currency symbols
      const numericPrice = strValue.replace(/[^0-9.]/g, '');
      const price = parseFloat(numericPrice);
      // Store as string (will be handled as decimal in the database)
      product.price = isNaN(price) ? null : String(price);
    } else if (mappedField === 'images') {
      // Check for different image separators (semicolon, comma, space)
      if (strValue.includes(';')) {
        product.images = strValue.split(';').map(img => img.trim()).filter(Boolean);
      } else if (strValue.includes(',')) {
        product.images = strValue.split(',').map(img => img.trim()).filter(Boolean);
      } else if (strValue.includes(' ') && strValue.includes('http')) {
        // If it looks like multiple URLs separated by spaces
        product.images = strValue.split(' ').map(img => img.trim()).filter(url => url.startsWith('http'));
      } else {
        // Single image
        product.images = [strValue];
      }
    } else if (mappedField === 'bullet_points') {
      // Check for different bullet point separators
      if (strValue.includes(';')) {
        product.bullet_points = strValue.split(';').map(point => point.trim()).filter(Boolean);
      } else if (strValue.includes(',')) {
        product.bullet_points = strValue.split(',').map(point => point.trim()).filter(Boolean);
      } else if (strValue.includes('\n')) {
        product.bullet_points = strValue.split('\n').map(point => point.trim()).filter(Boolean);
      } else {
        // Single bullet point
        product.bullet_points = [strValue];
      }
    } else if (
      mappedField === 'title' || 
      mappedField === 'description' || 
      mappedField === 'brand' || 
      mappedField === 'category' || 
      mappedField === 'asin'
    ) {
      // For standard fields in our schema
      (product as any)[mappedField] = strValue;
    }
    // We're ignoring any fields not in our schema (dimensions, weight, color, material, etc.)
  }
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
