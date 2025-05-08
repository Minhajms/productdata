import { db } from "@db";
import { products, exportHistory, Product as DbProduct, ExportHistoryItem } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

class Storage {
  async saveProducts(productList: any[]): Promise<DbProduct[]> {
    if (productList.length === 0) return [];
    
    try {
      // Prepare products for insertion
      const productsToInsert = productList.map(product => ({
        product_id: product.product_id,
        title: product.title || null,
        description: product.description || null,
        price: typeof product.price === 'number' ? product.price : null,
        brand: product.brand || null,
        category: product.category || null,
        bullet_points: product.bullet_points || null,
        images: product.images || null,
        asin: product.asin || null,
        status: "pending"
      }));
      
      // Insert products
      await db.insert(products).values(productsToInsert)
        .onConflictDoUpdate({
          target: products.product_id,
          set: {
            title: sql`EXCLUDED.title`,
            description: sql`EXCLUDED.description`,
            price: sql`EXCLUDED.price`,
            brand: sql`EXCLUDED.brand`,
            category: sql`EXCLUDED.category`,
            bullet_points: sql`EXCLUDED.bullet_points`,
            images: sql`EXCLUDED.images`,
            asin: sql`EXCLUDED.asin`,
            status: sql`EXCLUDED.status`,
            updated_at: sql`now()`
          }
        });
      
      // Get inserted products
      return this.getProducts();
    } catch (error) {
      console.error("Error saving products:", error);
      throw error;
    }
  }
  
  async updateProducts(productList: any[]): Promise<DbProduct[]> {
    if (productList.length === 0) return [];
    
    try {
      // Update products one by one
      for (const product of productList) {
        await db.update(products)
          .set({
            title: product.title || null,
            description: product.description || null,
            price: typeof product.price === 'number' ? product.price : null,
            brand: product.brand || null,
            category: product.category || null,
            bullet_points: product.bullet_points || null,
            images: product.images || null,
            asin: product.asin || null,
            status: "enhanced",
            updated_at: new Date()
          })
          .where(eq(products.product_id, product.product_id));
      }
      
      // Get updated products
      return this.getProducts();
    } catch (error) {
      console.error("Error updating products:", error);
      throw error;
    }
  }
  
  async getProducts(): Promise<DbProduct[]> {
    try {
      return await db.select().from(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }
  
  async getProductById(productId: string): Promise<DbProduct | null> {
    try {
      const result = await db.select().from(products).where(eq(products.product_id, productId));
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  }
  
  async getProductsByIds(productIds: string[]): Promise<DbProduct[]> {
    try {
      if (!productIds || productIds.length === 0) return [];
      
      // Use a simpler approach with multiple OR conditions
      const result = await db.select().from(products);
      return result.filter(product => productIds.includes(product.product_id));
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      throw error;
    }
  }
  
  async saveExportHistory(historyItem: Omit<ExportHistoryItem, "id">): Promise<ExportHistoryItem> {
    try {
      const [savedItem] = await db.insert(exportHistory).values({
        marketplace: historyItem.marketplace,
        format: historyItem.format,
        product_count: historyItem.product_count,
        timestamp: historyItem.timestamp
      }).returning();
      
      return savedItem;
    } catch (error) {
      console.error("Error saving export history:", error);
      throw error;
    }
  }
  
  async getExportHistory(): Promise<ExportHistoryItem[]> {
    try {
      return await db.select().from(exportHistory).orderBy(desc(exportHistory.timestamp));
    } catch (error) {
      console.error("Error fetching export history:", error);
      throw error;
    }
  }
}

// Import the SQL functions for onConflictDoUpdate
import { sql, desc } from "drizzle-orm";

export const storage = new Storage();
