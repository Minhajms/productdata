/**
 * Product Type Detection Testing Script
 * This script tests the product type detection and marketplace compliance features
 */

import { detectProductTypes, generateEnhancementPrompt } from './server/services/intelligent-csv-analyzer';
import { getProductTypePrompt, getMarketplaceGuidelines } from './server/services/smart-prompts';

// Test products from different categories
const testProducts = [
  // Electronics category
  {
    product_id: 'ELEC001',
    title: 'Wireless Bluetooth Headphones with Active Noise Cancellation',
    description: 'Premium over-ear headphones with 40-hour battery life, quick charge, and deep bass response.',
    price: '149.99',
    brand: 'SoundMaster',
    category: 'Electronics',
    bullet_points: ['40-hour battery life', 'Active noise cancellation', 'Bluetooth 5.0'],
    images: ['http://example.com/headphones.jpg'],
    asin: 'B08X1ZNPQR',
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date()
  },
  
  // Home & Kitchen category
  {
    product_id: 'HOME001',
    title: 'Stainless Steel French Press Coffee Maker',
    description: '34oz insulated coffee press with double-wall construction to maintain temperature longer.',
    price: '29.95',
    brand: 'KitchenPro',
    category: 'Home & Kitchen',
    bullet_points: ['34oz capacity', 'Double-wall insulation', 'Dishwasher safe'],
    images: ['http://example.com/french-press.jpg'],
    asin: 'B07T5ZNRST',
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date()
  },
  
  // Clothing category
  {
    product_id: 'CLTH001',
    title: 'Men\'s Waterproof Hiking Jacket',
    description: 'Breathable rain jacket with sealed seams and adjustable hood for outdoor adventures.',
    price: '79.99',
    brand: 'OutdoorGear',
    category: 'Clothing',
    bullet_points: ['Waterproof', 'Breathable fabric', 'Adjustable hood'],
    images: ['http://example.com/jacket.jpg'],
    asin: 'B09ZTQDWXY',
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Test product without explicit category (should be detected)
const unlabeledProduct = {
  product_id: 'UNLB001',
  title: 'Professional DSLR Camera with 24-70mm Lens',
  description: '24.2 megapixel full-frame sensor with 4K video recording capability and image stabilization.',
  price: '1299.99',
  brand: 'PhotoPro',
  category: null,
  bullet_points: null,
  images: ['http://example.com/camera.jpg'],
  asin: null,
  status: 'pending',
  created_at: new Date(),
  updated_at: new Date()
};

// Test product type detection
async function testProductTypeDetection() {
  console.log('\n--- Testing Product Type Detection ---');
  
  try {
    // Test with labeled products
    console.log('Testing with products that have category labels...');
    const detectionResults = await detectProductTypes(testProducts);
    
    console.log('Detection results:');
    console.log(`Product Type: ${detectionResults.productType}`);
    console.log(`Target Audience: ${detectionResults.targetAudience}`);
    console.log(`Key Features: ${detectionResults.keyFeatures.join(', ')}`);
    console.log(`Amazon Recommendations: ${detectionResults.marketplaceRecommendations?.amazon}`);
    
    // Test with unlabeled product
    console.log('\nTesting with unlabeled product...');
    const unlabeledDetection = await detectProductTypes([unlabeledProduct]);
    
    console.log('Detection results for unlabeled product:');
    console.log(`Product Type: ${unlabeledDetection.productType}`);
    console.log(`Target Audience: ${unlabeledDetection.targetAudience}`);
    console.log(`Key Features: ${unlabeledDetection.keyFeatures.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('Error in product type detection:', error);
    return false;
  }
}

// Test product-specific prompts
function testProductSpecificPrompts() {
  console.log('\n--- Testing Product-Specific Prompts ---');
  
  try {
    // Test with different product types
    const productTypes = ['electronics', 'kitchen_appliance', 'clothing', 'camera'];
    
    productTypes.forEach(productType => {
      console.log(`\nTesting prompts for product type: ${productType}`);
      
      const prompt = getProductTypePrompt(productType);
      console.log(`Prompt length: ${prompt.length} characters`);
      console.log(`Prompt preview: ${prompt.substring(0, 100)}...`);
    });
    
    return true;
  } catch (error) {
    console.error('Error in product-specific prompts:', error);
    return false;
  }
}

// Test marketplace guidelines
function testMarketplaceGuidelines() {
  console.log('\n--- Testing Marketplace Guidelines ---');
  
  try {
    // Test with different marketplaces
    const marketplaces = ['amazon', 'ebay', 'walmart', 'shopify', 'etsy'];
    
    marketplaces.forEach(marketplace => {
      console.log(`\nTesting guidelines for marketplace: ${marketplace}`);
      
      const guidelines = getMarketplaceGuidelines(marketplace);
      console.log(`Guidelines length: ${guidelines.length} characters`);
      console.log(`Guidelines preview: ${guidelines.substring(0, 100)}...`);
    });
    
    return true;
  } catch (error) {
    console.error('Error in marketplace guidelines:', error);
    return false;
  }
}

// Test enhancement prompt generation
function testEnhancementPromptGeneration() {
  console.log('\n--- Testing Enhancement Prompt Generation ---');
  
  try {
    // Test with different product types and marketplaces
    const combinations = [
      { productType: 'Bluetooth Headphones', marketplace: 'Amazon' },
      { productType: 'Coffee Maker', marketplace: 'Walmart' },
      { productType: 'Hiking Jacket', marketplace: 'eBay' },
      { productType: 'DSLR Camera', marketplace: 'Shopify' }
    ];
    
    combinations.forEach(({ productType, marketplace }) => {
      console.log(`\nTesting prompt for ${productType} on ${marketplace}:`);
      
      const prompt = generateEnhancementPrompt(productType, marketplace);
      console.log(`Prompt length: ${prompt.length} characters`);
      console.log(`Prompt preview: ${prompt.substring(0, 150)}...`);
    });
    
    return true;
  } catch (error) {
    console.error('Error in enhancement prompt generation:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  try {
    // Run tests
    const results = {
      detection: await testProductTypeDetection(),
      productPrompts: testProductSpecificPrompts(),
      marketplaceGuidelines: testMarketplaceGuidelines(),
      enhancementPrompts: testEnhancementPromptGeneration()
    };
    
    // Report results
    console.log('\n--- Test Results Summary ---');
    console.log('Product Type Detection:', results.detection ? 'PASSED' : 'FAILED');
    console.log('Product-Specific Prompts:', results.productPrompts ? 'PASSED' : 'FAILED');
    console.log('Marketplace Guidelines:', results.marketplaceGuidelines ? 'PASSED' : 'FAILED');
    console.log('Enhancement Prompt Generation:', results.enhancementPrompts ? 'PASSED' : 'FAILED');
    
    console.log('\nAll tests completed.');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run tests
runTests();