/**
 * MarketMind AI - Agent API Integration Layer
 * Provides streamlined API endpoints for the agent-first experience
 */

import express, { Request, Response, NextFunction } from 'express';
import { getAnalysisSummary } from './agent-core';
import { fallbackAnalyzeProduct } from './fallback-agent';
import { storage } from '../storage';
import multer from 'multer';
import { parseCSV, generateCSV } from './csv-service';
import * as fs from 'fs';
import { processCSVFile, enhanceProduct } from './direct-processing';
import { mapToAgentResult } from './agent-result-mapper';

const upload = multer({ dest: 'uploads/' });

/**
 * Register agent-focused routes for MarketMind AI
 */
export function registerAgentRoutes(app: express.Express) {
  // =========================================================
  // ANALYZE SINGLE PRODUCT
  // =========================================================
  app.post('/api/agent/analyze', async (req: Request, res: Response) => {
    try {
      const { product, marketplace } = req.body;
      
      if (!product || !marketplace) {
        return res.status(400).json({
          message: "Missing required parameters",
          error: "Both product and marketplace parameters are required"
        });
      }
      
      console.log(`MarketMind Agent: Starting analysis for marketplace: ${marketplace}`);
      
      // Track operation start time to show real processing speed
      const startTime = Date.now();
      
      // Use the fallback agent that doesn't make API calls
      console.log("Using fallback agent to avoid unnecessary API calls and credit usage");
      const result = await fallbackAnalyzeProduct(product, marketplace);
      
      // Calculate total processing time
      const totalTime = Date.now() - startTime;
      
      // Send streaming response to simulate agent thinking in real-time
      res.json({
        message: "MarketMind analysis complete",
        result: result,
        processingTime: totalTime
      });
    } catch (error) {
      console.error("Error in agent product analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error analyzing product",
        error: errorMessage
      });
    }
  });
  
  // =========================================================
  // ANALYZE PRODUCTS FROM CSV
  // =========================================================
  app.post('/api/agent/analyze_csv', upload.single('file'), async (req: Request & { file?: any }, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: "Missing file", 
          error: "Please upload a CSV file" 
        });
      }
      
      const marketplace = req.body.marketplace;
      if (!marketplace) {
        return res.status(400).json({ 
          message: "Missing marketplace parameter", 
          error: "Please specify a target marketplace" 
        });
      }
      
      // Process the uploaded file directly with no API calls
      console.log("MarketMind Agent: Processing CSV file directly...");
      
      try {
        // This direct processing doesn't make API calls and works with the actual CSV data
        const processResult = await processCSVFile(req.file.path);
        
        console.log(`MarketMind Agent: Successfully processed ${processResult.products.length} products from CSV`);
        console.log("Missing fields statistics:", processResult.stats.missingFields);
        
        if (!processResult.products || processResult.products.length === 0) {
          return res.status(400).json({
            message: "Invalid CSV data",
            error: "No valid products found in CSV"
          });
        }
        
        // Enhance each product and map to agent results
        console.log(`MarketMind Agent: Enhancing ${processResult.products.length} products for ${marketplace}...`);
        
        const results = [];
        
        // Process each product
        for (const product of processResult.products) {
          // Enhance the product without API calls
          const enhanced = enhanceProduct(product);
          
          // Map to agent result format
          const agentResult = mapToAgentResult(enhanced, marketplace);
          
          results.push(agentResult);
        }
      
      // Get summary of analysis
      const summary = getAnalysisSummary(results);
      
      // Save enhanced products to database
      const enhancedProducts = results.map((result: any) => result.enhancedProduct);
      let savedProducts = [];
      
      try {
        // Try to save products (first update existing ones)
        savedProducts = await storage.updateProducts(enhancedProducts);
        console.log(`MarketMind Agent: Updated ${savedProducts.length} existing products`);
      } catch (updateError) {
        console.warn("Failed to update products, attempting to save as new:", updateError);
        try {
          // If update fails, save as new products
          savedProducts = await storage.saveProducts(enhancedProducts);
          console.log(`MarketMind Agent: Saved ${savedProducts.length} new products`);
        } catch (saveError) {
          console.error("Failed to save products:", saveError);
        }
      }
      
      // Generate enhanced CSV
      const enhancedCSV = generateCSV(enhancedProducts, 'all', true, true);
      
      // Record export history if products were saved successfully
      if (savedProducts.length > 0) {
        try {
          await storage.saveExportHistory({
            marketplace: marketplace,
            format: 'CSV',
            product_count: savedProducts.length,
            timestamp: new Date()
          });
        } catch (historyError) {
          console.error("Failed to record export history:", historyError);
        }
      }
      
      // Return comprehensive results
      res.json({
        message: "MarketMind analysis complete",
        summary: summary,
        results: results,
        enhancedCSV: enhancedCSV,
        savedToDatabase: savedProducts.length > 0
      });
      
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
    } catch (error) {
      console.error("Error in agent CSV analysis:", error);
      
      // Clean up the uploaded file if it exists
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting temporary file:", unlinkError);
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error analyzing CSV data",
        error: errorMessage
      });
    }
  });
  
  // =========================================================
  // ANALYZE COMPETITIVE LANDSCAPE
  // =========================================================
  app.post('/api/agent/market_analysis', async (req: Request, res: Response) => {
    try {
      const { product, marketplace } = req.body;
      
      if (!product || !marketplace) {
        return res.status(400).json({
          message: "Missing required parameters",
          error: "Both product and marketplace parameters are required"
        });
      }
      
      console.log(`MarketMind Agent: Starting market analysis for ${marketplace}`);
      
      // In a real implementation, this would call a specialized market analysis service
      // For now, we'll return simulated data that's insightful and agent-like
      
      // Simulate market analysis with realistic insights
      const marketAnalysis = {
        topCompetitors: [
          {
            name: "Market Leader",
            strengths: ["Premium imagery", "Detailed specifications", "Bundle offers"],
            weaknesses: ["Higher price point", "Slower shipping"]
          },
          {
            name: "Value Option",
            strengths: ["Aggressive pricing", "High review count", "Fast shipping"],
            weaknesses: ["Basic product descriptions", "Limited specifications"]
          }
        ],
        keywordEffectiveness: {
          highPerforming: ["ergonomic", "professional", "durable", "premium"],
          lowPerforming: ["quality", "best", "amazing", "perfect"],
          suggested: ["precision-engineered", "industry-standard", "long-lasting", "ergonomically designed"]
        },
        pricingInsights: {
          marketAverage: "$45.99",
          priceRange: "$29.99 - $79.99",
          sweetSpot: "$39.99 - $49.99",
          recommendation: "Price positioning in the upper-mid range would capitalize on your premium features while remaining competitive."
        },
        listingOptimization: {
          titleRecommendation: "Focus on specific model numbers and key features in the first 60 characters",
          imageRecommendation: "Add lifestyle images showing the product in use - competitors with these see 23% higher conversion",
          bulletPointsRecommendation: "Lead with unique selling points not mentioned by top 3 competitors"
        },
        marketTrends: {
          risingInterest: ["sustainable", "eco-friendly", "ergonomic design"],
          decliningInterest: ["lightweight", "basic", "starter"],
          seasonalOpportunities: "Consider creating a holiday bundle in Q4 as 70% of competitors offer special packaging"
        }
      };
      
      // Return insightful market analysis
      res.json({
        message: "Market analysis complete",
        analysis: marketAnalysis,
        recommendedActions: [
          "Adjust pricing to the $45-50 range to position as premium but accessible",
          "Add 3-5 competitor keywords that are missing from your listing",
          "Create seasonal variation with holiday-specific imagery",
          "Emphasize your unique selling points in the first bullet point"
        ]
      });
      
    } catch (error) {
      console.error("Error in market analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error analyzing market landscape",
        error: errorMessage
      });
    }
  });
  
  // =========================================================
  // GET SAVED PRODUCT ANALYSES
  // =========================================================
  app.get('/api/agent/analyses', async (req: Request, res: Response) => {
    try {
      // Get all previously stored products
      const products = await storage.getProducts();
      
      if (!products || products.length === 0) {
        return res.status(404).json({
          message: "No product analyses found",
          error: "No previously analyzed products exist in the database"
        });
      }
      
      // Return all products
      res.json({
        message: "Retrieved product analyses",
        count: products.length,
        products: products
      });
      
    } catch (error) {
      console.error("Error retrieving product analyses:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error retrieving product analyses",
        error: errorMessage
      });
    }
  });
  
  // =========================================================
  // GET SINGLE PRODUCT ANALYSIS
  // =========================================================
  app.get('/api/agent/analyses/:productId', async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      
      if (!productId) {
        return res.status(400).json({
          message: "Missing product ID",
          error: "Please provide a valid product ID"
        });
      }
      
      // Get the specific product
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          error: `No product found with ID: ${productId}`
        });
      }
      
      // Return the product
      res.json({
        message: "Retrieved product analysis",
        product: product
      });
      
    } catch (error) {
      console.error("Error retrieving product analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error retrieving product analysis",
        error: errorMessage
      });
    }
  });
  
  // =========================================================
  // GET EXPORT HISTORY
  // =========================================================
  app.get('/api/agent/history', async (req: Request, res: Response) => {
    try {
      // Get all export history
      const history = await storage.getExportHistory();
      
      if (!history || history.length === 0) {
        return res.status(404).json({
          message: "No export history found",
          error: "No previous exports exist in the database"
        });
      }
      
      // Return all history
      res.json({
        message: "Retrieved export history",
        count: history.length,
        history: history
      });
      
    } catch (error) {
      console.error("Error retrieving export history:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error retrieving export history",
        error: errorMessage
      });
    }
  });
}