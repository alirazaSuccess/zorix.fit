import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/v1/*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400
  })
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "zorix-commerce-api",
    environment: c.env.ENVIRONMENT
  })
);

app.get("/v1/products", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") || 1));
  const limit = Math.min(48, Math.max(1, Number(c.req.query("limit") || 24)));
  const offset = (page - 1) * limit;
  const result = await c.env.DB.prepare(
    "SELECT id, title, slug, description, price_paisa, compare_at_price_paisa, featured FROM products WHERE status = ? ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?"
  ).bind("active", limit, offset).all();
  return c.json({
    data: result.results,
    pagination: { page, limit, hasMore: result.results.length === limit }
  });
});

app.get("/v1/collections", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, title, slug, description, image_key FROM collections WHERE is_active = 1 ORDER BY sort_order ASC, title ASC"
  ).all();
  return c.json({ data: result.results });
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((error, c) => {
  console.error("Commerce API error", error);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;