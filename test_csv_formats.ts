/**
 * CSV Format Testing Script
 * This script tests various CSV formats and delimiters with our system
 */

import fs from 'fs';
import path from 'path';
import { parseCSV } from './server/services/csv-service';
import { parseCSVWithAI } from './server/services/enhanced-csv-service';
import { analyzeProductData } from './server/services/intelligent-csv-analyzer';

// Function to create test CSV files with different formats
function createTestCSVs() {
  console.log('Creating test CSV files...');
  
  // Standard CSV (comma-delimited)
  const standardCSV = `product_id,title,description,price,brand,category,images
PROD001,Classic Men's T-Shirt,A comfortable and durable cotton t-shirt for everyday wear,19.99,FashionBrand,Clothing,http://example.com/img1.jpg
PROD002,Wireless Bluetooth Headphones,High-quality sound with noise cancellation and long battery life,89.95,,Electronics,http://example.com/img2.jpg
PROD003,Stainless Steel Water Bottle,Keep your drinks hot or cold for hours with this insulated bottle,25.50,EcoWare,,http://example.com/img3.jpg`;

  // Semicolon-delimited CSV
  const semicolonCSV = `product_id;title;description;price;brand;category;images
PROD001;Classic Men's T-Shirt;A comfortable and durable cotton t-shirt for everyday wear;19.99;FashionBrand;Clothing;http://example.com/img1.jpg
PROD002;Wireless Bluetooth Headphones;High-quality sound with noise cancellation and long battery life;89.95;;Electronics;http://example.com/img2.jpg
PROD003;Stainless Steel Water Bottle;Keep your drinks hot or cold for hours with this insulated bottle;25.50;EcoWare;;http://example.com/img3.jpg`;

  // Tab-delimited CSV
  const tabCSV = `product_id\ttitle\tdescription\tprice\tbrand\tcategory\timages
PROD001\tClassic Men's T-Shirt\tA comfortable and durable cotton t-shirt for everyday wear\t19.99\tFashionBrand\tClothing\thttp://example.com/img1.jpg
PROD002\tWireless Bluetooth Headphones\tHigh-quality sound with noise cancellation and long battery life\t89.95\t\tElectronics\thttp://example.com/img2.jpg
PROD003\tStainless Steel Water Bottle\tKeep your drinks hot or cold for hours with this insulated bottle\t25.50\tEcoWare\t\thttp://example.com/img3.jpg`;

  // CSV with quoted fields
  const quotedCSV = `product_id,title,description,price,brand,category,images
"PROD001","Classic Men's T-Shirt","A comfortable, and durable ""cotton"" t-shirt for everyday wear","19.99","FashionBrand","Clothing","http://example.com/img1.jpg"
"PROD002","Wireless Bluetooth Headphones","High-quality sound with noise cancellation, and long battery life","89.95","","Electronics","http://example.com/img2.jpg"
"PROD003","Stainless Steel Water Bottle","Keep your drinks hot or cold for hours, with this insulated bottle","25.50","EcoWare","","http://example.com/img3.jpg"`;

  // Write test files
  fs.writeFileSync('test_standard.csv', standardCSV);
  fs.writeFileSync('test_semicolon.csv', semicolonCSV);
  fs.writeFileSync('test_tab.csv', tabCSV);
  fs.writeFileSync('test_quoted.csv', quotedCSV);
  
  console.log('Test CSV files created successfully.');
}

// Test standard CSV parsing
async function testStandardCSVParsing() {
  console.log('\n--- Testing Standard CSV Parsing ---');
  try {
    const csvContent = fs.readFileSync('test_standard.csv', 'utf8');
    const products = await parseCSV(csvContent);
    console.log(`Parsed ${products.length} products successfully.`);
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
    return true;
  } catch (error) {
    console.error('Error parsing standard CSV:', error);
    return false;
  }
}

// Test semicolon-delimited CSV parsing
async function testSemicolonCSVParsing() {
  console.log('\n--- Testing Semicolon CSV Parsing ---');
  try {
    const csvContent = fs.readFileSync('test_semicolon.csv', 'utf8');
    const products = await parseCSV(csvContent);
    console.log(`Parsed ${products.length} products successfully.`);
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
    return true;
  } catch (error) {
    console.error('Error parsing semicolon CSV:', error);
    return false;
  }
}

// Test tab-delimited CSV parsing
async function testTabCSVParsing() {
  console.log('\n--- Testing Tab CSV Parsing ---');
  try {
    const csvContent = fs.readFileSync('test_tab.csv', 'utf8');
    const products = await parseCSV(csvContent);
    console.log(`Parsed ${products.length} products successfully.`);
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
    return true;
  } catch (error) {
    console.error('Error parsing tab CSV:', error);
    return false;
  }
}

// Test quoted CSV parsing
async function testQuotedCSVParsing() {
  console.log('\n--- Testing Quoted CSV Parsing ---');
  try {
    const csvContent = fs.readFileSync('test_quoted.csv', 'utf8');
    const products = await parseCSV(csvContent);
    console.log(`Parsed ${products.length} products successfully.`);
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
    return true;
  } catch (error) {
    console.error('Error parsing quoted CSV:', error);
    return false;
  }
}

// Test AI-enhanced CSV parsing
async function testAIEnhancedParsing() {
  console.log('\n--- Testing AI-Enhanced CSV Parsing ---');
  try {
    const csvContent = fs.readFileSync('test_standard.csv', 'utf8');
    const products = await parseCSVWithAI(csvContent);
    console.log(`AI-enhanced parsing successful for ${products.length} products.`);
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
    return true;
  } catch (error) {
    console.error('Error in AI-enhanced parsing:', error);
    return false;
  }
}

// Test intelligent CSV analysis
async function testIntelligentAnalysis() {
  console.log('\n--- Testing Intelligent CSV Analysis ---');
  try {
    const csvContent = fs.readFileSync('test_standard.csv', 'utf8');
    const initialProducts = await parseCSV(csvContent);
    
    if (initialProducts.length === 0) {
      throw new Error('No products parsed from CSV');
    }
    
    const analysisResult = await analyzeProductData(initialProducts);
    console.log('Analysis results:');
    console.log(`Product type: ${analysisResult.analysis.productType}`);
    console.log(`Confidence: ${analysisResult.analysis.confidence}`);
    console.log(`Field mappings: ${analysisResult.fieldMappings.length}`);
    console.log(`Mapped products: ${analysisResult.mappedProducts.length}`);
    
    return true;
  } catch (error) {
    console.error('Error in intelligent analysis:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  try {
    // Create test files
    createTestCSVs();
    
    // Run tests
    const results = {
      standard: await testStandardCSVParsing(),
      semicolon: await testSemicolonCSVParsing(),
      tab: await testTabCSVParsing(),
      quoted: await testQuotedCSVParsing(),
      ai: await testAIEnhancedParsing(),
      analysis: await testIntelligentAnalysis()
    };
    
    // Report results
    console.log('\n--- Test Results Summary ---');
    console.log('Standard CSV Parsing:', results.standard ? 'PASSED' : 'FAILED');
    console.log('Semicolon CSV Parsing:', results.semicolon ? 'PASSED' : 'FAILED');
    console.log('Tab CSV Parsing:', results.tab ? 'PASSED' : 'FAILED');
    console.log('Quoted CSV Parsing:', results.quoted ? 'PASSED' : 'FAILED');
    console.log('AI-Enhanced Parsing:', results.ai ? 'PASSED' : 'FAILED');
    console.log('Intelligent Analysis:', results.analysis ? 'PASSED' : 'FAILED');
    
    // Cleanup test files
    console.log('\nCleaning up test files...');
    fs.unlinkSync('test_standard.csv');
    fs.unlinkSync('test_semicolon.csv');
    fs.unlinkSync('test_tab.csv');
    fs.unlinkSync('test_quoted.csv');
    
    console.log('All tests completed.');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run tests
runTests();