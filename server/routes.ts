import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseCSV, generateCSV } from "./services/csv-service";
import { parseCSVWithAI } from "./services/enhanced-csv-service";
import { enhanceProductData } from "./services/gemini-service";
import { enhanceProductDataWithOpenAI } from "./services/openai-service";
import { enhanceProductDataWithImprovedPrompts } from "./services/enhanced-openai-service";
import { enhanceProductDataWithAnthropic } from "./services/anthropic-service";
import { enhanceProductDataWithOpenRouter } from "./services/openrouter-service";
import { analyzeProductTypes } from "./services/product-detection-service";
import { analyzeProductData, detectProductTypes, generateEnhancementPrompt } from "./services/intelligent-csv-analyzer";
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
      
      // Check what level of AI enhancement to use
      const useAI = req.body.useAI === 'true';
      const useIntelligentAnalysis = req.body.useIntelligentAnalysis === 'true';
      let products;
      
      if (useIntelligentAnalysis) {
        console.log("Using intelligent CSV analysis with OpenRouter for advanced field detection");
        try {
          // First parse the CSV with basic parsing to get initial product array
          const initialProducts = await parseCSV(fileContent);
          
          if (initialProducts.length === 0) {
            throw new Error("No valid products found in CSV during initial parsing");
          }
          
          // Then use intelligent analysis to improve the parsing
          const intelligentAnalysis = await analyzeProductData(initialProducts);
          products = intelligentAnalysis.mappedProducts;
          
          console.log("Intelligent CSV analysis completed successfully");
          console.log(`Detected product type: ${intelligentAnalysis.analysis.productType} (confidence: ${intelligentAnalysis.analysis.confidence.toFixed(2)})`);
          console.log(`Field mappings applied: ${intelligentAnalysis.fieldMappings.length}`);
          
        } catch (aiError) {
          console.error("Intelligent CSV analysis failed:", aiError);
          console.log("Falling back to standard AI-enhanced CSV parsing");
          
          try {
            products = await parseCSVWithAI(fileContent);
          } catch (fallbackError) {
            console.error("AI-enhanced CSV parsing also failed:", fallbackError);
            console.log("Falling back to standard CSV parsing");
            products = await parseCSV(fileContent);
          }
        }
      } else if (useAI) {
        console.log("Using AI-enhanced CSV parsing");
        try {
          products = await parseCSVWithAI(fileContent);
        } catch (aiError) {
          console.error("AI-enhanced CSV parsing failed:", aiError);
          console.log("Falling back to standard CSV parsing");
          products = await parseCSV(fileContent);
        }
      } else {
        console.log("Using standard CSV parsing (no AI enhancement)");
        products = await parseCSV(fileContent);
      }
      
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
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      const openrouterKey = process.env.OPENROUTER_API_KEY;
      const aiProvider = req.body.aiProvider || 'openrouter'; // Options: 'openrouter', 'openai', 'gemini', 'anthropic', 'enhanced'
      const modelPreference = req.body.modelPreference || 'gpt4o'; // Options: 'gpt4o', 'gemini', 'claude', 'mistral', 'llama'
      
      // Keep track of errors for better error reporting
      const errors = [];
      
      if (aiProvider === 'openrouter' && openrouterKey) {
        try {
          console.log(`Using OpenRouter API with ${modelPreference} model for product enhancement`);
          enhancedProducts = await enhanceProductDataWithOpenRouter(productsToEnhance, marketplace, modelPreference);
          console.log(`Product enhancement completed successfully with OpenRouter (${modelPreference} model)`);
        } catch (openrouterError: any) {
          console.error("OpenRouter API error:", openrouterError);
          errors.push(`OpenRouter error: ${openrouterError.message || 'Unknown error'}`);
          
          // Detect insufficient credits error
          const insufficientCredits = 
            openrouterError.message.includes('Insufficient credits') || 
            openrouterError.message.includes('402');
            
          if (insufficientCredits) {
            console.log("OpenRouter has insufficient credits. Trying alternative AI providers...");
          }
          
          // Try the best available alternative based on which keys we have
          if (openaiKey) {
            console.log("Falling back to OpenAI API (recommended alternative)");
            try {
              // Use enhanced OpenAI prompts
              enhancedProducts = await enhanceProductDataWithImprovedPrompts(productsToEnhance, marketplace);
              console.log("Product enhancement completed successfully with OpenAI fallback");
            } catch (fallbackError: any) {
              errors.push(`OpenAI fallback error: ${fallbackError.message || 'Unknown error'}`);
              
              // If OpenAI fails, try any other available API
              if (anthropicKey) {
                console.log("Trying Anthropic API as second fallback");
                try {
                  enhancedProducts = await enhanceProductDataWithAnthropic(productsToEnhance, marketplace);
                  console.log("Product enhancement completed successfully with Anthropic fallback");
                } catch (secondFallbackError: any) {
                  errors.push(`Anthropic fallback error: ${secondFallbackError.message || 'Unknown error'}`);
                }
              } else if (geminiKey) {
                console.log("Trying Gemini API as second fallback");
                try {
                  enhancedProducts = await enhanceProductData(productsToEnhance, marketplace);
                  console.log("Product enhancement completed successfully with Gemini fallback");
                } catch (secondFallbackError: any) {
                  errors.push(`Gemini fallback error: ${secondFallbackError.message || 'Unknown error'}`);
                }
              }
              
              // If we still don't have enhanced products, rethrow
              if (!enhancedProducts) {
                throw new Error(`All fallback strategies failed. OpenRouter: ${openrouterError.message}, OpenAI: ${fallbackError.message}`);
              }
            }
          } else if (anthropicKey) {
            console.log("Falling back to Anthropic API");
            try {
              enhancedProducts = await enhanceProductDataWithAnthropic(productsToEnhance, marketplace);
              console.log("Product enhancement completed successfully with Anthropic fallback");
            } catch (fallbackError: any) {
              errors.push(`Anthropic fallback error: ${fallbackError.message || 'Unknown error'}`);
              
              // If Anthropic fails, try Gemini if available
              if (geminiKey) {
                console.log("Trying Gemini API as second fallback");
                try {
                  enhancedProducts = await enhanceProductData(productsToEnhance, marketplace);
                  console.log("Product enhancement completed successfully with Gemini fallback");
                } catch (secondFallbackError: any) {
                  errors.push(`Gemini fallback error: ${secondFallbackError.message || 'Unknown error'}`);
                  throw new Error(`All fallback strategies failed. OpenRouter: ${openrouterError.message}, Anthropic: ${fallbackError.message}, Gemini: ${secondFallbackError.message}`);
                }
              } else {
                throw new Error(`Both OpenRouter and Anthropic failed. OpenRouter: ${openrouterError.message}, Anthropic: ${fallbackError.message}`);
              }
            }
          } else if (geminiKey) {
            console.log("Falling back to Gemini API");
            try {
              enhancedProducts = await enhanceProductData(productsToEnhance, marketplace);
              console.log("Product enhancement completed successfully with Gemini fallback");
            } catch (fallbackError: any) {
              errors.push(`Gemini fallback error: ${fallbackError.message || 'Unknown error'}`);
              throw new Error(`Both OpenRouter and Gemini failed. OpenRouter: ${openrouterError.message}, Gemini: ${fallbackError.message}`);
            }
          } else {
            throw new Error(`OpenRouter enhancement failed and no alternative API keys are available. Please add funds to your OpenRouter account or provide another API key (OpenAI, Anthropic, or Gemini).`);
          }
        }
      } else if (aiProvider === 'anthropic' && anthropicKey) {
        try {
          console.log("Using Anthropic Claude API for product enhancement");
          enhancedProducts = await enhanceProductDataWithAnthropic(productsToEnhance, marketplace);
          console.log("Product enhancement completed successfully with Anthropic Claude");
        } catch (anthropicError: any) {
          console.error("Anthropic API error:", anthropicError);
          errors.push(`Anthropic error: ${anthropicError.message || 'Unknown error'}`);
          
          // Try OpenAI as fallback if available
          if (openaiKey) {
            console.log("Falling back to OpenAI for product enhancement");
            try {
              enhancedProducts = await enhanceProductDataWithOpenAI(productsToEnhance, marketplace);
              console.log("Product enhancement completed successfully with OpenAI fallback");
            } catch (openaiError: any) {
              errors.push(`OpenAI error: ${openaiError.message || 'Unknown error'}`);
              throw new Error(`Both Anthropic and OpenAI enhancement failed. Anthropic: ${anthropicError.message}, OpenAI: ${openaiError.message}`);
            }
          } else {
            throw new Error(`Anthropic enhancement failed and no OpenAI API key available. Error: ${anthropicError.message}`);
          }
        }
      } else if (aiProvider === 'enhanced' && openaiKey) {
        try {
          console.log("Using Enhanced OpenAI API for product enhancement");
          enhancedProducts = await enhanceProductDataWithImprovedPrompts(productsToEnhance, marketplace);
          console.log("Product enhancement completed successfully with Enhanced OpenAI");
        } catch (openaiError: any) {
          console.error("Enhanced OpenAI API error:", openaiError);
          errors.push(`Enhanced OpenAI error: ${openaiError.message || 'Unknown error'}`);
          
          // Try regular OpenAI as fallback
          console.log("Falling back to standard OpenAI");
          try {
            enhancedProducts = await enhanceProductDataWithOpenAI(productsToEnhance, marketplace);
            console.log("Product enhancement completed successfully with standard OpenAI fallback");
          } catch (fallbackError: any) {
            errors.push(`OpenAI fallback error: ${fallbackError.message || 'Unknown error'}`);
            throw new Error(`Both Enhanced and standard OpenAI enhancement failed: ${openaiError.message}, fallback: ${fallbackError.message}`);
          }
        }
      } else if (aiProvider === 'gemini' && geminiKey) {
        try {
          console.log("Using Gemini API for product enhancement");
          enhancedProducts = await enhanceProductData(productsToEnhance, marketplace);
          console.log("Product enhancement completed successfully with Gemini");
        } catch (geminiError: any) {
          console.error("Gemini API error:", geminiError);
          errors.push(`Gemini error: ${geminiError.message || 'Unknown error'}`);

          // Try OpenAI as fallback if available
          if (openaiKey) {
            console.log("Falling back to OpenAI for product enhancement");
            try {
              enhancedProducts = await enhanceProductDataWithOpenAI(productsToEnhance, marketplace);
              console.log("Product enhancement completed successfully with OpenAI fallback");
            } catch (openaiError: any) {
              errors.push(`OpenAI error: ${openaiError.message || 'Unknown error'}`);
              throw new Error(`Both Gemini and OpenAI enhancement failed. Gemini: ${geminiError.message}, OpenAI: ${openaiError.message}`);
            }
          } else {
            throw new Error(`Gemini enhancement failed and no OpenAI API key available. Error: ${geminiError.message}`);
          }
        }
      } 
      // Default to OpenAI if available
      else if (openaiKey) {
        try {
          console.log("Using OpenAI API for product enhancement");
          enhancedProducts = await enhanceProductDataWithOpenAI(productsToEnhance, marketplace);
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
        throw new Error("No API keys available for product enhancement. Please set one of the following API keys in environment variables: OPENROUTER_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY.");
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
      const { products, productIds, useIntelligentAnalysis = true } = req.body;
      let productsToAnalyze = [];
      
      console.log("Analyze endpoint called with:", {
        hasProducts: products && Array.isArray(products), 
        productsLength: products?.length || 0,
        hasProductIds: productIds && Array.isArray(productIds),
        productIdsLength: productIds?.length || 0,
        useIntelligentAnalysis
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
      
      // Choose analysis method
      let analysisResult;
      
      if (useIntelligentAnalysis) {
        // Use new intelligent analyzer
        try {
          console.log("Using intelligent CSV analyzer for deep product analysis");
          
          // First, analyze products with our intelligent analyzer
          const aiAnalysis = await analyzeProductData(productsToAnalyze);
          
          // Then detect specific product types
          const productTypeInfo = await detectProductTypes(aiAnalysis.products);
          
          // Generate a marketplace-specific enhancement prompt for this product type
          const marketplace = req.body.marketplace || 'amazon';
          const enhancementPrompt = generateEnhancementPrompt(
            productTypeInfo.productType || 'general',
            marketplace
          );
          
          // Combine everything into a comprehensive analysis
          analysisResult = {
            message: "Intelligent product analysis completed",
            productType: productTypeInfo.productType || 'general',
            confidence: productTypeInfo.confidence || 0.7,
            analysis: aiAnalysis.analysis,
            fieldMappings: aiAnalysis.fieldMappings,
            enhancementSuggestions: productTypeInfo.enhancementFocus || [],
            commonMissingFields: aiAnalysis.analysis.missingFields || [],
            marketplaceCompatibility: aiAnalysis.analysis.marketplaceCompatibility || {},
            enhancementPriorities: aiAnalysis.analysis.enhancementPriorities || [],
            enhancementPrompt: enhancementPrompt,
            productTypeInfo: productTypeInfo
          };
          
          console.log("Intelligent analysis completed successfully");
        } catch (aiError) {
          console.error("Error in intelligent analysis:", aiError);
          console.log("Falling back to standard product type analysis");
          
          // Fallback to original analyzer if intelligent analysis fails
          const fallbackAnalysis = await analyzeProductTypes(productsToAnalyze);
          analysisResult = {
            message: "Product analysis completed (fallback method)",
            intelligentAnalysisFailed: true,
            error: aiError instanceof Error ? aiError.message : "Unknown error",
            ...fallbackAnalysis
          };
        }
      } else {
        // Use original analyzer
        console.log("Using standard product type analysis");
        const standardAnalysis = await analyzeProductTypes(productsToAnalyze);
        analysisResult = {
          message: "Standard product analysis completed",
          ...standardAnalysis
        };
      }
      
      res.json(analysisResult);
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
