import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
  ADMIN_SETUP_TOKEN: string;
};

type AdminRow = { id: string; email: string; role: string };
const app = new Hono<{ Bindings: Bindings }>();
const encoder = new TextEncoder();
const SESSION_COOKIE = "zorix_admin_session";
const SESSION_DAYS = 7;
const PBKDF2_ITERATIONS = 310000;

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
function randomToken(size = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function sha256(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}
async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS }, key, 256);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`;
}
async function verifyPassword(password: string, stored: string) {
  const [scheme, iterationsText, saltText, expectedText] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterationsText || !saltText || !expectedText) return false;
  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: base64ToBytes(saltText), iterations }, key, 256));
  const expected = base64ToBytes(expectedText);
  if (bits.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ expected[i];
  return diff === 0;
}
function cookieValue(header: string | undefined, name: string) {
  return header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="))?.slice(name.length + 1);
}
function sessionCookie(value: string, maxAge: number) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
async function currentAdmin(c: { req: { header: (name: string) => string | undefined }; env: Bindings }): Promise<AdminRow | null> {
  const token = cookieValue(c.req.header("Cookie"), SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = bytesToBase64(await sha256(token));
  const row = await c.env.DB.prepare(
    "SELECT admins.id, admins.email, admins.role FROM admin_sessions JOIN admins ON admins.id = admin_sessions.admin_id WHERE admin_sessions.token_hash = ? AND admin_sessions.expires_at > datetime('now') AND admins.is_active = 1"
  ).bind(tokenHash).first<AdminRow>();
  return row ?? null;
}
function safeEmail(email: unknown) {
  return typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get("/health", (c) => c.json({ ok: true, service: "zorix-commerce-api", environment: c.env.ENVIRONMENT }));

app.get("/v1/admin/setup-status", async (c) => {
  const count = await c.env.DB.prepare("SELECT COUNT(*) AS total FROM admins").first<{ total: number }>();
  return c.json({ setupRequired: (count?.total ?? 0) === 0 && Boolean(c.env.ADMIN_SETUP_TOKEN) });
});

app.post("/v1/admin/setup", async (c) => {
  if (!c.env.ADMIN_SETUP_TOKEN) return c.json({ error: "Admin setup is not configured on the server." }, 503);
  const body = await c.req.json<{ setupToken?: string; email?: string; password?: string }>().catch(() => ({}));
  if (typeof body.setupToken !== "string" || body.setupToken.length < 32) return c.json({ error: "Invalid setup credentials." }, 401);
  const expected = encoder.encode(c.env.ADMIN_SETUP_TOKEN);
  const supplied = encoder.encode(body.setupToken);
  let mismatch = expected.length ^ supplied.length;
  for (let i = 0; i < Math.max(expected.length, supplied.length); i++) mismatch |= (expected[i] ?? 0) ^ (supplied[i] ?? 0);
  if (mismatch !== 0) return c.json({ error: "Invalid setup credentials." }, 401);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password;
  if (!safeEmail(email) || email !== "zorixfit@admin.com") return c.json({ error: "Use the authorised store-owner email." }, 400);
  if (typeof password !== "string" || password.length < 12 || password.length > 128) return c.json({ error: "Password must be between 12 and 128 characters." }, 400);
  const already = await c.env.DB.prepare("SELECT COUNT(*) AS total FROM admins").first<{ total: number }>();
  if ((already?.total ?? 0) > 0) return c.json({ error: "Initial setup has already been completed." }, 409);
  const adminId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const inserted = await c.env.DB.prepare(
    "INSERT INTO admins (id, email, password_hash, role, is_active) SELECT ?, ?, ?, 'owner', 1 WHERE NOT EXISTS (SELECT 1 FROM admins) AND EXISTS (SELECT 1 FROM store_setup WHERE id = 1 AND admin_created = 0)"
  ).bind(adminId, email, passwordHash).run();
  if (inserted.meta.changes !== 1) return c.json({ error: "Initial setup has already been completed." }, 409);
  await c.env.DB.prepare("UPDATE store_setup SET admin_created = 1, completed_at = CURRENT_TIMESTAMP WHERE id = 1 AND admin_created = 0").run();
  return c.json({ ok: true, message: "Owner account created. You can now sign in." }, 201);
});

app.post("/v1/admin/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password;
  if (!safeEmail(email) || typeof password !== "string" || password.length > 128) return c.json({ error: "Invalid email or password." }, 400);
  const row = await c.env.DB.prepare("SELECT id, email, role, password_hash, is_active FROM admins WHERE email = ? COLLATE NOCASE").bind(email).first<{id:string;email:string;role:string;password_hash:string;is_active:number}>();
  if (!row || row.is_active !== 1 || !(await verifyPassword(password, row.password_hash))) return c.json({ error: "Invalid email or password." }, 401);
  const sessionToken = randomToken(32);
  const tokenHash = bytesToBase64(await sha256(sessionToken));
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString().replace("T", " ").slice(0, 19);
  await c.env.DB.prepare("INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), row.id, tokenHash, expiresAt).run();
  await c.env.DB.prepare("INSERT INTO admin_audit_logs (id, admin_id, action, entity_type, entity_id) VALUES (?, ?, 'login', 'admin', ?)").bind(crypto.randomUUID(), row.id, row.id).run();
  c.header("Set-Cookie", sessionCookie(sessionToken, SESSION_DAYS * 86400));
  return c.json({ admin: { id: row.id, email: row.email, role: row.role } });
});

app.get("/v1/admin/me", async (c) => {
  const admin = await currentAdmin(c);
  if (!admin) return c.json({ error: "Unauthorised" }, 401);
  return c.json({ admin });
});

app.post("/v1/admin/logout", async (c) => {
  const token = cookieValue(c.req.header("Cookie"), SESSION_COOKIE);
  if (token) {
    const tokenHash = bytesToBase64(await sha256(token));
    await c.env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(tokenHash).run();
  }
  c.header("Set-Cookie", sessionCookie("", 0));
  return c.json({ ok: true });
});

app.get("/v1/admin/overview", async (c) => {
  const admin = await currentAdmin(c);
  if (!admin) return c.json({ error: "Unauthorised" }, 401);
  const [orders, products, customers, sales, lowStock, recent] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS total FROM orders").first<{total:number}>(),
    c.env.DB.prepare("SELECT COUNT(*) AS total FROM products WHERE status = 'active'").first<{total:number}>(),
    c.env.DB.prepare("SELECT COUNT(DISTINCT customer_phone) AS total FROM orders").first<{total:number}>(),
    c.env.DB.prepare("SELECT COALESCE(SUM(total_paisa), 0) AS total FROM orders WHERE status NOT IN ('cancelled','returned')").first<{total:number}>(),
    c.env.DB.prepare("SELECT COUNT(*) AS total FROM products WHERE status = 'active' AND track_inventory = 1 AND inventory_quantity <= 5").first<{total:number}>(),
    c.env.DB.prepare("SELECT id, order_number, customer_name, total_paisa, status, created_at FROM orders ORDER BY created_at DESC LIMIT 6").all()
  ]);
  return c.json({ stats: { orders: orders?.total ?? 0, products: products?.total ?? 0, customers: customers?.total ?? 0, revenuePaisa: sales?.total ?? 0, lowStock: lowStock?.total ?? 0 }, recentOrders: recent.results });
});

app.get("/v1/products", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") || 1));
  const limit = Math.min(48, Math.max(1, Number(c.req.query("limit") || 24)));
  const offset = (page - 1) * limit;
  const result = await c.env.DB.prepare("SELECT id, title, slug, description, price_paisa, compare_at_price_paisa, featured FROM products WHERE status = ? ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?").bind("active", limit, offset).all();
  return c.json({ data: result.results, pagination: { page, limit, hasMore: result.results.length === limit } });
});

app.get("/v1/collections", async (c) => {
  const result = await c.env.DB.prepare("SELECT id, title, slug, description, image_key FROM collections WHERE is_active = 1 ORDER BY sort_order ASC, title ASC").all();
  return c.json({ data: result.results });
});

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((error, c) => {
  console.error("Commerce API error", error);
  return c.json({ error: "Internal server error" }, 500);
});
export default app;
