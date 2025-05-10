/**
 * Field Mapping and Marketplace Compliance Testing Script
 * This script tests field mapping detection and marketplace compliance features
 */

import { analyzeProductData } from './server/services/intelligent-csv-analyzer';
import { parseCSV } from './server/services/csv-service';
import fs from 'fs';

// Create test CSV with non-standard field names
function createTestFieldMappingCSV() {
  console.log('Creating test CSV with non-standard field names...');
  
  const nonStandardCSV = `item_name,item_desc,cost,vendor,item_type,item_bullet_points,item_image
"Wireless Gaming Mouse","Ultra-precise optical sensor with 16000 DPI and programmable buttons",49.99,"TechGear","Computer Accessories","Fast response time|Ergonomic design|RGB lighting","http://example.com/mouse.jpg"
"Stainless Steel Cookware Set","10-piece set with glass lids and non-stick coating",129.95,"HomePro","Kitchen","Dishwasher safe|Induction compatible|Heat-resistant handles","http://example.com/cookware.jpg"
"Compact Digital Camera","20.1 megapixel sensor with 30x optical zoom and 4K video",299.00,"PhotoTech","Electronics","Optical image stabilization|Face detection|WiFi connectivity","http://example.com/camera.jpg"`;

  fs.writeFileSync('test_field_mapping.csv', nonStandardCSV);
  console.log('Test CSV created successfully.');
}

// Test field mapping detection
async function testFieldMappingDetection() {
  console.log('\n--- Testing Field Mapping Detection ---');
  
  try {
    createTestFieldMappingCSV();
    
    // Parse CSV with non-standard field names
    console.log('Parsing CSV with non-standard field names...');
    const csvContent = fs.readFileSync('test_field_mapping.csv', 'utf8');
    const initialProducts = await parseCSV(csvContent);
    
    if (initialProducts.length === 0) {
      throw new Error('No products parsed from CSV');
    }
    
    console.log(`Parsed ${initialProducts.length} products with initial parsing.`);
    console.log('First product with original fields:', JSON.stringify(initialProducts[0], null, 2));
    
    // Test intelligent field mapping
    console.log('\nRunning intelligent field mapping...');
    const analysisResult = await analyzeProductData(initialProducts);
    
    console.log('Field mapping results:');
    console.log(`Found ${analysisResult.fieldMappings.length} field mappings`);
    
    console.log('\nField mappings detected:');
    analysisResult.fieldMappings.forEach(mapping => {
      console.log(`${mapping.originalField} -> ${mapping.standardField} (confidence: ${mapping.confidence.toFixed(2)})`);
    });
    
    console.log('\nFirst product after mapping:');
    console.log(JSON.stringify(analysisResult.mappedProducts[0], null, 2));
    
    return true;
  } catch (error) {
    console.error('Error in field mapping detection:', error);
    return false;
  } finally {
    // Clean up
    if (fs.existsSync('test_field_mapping.csv')) {
      fs.unlinkSync('test_field_mapping.csv');
    }
  }
}

// Create test CSV with missing required fields for different marketplaces
function createTestMarketplaceCSV() {
  console.log('Creating test CSV with missing marketplace-required fields...');
  
  const marketplaceTestCSV = `product_id,title,description,price,brand,category,bullet_points,images,dimensions,shipping_weight,country_of_origin
"AMZN001","Bluetooth Speaker","Portable speaker with 10-hour battery life",39.99,"AudioTech","Electronics","Bluetooth 5.0|Water resistant|Compact design","http://example.com/speaker.jpg","3.5 x 3.5 x 2 inches","0.5 pounds","China"
"EBAY001","Vintage Watch","1970s collector's watch in excellent condition",299.95,"LuxuryTime","Jewelry","Manual wind|Leather strap|Original box included","http://example.com/watch.jpg","","1.2 ounces",""
"WLMT001","Kitchen Knife Set","Professional 5-piece knife set with block",89.99,"ChefPro","Kitchen","Stainless steel|Ergonomic handles|Includes sharpener","http://example.com/knives.jpg","14 x 6 x 4 inches","4.5 pounds","Germany"`;

  fs.writeFileSync('test_marketplace.csv', marketplaceTestCSV);
  console.log('Test CSV created successfully.');
}

// Test marketplace compliance
async function testMarketplaceCompliance() {
  console.log('\n--- Testing Marketplace Compliance ---');
  
  try {
    createTestMarketplaceCSV();
    
    // Parse CSV with marketplace products
    console.log('Parsing CSV with marketplace products...');
    const csvContent = fs.readFileSync('test_marketplace.csv', 'utf8');
    const marketplaceProducts = await parseCSV(csvContent);
    
    if (marketplaceProducts.length === 0) {
      throw new Error('No products parsed from CSV');
    }
    
    console.log(`Parsed ${marketplaceProducts.length} marketplace products.`);
    
    // Test marketplace compatibility analysis
    console.log('\nRunning marketplace compatibility analysis...');
    const analysisResult = await analyzeProductData(marketplaceProducts);
    
    console.log('Marketplace compatibility results:');
    Object.entries(analysisResult.analysis.marketplaceCompatibility).forEach(([marketplace, score]) => {
      console.log(`${marketplace}: ${score}% compatible`);
    });
    
    console.log('\nMissing fields detected:');
    console.log(analysisResult.analysis.missingFields.join(', '));
    
    console.log('\nRecommended enhancement priorities:');
    console.log(analysisResult.analysis.enhancementPriorities.join(', '));
    
    return true;
  } catch (error) {
    console.error('Error in marketplace compliance testing:', error);
    return false;
  } finally {
    // Clean up
    if (fs.existsSync('test_marketplace.csv')) {
      fs.unlinkSync('test_marketplace.csv');
    }
  }
}

// Run all tests
async function runTests() {
  try {
    // Run tests
    const results = {
      fieldMapping: await testFieldMappingDetection(),
      marketplaceCompliance: await testMarketplaceCompliance()
    };
    
    // Report results
    console.log('\n--- Test Results Summary ---');
    console.log('Field Mapping Detection:', results.fieldMapping ? 'PASSED' : 'FAILED');
    console.log('Marketplace Compliance:', results.marketplaceCompliance ? 'PASSED' : 'FAILED');
    
    console.log('\nAll tests completed.');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run tests
runTests();