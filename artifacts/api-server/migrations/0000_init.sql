-- Migration: init
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  brand TEXT NOT NULL,
  brand_slug TEXT NOT NULL,
  provider TEXT NOT NULL,
  brand_color TEXT NOT NULL DEFAULT '#111827',
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  official_usd INTEGER,
  tier TEXT NOT NULL,
  access_type TEXT NOT NULL,
  badge TEXT,
  description TEXT NOT NULL,
  capabilities TEXT NOT NULL DEFAULT '[]',
  delivery_sla TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  whatsapp_msg TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  logo_url TEXT,
  banner_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🤖',
  hero_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'whatsapp',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'AIPS Team',
  cover_image_url TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  published INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS media_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  type TEXT NOT NULL,
  related_to TEXT,
  size_bytes INTEGER,
  created_at TEXT
);
