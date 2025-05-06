import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table (existing schema, preserved)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Product table for product data
export const products = pgTable("products", {
  product_id: text("product_id").primaryKey(),
  title: text("title"),
  description: text("description"),
  price: integer("price"),
  brand: text("brand"),
  category: text("category"),
  bullet_points: jsonb("bullet_points").$type<string[]>(),
  images: jsonb("images").$type<string[]>(),
  asin: text("asin"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const productsRelations = relations(products, ({ many }) => ({
  exportItems: many(exportHistoryItems)
}));

// Export history table
export const exportHistory = pgTable("export_history", {
  id: serial("id").primaryKey(),
  marketplace: text("marketplace").notNull(),
  format: text("format").notNull(),
  product_count: integer("product_count").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Join table for export history and products
export const exportHistoryItems = pgTable("export_history_items", {
  id: serial("id").primaryKey(),
  export_id: integer("export_id").notNull().references(() => exportHistory.id),
  product_id: text("product_id").notNull().references(() => products.product_id),
  created_at: timestamp("created_at").defaultNow().notNull()
});

export const exportHistoryItemsRelations = relations(exportHistoryItems, ({ one }) => ({
  export: one(exportHistory, {
    fields: [exportHistoryItems.export_id],
    references: [exportHistory.id]
  }),
  product: one(products, {
    fields: [exportHistoryItems.product_id],
    references: [products.product_id]
  })
}));

// Schemas for validation
export const productInsertSchema = createInsertSchema(products);
export const productUpdateSchema = createInsertSchema(products).partial();
export const exportHistoryInsertSchema = createInsertSchema(exportHistory);

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type ExportHistoryItem = typeof exportHistory.$inferSelect;
export type InsertExportHistoryItem = typeof exportHistory.$inferInsert;
