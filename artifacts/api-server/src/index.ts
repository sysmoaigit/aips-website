// artifacts/api-server/src/index.ts
// Hono + Cloudflare Workers — AIPS API

import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign, verify } from "hono/jwt";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { getDb, productsTable, categoriesTable, ordersTable, blogPostsTable, mediaFilesTable } from "./db";

type Bindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  NOTIFY_EMAIL?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  JWT_SECRET?: string;
};

type Variables = {
  jwtPayload: Record<string, unknown>;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use(cors({
  origin: (origin) => {
    const allowed = ["https://aipremiumshop.com", "https://www.aipremiumshop.com", "http://localhost:5173"];
    if (allowed.includes(origin)) return origin;
    if (/\.pages\.dev$/.test(origin)) return origin;
    return null;
  },
  credentials: true,
}));

function authMiddleware() {
  return async (c: any, next: any) => {
    const authHeader = c.req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    const token = authHeader.slice(7);
    const secret = c.env.JWT_SECRET ?? "change-this-in-production";
    try {
      const payload = await verify(token, secret, "HS256");
      c.set("jwtPayload", payload);
      await next();
    } catch {
      return c.json({ success: false, error: "Invalid or expired token" }, 401);
    }
  };
}

// ─── Health ───
app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

// ─── Admin Auth ───
app.post("/api/admin/login", async (c) => {
  const body = await c.req.json<{ username?: string; password?: string }>();
  const { username, password } = body ?? {};
  const U = c.env.ADMIN_USERNAME ?? "emon";
  const P = c.env.ADMIN_PASSWORD ?? "";
  if (!P) return c.json({ success: false, error: "ADMIN_PASSWORD not set" }, 500);
  if (username !== U || password !== P) return c.json({ success: false, error: "Invalid credentials" }, 401);
  const secret = c.env.JWT_SECRET ?? "change-this-in-production";
  const token = await sign({ username, role: "admin" }, secret, "HS256");
  return c.json({ success: true, data: { token } });
});

app.get("/api/admin/verify", authMiddleware(), (c) => {
  return c.json({ success: true, data: c.get("jwtPayload") });
});

// ─── Validation schemas ───
const insertProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  brand: z.string(),
  brandSlug: z.string(),
  provider: z.string(),
  brandColor: z.string().optional(),
  category: z.string(),
  price: z.number(),
  officialUsd: z.number().nullable().optional(),
  tier: z.string(),
  accessType: z.string(),
  badge: z.string().nullable().optional(),
  description: z.string(),
  capabilities: z.array(z.string()).optional(),
  deliverySla: z.string(),
  featured: z.boolean().optional(),
  whatsappMsg: z.string(),
  status: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

const insertBlogPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  author: z.string().optional(),
  coverImageUrl: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
});

// ─── Products ───
app.get("/api/products", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const products = await db.select().from(productsTable).where(eq(productsTable.status, "Active")).orderBy(productsTable.sortOrder);
    return c.json({ success: true, data: products });
  } catch { return c.json({ success: false, error: "Failed to fetch products" }, 500); }
});

app.get("/api/products/featured", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const products = await db.select().from(productsTable).where(and(eq(productsTable.status, "Active"), eq(productsTable.featured, true))).orderBy(productsTable.sortOrder);
    return c.json({ success: true, data: products });
  } catch { return c.json({ success: false, error: "Failed to fetch featured products" }, 500); }
});

app.get("/api/products/category/:cat", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const products = await db.select().from(productsTable).where(and(eq(productsTable.category, c.req.param("cat")), eq(productsTable.status, "Active"))).orderBy(productsTable.sortOrder);
    return c.json({ success: true, data: products });
  } catch { return c.json({ success: false, error: "Failed to fetch products" }, 500); }
});

app.get("/api/products/brand/:slug", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const products = await db.select().from(productsTable).where(and(eq(productsTable.brandSlug, c.req.param("slug")), eq(productsTable.status, "Active"))).orderBy(productsTable.sortOrder);
    return c.json({ success: true, data: products });
  } catch { return c.json({ success: false, error: "Failed to fetch products" }, 500); }
});

app.get("/api/products/categories/all", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
    return c.json({ success: true, data: cats });
  } catch { return c.json({ success: false, error: "Failed to fetch categories" }, 500); }
});

app.get("/api/products/:id", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, c.req.param("id")));
    if (!product) return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, data: product });
  } catch { return c.json({ success: false, error: "Failed to fetch product" }, 500); }
});

app.get("/api/products/admin/all", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.sortOrder);
    return c.json({ success: true, data: products });
  } catch { return c.json({ success: false, error: "Failed to fetch products" }, 500); }
});

app.post("/api/products/admin", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const body = await c.req.json();
    const parsed = insertProductSchema.safeParse(body);
    if (!parsed.success) return c.json({ success: false, error: parsed.error.issues }, 400);
    const [created] = await db.insert(productsTable).values(parsed.data as any).returning();
    return c.json({ success: true, data: created }, 201);
  } catch { return c.json({ success: false, error: "Failed to create product" }, 500); }
});

app.put("/api/products/admin/:id", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const body = await c.req.json();
    const [updated] = await db.update(productsTable).set({ ...body, updatedAt: new Date().toISOString() }).where(eq(productsTable.id, c.req.param("id"))).returning();
    if (!updated) return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, data: updated });
  } catch { return c.json({ success: false, error: "Failed to update product" }, 500); }
});

app.delete("/api/products/admin/:id", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    await db.delete(productsTable).where(eq(productsTable.id, c.req.param("id")));
    return c.json({ success: true, data: { deleted: c.req.param("id") } });
  } catch { return c.json({ success: false, error: "Failed to delete product" }, 500); }
});

// ─── Orders ───
async function sendOrderNotification(c: any, order: { id: number; productName: string; price: number; customerName: string | null; customerPhone: string | null; source: string }) {
  const RESEND_KEY = c.env.RESEND_API_KEY;
  const NOTIFY_EMAIL = c.env.NOTIFY_EMAIL ?? "sysmoai.com@gmail.com";
  const FROM = c.env.RESEND_FROM ?? "orders@aipremiumshop.com";
  if (!RESEND_KEY) return;
  const waUrl = `https://wa.me/8801865385348?text=Hi+following+up+on+order+%23${order.id}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:500px">
    <div style="background:#f4b942;padding:20px;border-radius:8px 8px 0 0"><h1 style="color:#111;margin:0;font-size:20px">New Order — AIPS</h1></div>
    <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
      <p><strong>Order #${order.id}</strong></p>
      <p>Product: ${order.productName}</p>
      <p>Price: ${order.price.toLocaleString()} BDT</p>
      <p>Customer: ${order.customerPhone ?? order.customerName ?? "Via WhatsApp"}</p>
      <p>Time: ${new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}</p>
      <a href="${waUrl}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;margin-right:8px">Open WhatsApp</a>
      <a href="https://aipremiumshop.com/admin/orders" style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">View in Admin</a>
    </div></div>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({ from: `AIPS Orders <${FROM}>`, to: [NOTIFY_EMAIL], subject: `New Order: ${order.productName} — ${order.price.toLocaleString()} BDT`, html }),
    });
  } catch { console.warn("[orders] Resend notification failed"); }
}

app.post("/api/orders", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const body = await c.req.json<{ productId?: string; customerName?: string; customerPhone?: string; customerEmail?: string; source?: string }>();
    const { productId, customerName, customerPhone, customerEmail, source } = body;
    if (!productId) return c.json({ success: false, error: "productId required" }, 400);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    if (!product) return c.json({ success: false, error: "Product not found" }, 404);
    const [order] = await db.insert(ordersTable).values({
      productId, productName: product.name, price: product.price,
      customerName: customerName ?? null, customerPhone: customerPhone ?? null,
      customerEmail: customerEmail ?? null, source: source ?? "whatsapp", status: "pending",
    }).returning();
    await sendOrderNotification(c, { id: order.id, productName: order.productName, price: order.price, customerName: order.customerName, customerPhone: order.customerPhone, source: order.source });
    return c.json({ success: true, data: { orderId: order.id } }, 201);
  } catch { return c.json({ success: false, error: "Failed to capture order" }, 500); }
});

app.get("/api/orders/admin", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    return c.json({ success: true, data: orders });
  } catch { return c.json({ success: false, error: "Failed to fetch orders" }, 500); }
});

app.get("/api/orders/admin/stats", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const all = await db.select().from(ordersTable);
    return c.json({ success: true, data: {
      total: all.length,
      pending: all.filter((o: any) => o.status === "pending").length,
      contacted: all.filter((o: any) => o.status === "contacted").length,
      delivered: all.filter((o: any) => o.status === "delivered").length,
      cancelled: all.filter((o: any) => o.status === "cancelled").length,
      totalRevenueBDT: all.filter((o: any) => o.status === "delivered").reduce((s: number, o: any) => s + o.price, 0),
    }});
  } catch { return c.json({ success: false, error: "Failed to get stats" }, 500); }
});

app.put("/api/orders/admin/:id", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const body = await c.req.json<{ status?: string; notes?: string; customerName?: string; customerPhone?: string; customerEmail?: string }>();
    const { status, notes, customerName, customerPhone, customerEmail } = body;
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (customerName !== undefined) updates.customerName = customerName;
    if (customerPhone !== undefined) updates.customerPhone = customerPhone;
    if (customerEmail !== undefined) updates.customerEmail = customerEmail;
    updates.updatedAt = new Date().toISOString();
    const [updated] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, Number(c.req.param("id")))).returning();
    if (!updated) return c.json({ success: false, error: "Order not found" }, 404);
    return c.json({ success: true, data: updated });
  } catch { return c.json({ success: false, error: "Failed to update order" }, 500); }
});

// ─── Blog ───
app.get("/api/blog", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const posts = await db.select().from(blogPostsTable).where(eq(blogPostsTable.published, true)).orderBy(desc(blogPostsTable.publishedAt));
    return c.json({ success: true, data: posts });
  } catch { return c.json({ success: false, error: "Failed to fetch posts" }, 500); }
});

app.get("/api/blog/:slug", async (c) => {
  const db = getDb(c.env.DB);
  try {
    const [post] = await db.select().from(blogPostsTable).where(and(eq(blogPostsTable.slug, c.req.param("slug")), eq(blogPostsTable.published, true)));
    if (!post) return c.json({ success: false, error: "Post not found" }, 404);
    return c.json({ success: true, data: post });
  } catch { return c.json({ success: false, error: "Failed to fetch post" }, 500); }
});

app.get("/api/blog/admin/all", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const posts = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
    return c.json({ success: true, data: posts });
  } catch { return c.json({ success: false, error: "Failed to fetch posts" }, 500); }
});

app.post("/api/blog/admin", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const body = await c.req.json();
    const parsed = insertBlogPostSchema.safeParse(body);
    if (!parsed.success) return c.json({ success: false, error: parsed.error.issues }, 400);
    const [created] = await db.insert(blogPostsTable).values({ ...parsed.data, publishedAt: parsed.data.published ? new Date().toISOString() : null } as any).returning();
    return c.json({ success: true, data: created }, 201);
  } catch { return c.json({ success: false, error: "Failed to create post" }, 500); }
});

app.put("/api/blog/admin/:id", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    const body = await c.req.json();
    const updates: any = { ...body, updatedAt: new Date().toISOString() };
    if (body.published === true) updates.publishedAt = new Date().toISOString();
    const [updated] = await db.update(blogPostsTable).set(updates).where(eq(blogPostsTable.id, Number(c.req.param("id")))).returning();
    if (!updated) return c.json({ success: false, error: "Post not found" }, 404);
    return c.json({ success: true, data: updated });
  } catch { return c.json({ success: false, error: "Failed to update post" }, 500); }
});

app.delete("/api/blog/admin/:id", authMiddleware(), async (c) => {
  const db = getDb(c.env.DB);
  try {
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, Number(c.req.param("id"))));
    return c.json({ success: true, data: { deleted: c.req.param("id") } });
  } catch { return c.json({ success: false, error: "Failed to delete post" }, 500); }
});

// ─── Media (R2 native) ───
function guessType(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp",
    svg: "image/svg+xml", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime"
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}

function sanitize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

app.get("/api/media/admin", authMiddleware(), async (c) => {
  try {
    const list = await c.env.MEDIA.list({ limit: 1000 });
    const files = (list.objects ?? []).map((o: any) => ({
      key: o.key,
      url: `https://media.aipremiumshop.com/${o.key}`,
      size: o.size,
      lastModified: o.uploaded?.toISOString?.() ?? new Date().toISOString(),
      contentType: guessType(o.key)
    }));
    return c.json({ success: true, data: files });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post("/api/media/admin/upload", authMiddleware(), async (c) => {
  try {
    const form = await c.req.parseBody({ all: true });
    const file = form.file as File;
    if (!file) return c.json({ success: false, error: "No file" }, 400);
    const folder = (form.folder as string) || "other";
    const key = `${folder}/${sanitize(file.name)}`;
    await c.env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    return c.json({ success: true, data: { key, url: `https://media.aipremiumshop.com/${key}`, size: file.size, lastModified: new Date().toISOString(), contentType: file.type } });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.delete("/api/media/admin/:key{.*}", authMiddleware(), async (c) => {
  try {
    const key = c.req.param("key");
    await c.env.MEDIA.delete(key);
    return c.json({ success: true, message: `Deleted ${key}` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ─── 404 ───
app.notFound((c) => c.json({ success: false, error: "Not found" }, 404));

// ─── Error ───
app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, error: "Internal server error" }, 500);
});

export default app;
