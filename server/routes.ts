import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseCSV, generateCSV } from "./services/csv-service";
import { parseCSVWithAI } from "./services/enhanced-csv-service";
import { enhanceProductData } from "./services/gemini-service";
import { enhanceProductDataWithOpenAI } from "./services/openai-service";
import { enhanceProductDataWithImprovedPrompts } from "./services/enhanced-openai-service";
import { analyzeProductTypes } from "./services/product-detection-service";
import { Product } from "@shared/schema";

// Configure multer with increased file size limits (50MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload CSV file
  app.post("/api/upload", upload.single("file"), async (req: Request & { file?: any }, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const marketplace = req.body.marketplace || "Amazon";
      console.log(`Processing file upload for marketplace: ${marketplace}`);
      
      // Parse CSV content
      const fileContent = req.file.buffer.toString("utf8");
      const products = await parseCSV(fileContent);
      
      console.log(`Parsed ${products.length} products from CSV`);
      
      if (products.length === 0) {
        return res.status(400).json({ 
          message: "No valid products found in CSV", 
          error: "The uploaded file appears to contain no valid product data"
        });
      }
      
      // Save to database
      console.log("Saving products to database");
      const savedProducts = await storage.saveProducts(products);
      console.log(`Successfully saved ${savedProducts.length} products to database`);
      
      // Verify we have the product data to return
      if (!savedProducts || savedProducts.length === 0) {
        console.error("Database saved products but returned empty array");
        // Try to recover by querying for the products directly
        const allProducts = await storage.getProducts();
        
        if (allProducts && allProducts.length > 0) {
          console.log(`Recovered ${allProducts.length} products from database after save issue`);
          return res.json({
            message: "File uploaded successfully with recovery",
            products: allProducts
          });
        } else {
          return res.status(500).json({
            message: "Upload succeeded but failed to retrieve saved products",
            error: "Database error: Failed to retrieve saved products"
          });
        }
      }
      
      res.json({
        message: "File uploaded successfully",
        products: savedProducts
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Error processing uploaded file", 
        error: errorMessage
      });
    }
  });

  // Enhance product data with OpenAI or Gemini API
  app.post("/api/enhance", async (req, res) => {
    try {
      const { products, productIds, marketplace } = req.body;
      let productsToEnhance = [];
      
      console.log("Enhance endpoint called with:", {
        hasProducts: products && Array.isArray(products), 
        productsLength: products?.length || 0,
        hasProductIds: productIds && Array.isArray(productIds),
        productIdsLength: productIds?.length || 0,
        marketplace
      });
      
      // If productIds are provided, fetch those products from the database
      if (productIds && Array.isArray(productIds) && productIds.length > 0) {
        console.log("Fetching products by IDs:", productIds);
        productsToEnhance = await storage.getProductsByIds(productIds);
        console.log(`Found ${productsToEnhance.length} products to enhance`);
      } 
      // Otherwise, use directly provided products array
      else if (products && Array.isArray(products) && products.length > 0) {
        productsToEnhance = products;
        console.log(`Using ${productsToEnhance.length} directly provided products`);
      }
      
      if (productsToEnhance.length === 0) {
        console.error("No products to enhance found. Request body:", req.body);
        return res.status(400).json({ 
          message: "No valid products provided",
          error: "Could not find products to enhance. Check that product IDs are valid or products array is not empty."
        });
      }
      
      // Determine which API to use
      let enhancedProducts;
      const openaiKey = process.env.OPENAI_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;
      
      // Keep track of errors for better error reporting
      const errors = [];
      
      // Try to use OpenAI first, fall back to Gemini if OpenAI fails
      if (openaiKey) {
        try {
          console.log("Using OpenAI API for product enhancement");
          enhancedProducts = await enhanceProductDataWithOpenAI(productsToEnhance, marketplace);
          
          // If we got here, OpenAI worked successfully (either with API or fallback mechanism)
          console.log("Product enhancement completed successfully with OpenAI");
        } catch (openaiError: any) {
          console.error("OpenAI API error:", openaiError);
          errors.push(`OpenAI error: ${openaiError.message || 'Unknown error'}`);
          
          // Try Gemini as fallback
          if (geminiKey) {
            try {
              console.log("Falling back to Gemini API");
              enhancedProducts = await enhanceProductData(productsToEnhance, marketplace);
              console.log("Product enhancement completed successfully with Gemini fallback");
            } catch (geminiError: any) {
              console.error("Gemini API error:", geminiError);
              errors.push(`Gemini error: ${geminiError.message || 'Unknown error'}`);
              
              // Both APIs failed, send specific error
              throw new Error(`Both OpenAI and Gemini enhancement failed. OpenAI: ${openaiError.message}, Gemini: ${geminiError.message}`);
            }
          } else {
            // No Gemini key available as fallback
            throw new Error(`OpenAI enhancement failed and no Gemini API key available. Error: ${openaiError.message}`);
          }
        }
      } else if (geminiKey) {
        // No OpenAI key, try Gemini
        try {
          console.log("Using Gemini API for product enhancement");
          enhancedProducts = await enhanceProductData(productsToEnhance, marketplace);
          console.log("Product enhancement completed successfully with Gemini");
        } catch (geminiError: any) {
          console.error("Gemini API error:", geminiError);
          errors.push(`Gemini error: ${geminiError.message || 'Unknown error'}`);
          throw new Error(`Gemini enhancement failed: ${geminiError.message}`);
        }
      } else {
        // No API keys available
        throw new Error("No API keys available for product enhancement. Please set either OPENAI_API_KEY or GEMINI_API_KEY in environment variables.");
      }
      
      // If we don't have enhanced products at this point, something went wrong
      if (!enhancedProducts) {
        throw new Error(`Enhancement process failed to generate results. Errors: ${errors.join(', ')}`);
      }
      
      // Save enhanced products
      await storage.updateProducts(enhancedProducts);
      
      res.json({
        message: "Products enhanced successfully",
        enhancedProducts
      });
    } catch (error) {
      console.error("Error enhancing products:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Error enhancing products", 
        error: errorMessage
      });
    }
  });

  // Export enhanced products
  app.post("/api/export", async (req, res) => {
    try {
      const { products, format, includeHeaders, encodeUtf8, marketplace } = req.body;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({ message: "No valid products provided" });
      }
      
      // Generate CSV
      const csv = generateCSV(products, format, includeHeaders, encodeUtf8);
      
      // Set response headers
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${marketplace.toLowerCase().replace(/\s+/g, '_')}_products.csv`);
      
      // Send CSV content
      res.send(csv);
      
      // Save export history
      await storage.saveExportHistory({
        marketplace,
        format,
        product_count: products.length,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error exporting products:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Error exporting products", 
        error: errorMessage
      });
    }
  });

  // Get product list
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json({ products });
    } catch (error) {
      console.error("Error fetching products:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Error fetching products", 
        error: errorMessage
      });
    }
  });

  // Get export history
  app.get("/api/export-history", async (req, res) => {
    try {
      const history = await storage.getExportHistory();
      res.json({ history });
    } catch (error) {
      console.error("Error fetching export history:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Error fetching export history", 
        error: errorMessage
      });
    }
  });
  
  // Analyze products to detect product types and suggest improvements
  app.post("/api/analyze-products", async (req, res) => {
    try {
      const { products, productIds } = req.body;
      let productsToAnalyze = [];
      
      console.log("Analyze endpoint called with:", {
        hasProducts: products && Array.isArray(products), 
        productsLength: products?.length || 0,
        hasProductIds: productIds && Array.isArray(productIds),
        productIdsLength: productIds?.length || 0
      });
      
      // If productIds are provided, fetch those products from the database
      if (productIds && Array.isArray(productIds) && productIds.length > 0) {
        console.log("Fetching products by IDs for analysis:", productIds);
        productsToAnalyze = await storage.getProductsByIds(productIds);
        console.log(`Found ${productsToAnalyze.length} products to analyze`);
      } 
      // Otherwise, use directly provided products array
      else if (products && Array.isArray(products) && products.length > 0) {
        productsToAnalyze = products;
        console.log(`Using ${productsToAnalyze.length} directly provided products for analysis`);
      }
      
      if (productsToAnalyze.length === 0) {
        console.error("No products to analyze found. Request body:", req.body);
        
        // Return empty analysis results rather than error to avoid blocking workflow
        return res.json({
          message: "No products to analyze, returning empty results",
          productTypes: [],
          enhancementSuggestions: ["Make sure products are uploaded successfully before analysis"],
          commonMissingFields: []
        });
      }
      
      // Analyze product types and suggest enhancements
      const analysis = await analyzeProductTypes(productsToAnalyze);
      
      res.json({
        message: "Product analysis completed",
        ...analysis
      });
    } catch (error) {
      console.error("Error analyzing products:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Error analyzing products", 
        error: errorMessage
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
