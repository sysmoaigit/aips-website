// artifacts/api-server/src/db/schema.ts
// D1 SQLite schema for AIPS API

import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────
export const productsTable = sqliteTable("products", {
  id:           text("id").primaryKey(),
  name:         text("name").notNull(),
  slug:         text("slug").notNull(),
  brand:        text("brand").notNull(),
  brandSlug:    text("brand_slug").notNull(),
  provider:     text("provider").notNull(),
  brandColor:   text("brand_color").notNull().default("#111827"),
  category:     text("category").notNull(),
  price:        integer("price").notNull(),
  officialUsd:  integer("official_usd"),
  tier:         text("tier").notNull(),
  accessType:   text("access_type").notNull(),
  badge:        text("badge"),
  description:  text("description").notNull(),
  capabilities: text("capabilities", { mode: "json" }).$type<string[]>().notNull().$defaultFn(() => []),
  deliverySla:  text("delivery_sla").notNull(),
  featured:     integer("featured", { mode: "boolean" }).notNull().default(false),
  whatsappMsg:  text("whatsapp_msg").notNull(),
  status:       text("status").notNull().default("Active"),
  logoUrl:      text("logo_url"),
  bannerUrl:    text("banner_url"),
  sortOrder:    integer("sort_order").notNull().default(0),
  createdAt:    text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt:    text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export type InsertProduct = typeof productsTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────
export const categoriesTable = sqliteTable("categories", {
  id:           text("id").primaryKey(),
  name:         text("name").notNull(),
  description:  text("description").notNull().default(""),
  icon:         text("icon").notNull().default("🤖"),
  heroImageUrl: text("hero_image_url"),
  sortOrder:    integer("sort_order").notNull().default(0),
});

export type InsertCategory = typeof categoriesTable.$inferInsert;
export type Category = typeof categoriesTable.$inferSelect;

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────
export const ordersTable = sqliteTable("orders", {
  id:              integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  productId:       text("product_id").notNull(),
  productName:     text("product_name").notNull(),
  price:           integer("price").notNull(),
  customerName:    text("customer_name"),
  customerPhone:   text("customer_phone"),
  customerEmail:   text("customer_email"),
  status:          text("status").notNull().default("pending"),
  notes:           text("notes"),
  source:          text("source").notNull().default("whatsapp"),
  createdAt:       text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt:       text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export type InsertOrder = typeof ordersTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;

// ─────────────────────────────────────────────
// BLOG POSTS
// ─────────────────────────────────────────────
export const blogPostsTable = sqliteTable("blog_posts", {
  id:             integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  slug:           text("slug").notNull().unique(),
  title:          text("title").notNull(),
  excerpt:        text("excerpt").notNull().default(""),
  content:        text("content").notNull().default(""),
  author:         text("author").notNull().default("AIPS Team"),
  coverImageUrl:  text("cover_image_url"),
  tags:           text("tags", { mode: "json" }).$type<string[]>().notNull().$defaultFn(() => []),
  published:      integer("published", { mode: "boolean" }).notNull().default(false),
  publishedAt:    text("published_at"),
  createdAt:      text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt:      text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export type InsertBlogPost = typeof blogPostsTable.$inferInsert;
export type BlogPost = typeof blogPostsTable.$inferSelect;

// ─────────────────────────────────────────────
// MEDIA FILES
// ─────────────────────────────────────────────
export const mediaFilesTable = sqliteTable("media_files", {
  id:          integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  filename:    text("filename").notNull(),
  r2Key:       text("r2_key").notNull().unique(),
  publicUrl:   text("public_url").notNull(),
  type:        text("type").notNull(),
  relatedTo:   text("related_to"),
  sizeBytes:   integer("size_bytes"),
  createdAt:   text("created_at").$defaultFn(() => new Date().toISOString()),
});

export type InsertMediaFile = typeof mediaFilesTable.$inferInsert;
export type MediaFile = typeof mediaFilesTable.$inferSelect;
