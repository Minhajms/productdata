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
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ 
          message: "Missing file", 
          error: "Please upload a CSV file" 
        });
      }
      
      // Check if marketplace was specified
      const marketplace = req.body.marketplace;
      if (!marketplace) {
        return res.status(400).json({ 
          message: "Missing marketplace parameter", 
          error: "Please specify a target marketplace" 
        });
      }
      
      console.log("MarketMind Agent: Processing CSV file directly...");
      
      // Process the uploaded file directly with no API calls
      const processResult = await processCSVFile(req.file.path);
      
      console.log(`MarketMind Agent: Successfully processed ${processResult.products.length} products from CSV`);
      console.log("Missing fields statistics:", processResult.stats.missingFields);
      
      // Check if any products were found
      if (!processResult.products || processResult.products.length === 0) {
        fs.unlinkSync(req.file.path); // Clean up file if no products found
        return res.status(400).json({
          message: "Invalid CSV data",
          error: "No valid products found in CSV"
        });
      }
      
      // Enhance each product and map to agent results
      console.log(`MarketMind Agent: Enhancing ${processResult.products.length} products for ${marketplace}...`);
      
      const results: any[] = [];
      
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
      const { category, marketplace } = req.body;
      
      if (!category || !marketplace) {
        return res.status(400).json({
          message: "Missing required parameters",
          error: "Both category and marketplace parameters are required"
        });
      }
      
      // For now, return a placeholder analysis to avoid API calls
      res.json({
        message: "Market analysis complete",
        analysis: {
          category,
          marketplace,
          topCompetitors: [],
          keywordOpportunities: [],
          pricingInsights: {},
          marketTrends: []
        }
      });
      
    } catch (error) {
      console.error("Error in market analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error analyzing market",
        error: errorMessage
      });
    }
  });
  
  // =========================================================
  // GET ANALYSES LIST
  // =========================================================
  app.get('/api/agent/analyses', async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      
      // Group products by type/category
      const productGroups: Record<string, any[]> = {};
      products.forEach(product => {
        const category = product.category || "Uncategorized";
        if (!productGroups[category]) {
          productGroups[category] = [];
        }
        productGroups[category].push(product);
      });
      
      res.json({
        message: "Analyses retrieved successfully",
        analyses: Object.entries(productGroups).map(([category, products]) => ({
          category,
          count: products.length,
          lastUpdated: Math.max(...products.map(p => new Date(p.updated_at || Date.now()).getTime())),
          products: products.map(p => ({
            id: p.product_id,
            title: p.title,
            updatedAt: p.updated_at
          }))
        }))
      });
      
    } catch (error) {
      console.error("Error retrieving analyses:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error retrieving analyses",
        error: errorMessage
      });
    }
  });
  
  // =========================================================
  // GET ANALYSIS BY PRODUCT ID
  // =========================================================
  app.get('/api/agent/analyses/:productId', async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({
          message: "Missing product ID",
          error: "Product ID is required"
        });
      }
      
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          error: `No product found with ID ${productId}`
        });
      }
      
      // Create a minimal agent result for the product
      const enhanced = enhanceProduct(product as any);
      const agentResult = mapToAgentResult(enhanced, "general");
      
      res.json({
        message: "Analysis retrieved successfully",
        analysis: agentResult
      });
      
    } catch (error) {
      console.error("Error retrieving analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Error retrieving analysis",
        error: errorMessage
      });
    }
  });
  
  // =========================================================
  // GET EXPORT HISTORY
  // =========================================================
  app.get('/api/agent/history', async (req: Request, res: Response) => {
    try {
      const history = await storage.getExportHistory();
      
      res.json({
        message: "Export history retrieved successfully",
        history: history.map(item => ({
          id: item.id,
          marketplace: item.marketplace,
          format: item.format,
          productCount: item.product_count,
          createdAt: item.created_at,
          status: item.status
        }))
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