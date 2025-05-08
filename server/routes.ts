import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseCSV, generateCSV } from "./services/csv-service";
import { enhanceProductData } from "./services/gemini-service";
import { enhanceProductDataWithOpenAI } from "./services/openai-service";
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
      
      // Parse CSV content
      const fileContent = req.file.buffer.toString("utf8");
      const products = await parseCSV(fileContent);
      
      // Save to database
      const savedProducts = await storage.saveProducts(products);
      
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
      const { products, marketplace } = req.body;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({ message: "No valid products provided" });
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
          enhancedProducts = await enhanceProductDataWithOpenAI(products, marketplace);
          
          // If we got here, OpenAI worked successfully (either with API or fallback mechanism)
          console.log("Product enhancement completed successfully with OpenAI");
        } catch (openaiError: any) {
          console.error("OpenAI API error:", openaiError);
          errors.push(`OpenAI error: ${openaiError.message || 'Unknown error'}`);
          
          // Try Gemini as fallback
          if (geminiKey) {
            try {
              console.log("Falling back to Gemini API");
              enhancedProducts = await enhanceProductData(products, marketplace);
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
          enhancedProducts = await enhanceProductData(products, marketplace);
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
      const { products } = req.body;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({ message: "No valid products provided" });
      }
      
      // Analyze product types and suggest enhancements
      const analysis = await analyzeProductTypes(products);
      
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
