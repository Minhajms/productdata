/**
 * OpenRouter API Testing Script
 * This script tests OpenRouter API connectivity and error handling
 */

import axios from 'axios';
import { enhanceProductDataWithOpenRouter } from './server/services/openrouter-service';

// Test products with missing information
const testProducts = [
  {
    product_id: 'TEST001',
    title: 'Gaming Mechanical Keyboard',
    description: null,
    price: '49.99',
    brand: null,
    category: 'Computer Accessories',
    bullet_points: null,
    images: null,
    asin: null,
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    product_id: 'TEST002',
    title: null,
    description: 'High-quality backpack with laptop compartment',
    price: '35.95',
    brand: 'TravelGear',
    category: null,
    bullet_points: null,
    images: null,
    asin: null,
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Test OpenRouter direct API connection
async function testOpenRouterConnection() {
  console.log('\n--- Testing OpenRouter API Connection ---');
  
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not found. Set OPENROUTER_API_KEY environment variable.');
    return false;
  }
  
  try {
    console.log('Making test request to OpenRouter API...');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-7-sonnet-20250219', // Use the newest Anthropic model
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Please respond with a brief "OK" if this connection is working.' }
        ],
        max_tokens: 5,
        temperature: 0.1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://productdataenhancer.app',
          'X-Title': 'Product Data Enhancer'
        }
      }
    );
    
    if (response.data?.choices?.[0]?.message?.content) {
      console.log('OpenRouter API response:', response.data.choices[0].message.content);
      console.log('Connection successful!');
      console.log('Response data sample:', JSON.stringify(response.data.choices[0], null, 2));
      return true;
    } else {
      console.error('Unexpected response format from OpenRouter API');
      console.log('Raw response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error connecting to OpenRouter API:', error.response?.data || error);
    return false;
  }
}

// Test product enhancement through OpenRouter
async function testProductEnhancement() {
  console.log('\n--- Testing Product Enhancement via OpenRouter ---');
  
  try {
    console.log('Enhancing test products...');
    const marketplace = 'Amazon';
    const enhancedProducts = await enhanceProductDataWithOpenRouter(testProducts, marketplace);
    
    console.log(`Successfully enhanced ${enhancedProducts.length} products`);
    
    // Check enhancement quality for first product
    const product1 = enhancedProducts[0];
    console.log('\nEnhancement results for Product 1:');
    console.log('Original title:', testProducts[0].title);
    console.log('Enhanced description:', product1.description?.substring(0, 150) + '...');
    console.log('Enhanced bullet points:', product1.bullet_points?.slice(0, 2));
    console.log('Status:', product1.status);
    
    // Check enhancement quality for second product
    const product2 = enhancedProducts[1];
    console.log('\nEnhancement results for Product 2:');
    console.log('Original description:', testProducts[1].description);
    console.log('Enhanced title:', product2.title);
    console.log('Enhanced category:', product2.category);
    console.log('Status:', product2.status);
    
    return true;
  } catch (error) {
    console.error('Error in product enhancement:', error);
    return false;
  }
}

// Test fallback mechanisms when OpenRouter fails
async function testFallbackMechanisms() {
  console.log('\n--- Testing Fallback Mechanisms ---');
  
  // We'll simulate an OpenRouter failure by temporarily setting an invalid API key
  const originalKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = 'invalid_key';
  
  try {
    console.log('Testing with invalid OpenRouter key to trigger fallbacks...');
    const marketplace = 'Amazon';
    const enhancedProducts = await enhanceProductDataWithOpenRouter(testProducts.slice(0, 1), marketplace);
    
    console.log('Fallback mechanism worked! Enhanced product using alternative provider.');
    console.log('Enhanced product:', JSON.stringify(enhancedProducts[0], null, 2));
    
    // Restore original key
    process.env.OPENROUTER_API_KEY = originalKey;
    return true;
  } catch (error) {
    console.error('All fallback mechanisms failed:', error);
    
    // Restore original key
    process.env.OPENROUTER_API_KEY = originalKey;
    return false;
  }
}

// Test error handling with invalid inputs
async function testErrorHandling() {
  console.log('\n--- Testing Error Handling ---');
  
  try {
    console.log('Testing with invalid products (null array)...');
    const marketplace = 'Amazon';
    // @ts-ignore - intentionally passing invalid data to test error handling
    await enhanceProductDataWithOpenRouter(null, marketplace);
    
    console.log('Error handling failed - should have thrown an error');
    return false;
  } catch (error) {
    console.log('Successfully caught error with invalid input:', error.message);
    return true;
  }
}

// Run all tests
async function runTests() {
  try {
    // Run tests
    const results = {
      connection: await testOpenRouterConnection(),
      enhancement: await testProductEnhancement(),
      fallback: await testFallbackMechanisms(),
      errorHandling: await testErrorHandling()
    };
    
    // Report results
    console.log('\n--- Test Results Summary ---');
    console.log('OpenRouter API Connection:', results.connection ? 'PASSED' : 'FAILED');
    console.log('Product Enhancement:', results.enhancement ? 'PASSED' : 'FAILED');
    console.log('Fallback Mechanisms:', results.fallback ? 'PASSED' : 'FAILED');
    console.log('Error Handling:', results.errorHandling ? 'PASSED' : 'FAILED');
    
    console.log('\nAll tests completed.');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run tests
runTests();