import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseCSV, generateCSV } from "./services/csv-service";
import { enhanceProductData } from "./services/gemini-service";
import { enhanceProductDataWithOpenAI } from "./services/openai-service";
import { analyzeProductTypes } from "./services/product-detection-service";
import { Product } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

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
      res.status(500).json({ message: "Error processing uploaded file" });
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
      
      // Try to use OpenAI first, fall back to Gemini if OpenAI fails
      if (openaiKey) {
        try {
          console.log("Using OpenAI API for product enhancement");
          enhancedProducts = await enhanceProductDataWithOpenAI(products, marketplace);
        } catch (openaiError) {
          console.error("OpenAI API error:", openaiError);
          
          // If Gemini key exists, try that as fallback
          if (geminiKey) {
            console.log("Falling back to Gemini API");
            enhancedProducts = await enhanceProductData(products, marketplace);
          } else {
            throw new Error("OpenAI enhancement failed and no Gemini API key available");
          }
        }
      } else if (geminiKey) {
        // No OpenAI key, try Gemini
        console.log("Using Gemini API for product enhancement");
        enhancedProducts = await enhanceProductData(products, marketplace);
      } else {
        // No API keys available
        throw new Error("No API keys available for product enhancement");
      }
      
      // Save enhanced products
      await storage.updateProducts(enhancedProducts);
      
      res.json({
        message: "Products enhanced successfully",
        enhancedProducts
      });
    } catch (error) {
      console.error("Error enhancing products:", error);
      res.status(500).json({ message: "Error enhancing products" });
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
      res.status(500).json({ message: "Error exporting products" });
    }
  });

  // Get product list
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json({ products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // Get export history
  app.get("/api/export-history", async (req, res) => {
    try {
      const history = await storage.getExportHistory();
      res.json({ history });
    } catch (error) {
      console.error("Error fetching export history:", error);
      res.status(500).json({ message: "Error fetching export history" });
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
      res.status(500).json({ message: "Error analyzing products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
