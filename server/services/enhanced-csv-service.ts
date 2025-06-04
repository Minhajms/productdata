/**
 * Enhanced CSV processing service with improved AI analysis
 * This service uses AI to better understand CSV data and map fields correctly
 */

import Papa from 'papaparse';
import { Product } from '../../shared/schema';
import { analyzeCSVStructureWithAI } from './enhanced-openai-service';
import { Transform, TransformCallback } from 'stream';
import { createReadStream } from 'fs';
// @ts-ignore
import { detect } from 'jschardet';

interface CSVProcessingOptions {
  delimiter?: string;
  encoding?: BufferEncoding;
  chunkSize?: number;
  onProgress?: (progress: number) => void;
}

interface CSVProcessingResult {
  products: Product[];
  issues: string[];
  stats: {
    totalRows: number;
    processedRows: number;
    skippedRows: number;
    encoding: string;
    delimiter: string;
  };
}

interface EncodingResult {
  encoding: string;
  confidence: number;
}

interface PapaParseResult<T> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

/**
 * Detects CSV file encoding and delimiter
 */
async function detectCSVFormat(filePath: string): Promise<{ encoding: BufferEncoding; delimiter: string }> {
  return new Promise((resolve, reject) => {
    const sampleSize = 4096;
    const buffer = Buffer.alloc(sampleSize);
    const stream = createReadStream(filePath, { start: 0, end: sampleSize - 1 });
    
    stream.on('data', (chunk: Buffer) => {
      buffer.fill(chunk);
    });
    
    stream.on('end', () => {
      // Detect encoding
      const encodingResult = detect(buffer) as EncodingResult;
      const encoding = (encodingResult.encoding || 'utf-8') as BufferEncoding;
      
      // Detect delimiter
      const content = buffer.toString(encoding);
      const lines = content.split('\n').slice(0, 5);
      const delimiters = [',', ';', '\t', '|'];
      const delimiterCounts = delimiters.map(d => ({
        delimiter: d,
        count: lines.reduce((sum: number, line: string) => sum + (line.match(new RegExp(d, 'g')) || []).length, 0)
      }));
      
      const mostCommon = delimiterCounts.reduce((max, curr) => 
        curr.count > max.count ? curr : max
      );
      
      resolve({
        encoding,
        delimiter: mostCommon.delimiter
      });
    });
    
    stream.on('error', (error: Error) => reject(error));
  });
}

/**
 * Processes CSV file with streaming support for large files
 */
export async function processCSVFile(
  filePath: string,
  options: CSVProcessingOptions = {}
): Promise<CSVProcessingResult> {
  const format = await detectCSVFormat(filePath);
  const issues: string[] = [];
  const products: Product[] = [];
  let totalRows = 0;
  let processedRows = 0;
  let skippedRows = 0;
  
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, {
      encoding: options.encoding || format.encoding
    });
    
    const transform = new Transform({
      objectMode: true,
      transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
        try {
          const lines = chunk.toString().split('\n');
          totalRows += lines.length;
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const result = Papa.parse<Record<string, string>>(line, {
                delimiter: options.delimiter || format.delimiter,
                header: true
              });
              
              if (result.data && result.data.length > 0) {
                const row = result.data[0];
                const product = mapCSVRowToProduct(row);
                if (product) {
                  products.push(product);
                  processedRows++;
                } else {
                  skippedRows++;
                }
              }
            } catch (error) {
              if (error instanceof Error) {
                issues.push(`Error processing row: ${error.message}`);
              } else {
                issues.push('Unknown error processing row');
              }
              skippedRows++;
            }
          }
          
          if (options.onProgress) {
            options.onProgress(processedRows / totalRows);
          }
          
          callback();
        } catch (error) {
          if (error instanceof Error) {
            callback(error);
          } else {
            callback(new Error('Unknown error in transform'));
          }
        }
      }
    });
    
    stream
      .pipe(transform)
      .on('finish', () => {
        resolve({
          products,
          issues,
          stats: {
            totalRows,
            processedRows,
            skippedRows,
            encoding: format.encoding,
            delimiter: format.delimiter
          }
        });
      })
      .on('error', (error: Error) => reject(error));
  });
}

/**
 * Enhanced CSV parsing with support for multiple formats and large files
 */
export async function parseCSVWithAI(
  csvString: string,
  options: CSVProcessingOptions = {}
): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting AI-enhanced CSV parsing");
      
      // Detect delimiter if not provided
      const delimiter = options.delimiter || detectDelimiter(csvString);
      
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        delimiter,
        complete: async (results: PapaParseResult<Record<string, string>>) => {
          try {
            console.log(`Successfully parsed CSV with ${results.data.length} rows`);
            
            if (!results.data.length) {
              return resolve([]);
            }
            
            // Get column names and check for duplicates
            const firstRow = results.data[0];
            const columnNames = Object.keys(firstRow);
            const duplicateColumns = findDuplicateColumns(columnNames);
            
            if (duplicateColumns.length > 0) {
              console.warn("Found duplicate columns:", duplicateColumns);
            }
            
            // Take a sample of rows for AI analysis
            const sampleRows = results.data.slice(0, Math.min(5, results.data.length));
            
            // Perform AI analysis
            console.log("Analyzing CSV structure with AI...");
            const aiAnalysis = await analyzeCSVStructureWithAI(sampleRows, columnNames);
            
            // Create field mappings
            const fieldMappings = createFieldMappings(aiAnalysis, columnNames);
            
            // Process rows
            const products: Product[] = [];
            let currentIndex = 0;
            
            for (const row of results.data) {
              currentIndex++;
              if (currentIndex % 100 === 0) {
                console.log(`Processing row ${currentIndex}/${results.data.length}`);
                if (options.onProgress) {
                  options.onProgress(currentIndex / results.data.length);
                }
              }
              
              const product = mapCSVRowToProduct(row, fieldMappings);
              if (product) {
                products.push(product);
              }
            }
            
            console.log(`Successfully created ${products.length} product objects`);
            resolve(products);
          } catch (error) {
            console.error("Error during AI-enhanced CSV processing:", error);
            reject(new Error(`Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        }
      });
    } catch (error) {
      console.error("Exception during CSV parsing setup:", error);
      reject(new Error(`Failed to set up CSV parsing: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

/**
 * Detects the most likely delimiter in a CSV string
 */
function detectDelimiter(csvString: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const lines = csvString.split('\n').slice(0, 5);
  
  const delimiterCounts = delimiters.map(d => ({
    delimiter: d,
    count: lines.reduce((sum, line) => sum + (line.match(new RegExp(d, 'g')) || []).length, 0)
  }));
  
  const mostCommon = delimiterCounts.reduce((max, curr) => 
    curr.count > max.count ? curr : max
  );
  
  return mostCommon.delimiter;
}

/**
 * Finds duplicate column names in the CSV
 */
function findDuplicateColumns(columns: string[]): string[] {
  const counts = columns.reduce((acc, col) => {
    acc[col] = (acc[col] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .filter(([_, count]) => count > 1)
    .map(([col]) => col);
}

/**
 * Creates field mappings based on AI analysis
 */
function createFieldMappings(aiAnalysis: any, columnNames: string[]): Record<string, string> {
  const fieldMappings: Record<string, string> = {};
  
  if (aiAnalysis && aiAnalysis.columns) {
    aiAnalysis.columns.forEach((col: any) => {
      if (col.standardMapping && col.confidence >= 0.6) {
        fieldMappings[col.name] = col.standardMapping;
      }
    });
  }
  
  return fieldMappings;
}

/**
 * Maps a CSV row to a product object
 */
function mapCSVRowToProduct(row: Record<string, string>, fieldMappings?: Record<string, string>): Product | null {
  if (!row) return null;
  
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
  
  // Map CSV fields to product properties
  for (const [key, value] of Object.entries(row)) {
    if (value === undefined || value === null || value === '') continue;
    
    const strValue = String(value).trim();
    const mappedField = fieldMappings?.[key] || normalizeFieldName(key);
    
    // Handle special fields
    if (mappedField === 'price') {
      const numericPrice = strValue.replace(/[^0-9.]/g, '');
      const price = parseFloat(numericPrice);
      product.price = isNaN(price) ? null : String(price);
    }
    else if (mappedField === 'images') {
      const imageUrls = strValue.split(/[,;]/).map(url => url.trim()).filter(url => url.length > 0);
      if (imageUrls.length > 0) {
        product.images = imageUrls;
      }
    }
    else if (mappedField === 'bullet_points') {
      const bulletPoints = strValue.split(/[,;]/).map(point => point.trim()).filter(point => point.length > 0);
      if (bulletPoints.length > 0) {
        product.bullet_points = bulletPoints;
      }
    }
    else if (mappedField in product) {
      const stringFields = ['product_id', 'title', 'description', 'brand', 'category', 'asin', 'material', 'color', 'status', 'price'];
      if (stringFields.includes(mappedField)) {
        (product as any)[mappedField] = strValue;
      }
    }
  }
  
  return product;
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