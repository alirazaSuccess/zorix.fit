const SESSION_COOKIE = "zorix_admin_session";
const SESSION_DAYS = 7;
const ITERATIONS = 100000;
const enc = new TextEncoder();
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const b64 = (bytes) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
};
const fromB64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const random = (n = 32) => {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return b64(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const digest = async (value) => new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)));
const hashPassword = async (password) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256));
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(bits)}`;
};
const verifyPassword = async (password, stored) => {
  const [scheme, count, salt, expected] = (stored || "").split("$");
  const iterations = Number(count);
  if (scheme !== "pbkdf2" || !salt || !expected || !Number.isInteger(iterations) || iterations < 100000 || iterations > 100000) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const actual = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: fromB64(salt), iterations }, key, 256));
  const wanted = fromB64(expected);
  if (actual.length !== wanted.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ wanted[i];
  return diff === 0;
};
const cookie = (request) => (request.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(SESSION_COOKIE + "="))?.slice(SESSION_COOKIE.length + 1);
const setCookie = (value, maxAge) => `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const validEmail = (email) => typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const body = async (request) => request.json().catch(() => ({}));
async function adminFor(request, env) {
  const token = cookie(request);
  if (!token) return null;
  const tokenHash = b64(await digest(token));
  return await env.DB.prepare("SELECT admins.id, admins.email, admins.role FROM admin_sessions JOIN admins ON admins.id = admin_sessions.admin_id WHERE admin_sessions.token_hash = ? AND admin_sessions.expires_at > datetime('now') AND admins.is_active = 1").bind(tokenHash).first();
}
async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "") || "/";
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS", "access-control-allow-headers": "Content-Type", "access-control-max-age": "86400" } });
  if (path === "/health" && request.method === "GET") return json({ ok: true, service: "zorix-commerce-api", environment: env.ENVIRONMENT || "production" });
  if (path === "/v1/admin/setup-status" && request.method === "GET") {
    const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM admins").first();
    return json({ setupRequired: (count?.total || 0) === 0 && Boolean(env.ADMIN_SETUP_TOKEN) });
  }
  if (path === "/v1/admin/setup" && request.method === "POST") {
    try {
    if (!env.ADMIN_SETUP_TOKEN) return json({ error: "Admin setup is not configured on the server." }, 503);
    const data = await body(request);
    if (typeof data.setupToken !== "string" || data.setupToken.length < 32) return json({ error: "Invalid setup credentials." }, 401);
    const expected = enc.encode(env.ADMIN_SETUP_TOKEN), supplied = enc.encode(data.setupToken);
    let mismatch = expected.length ^ supplied.length;
    for (let i = 0; i < Math.max(expected.length, supplied.length); i++) mismatch |= (expected[i] || 0) ^ (supplied[i] || 0);
    if (mismatch !== 0) return json({ error: "Invalid setup credentials." }, 401);
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    if (!validEmail(email) || email !== "zorixfit@admin.com") return json({ error: "Use the authorised store-owner email." }, 400);
    if (typeof data.password !== "string" || data.password.length < 12 || data.password.length > 128) return json({ error: "Password must be between 12 and 128 characters." }, 400);
    const adminId = crypto.randomUUID();
    const passwordHash = await hashPassword(data.password);
    const inserted = await env.DB.prepare("INSERT INTO admins (id,email,password_hash,role,is_active) SELECT ?, ?, ?, 'owner', 1 WHERE NOT EXISTS (SELECT 1 FROM admins) AND EXISTS (SELECT 1 FROM store_setup WHERE id=1 AND admin_created=0)").bind(adminId,email,passwordHash).run();
    if (inserted.meta.changes !== 1) return json({ error: "Initial setup has already been completed." }, 409);
    await env.DB.prepare("UPDATE store_setup SET admin_created=1, completed_at=CURRENT_TIMESTAMP WHERE id=1 AND admin_created=0").run();
    return json({ ok: true, message: "Owner account created. You can now sign in." }, 201);
    } catch (error) {
      console.error("ZORIX owner setup failed:", error);
      return json({ error: "Owner setup failed.", diagnostic: String(error?.message || error).slice(0, 240) }, 500);
    }
  }
  if (path === "/v1/admin/login" && request.method === "POST") {
    const data = await body(request);
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    if (!validEmail(email) || typeof data.password !== "string" || data.password.length > 128) return json({ error: "Invalid email or password." }, 400);
    const row = await env.DB.prepare("SELECT id,email,role,password_hash,is_active FROM admins WHERE email=? COLLATE NOCASE").bind(email).first();
    if (!row || row.is_active !== 1 || !(await verifyPassword(data.password,row.password_hash))) return json({ error: "Invalid email or password." }, 401);
    const token = random(32), tokenHash = b64(await digest(token));
    const expires = new Date(Date.now()+SESSION_DAYS*86400000).toISOString().replace("T"," ").slice(0,19);
    await env.DB.prepare("INSERT INTO admin_sessions (id,admin_id,token_hash,expires_at) VALUES (?,?,?,?)").bind(crypto.randomUUID(),row.id,tokenHash,expires).run();
    await env.DB.prepare("INSERT INTO admin_audit_logs (id,admin_id,action,entity_type,entity_id) VALUES (?,?,'login','admin',?)").bind(crypto.randomUUID(),row.id,row.id).run();
    return json({ admin:{id:row.id,email:row.email,role:row.role} },200,{ "set-cookie":setCookie(token,SESSION_DAYS*86400) });
  }
  if (path === "/v1/admin/logout" && request.method === "POST") {
    const token = cookie(request);
    if (token) await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(b64(await digest(token))).run();
    return json({ok:true},200,{"set-cookie":setCookie("",0)});
  }
  if (path === "/v1/admin/me" && request.method === "GET") {
    const admin = await adminFor(request,env);
    return admin ? json({admin}) : json({error:"Unauthorised"},401);
  }
  if (path === "/v1/admin/overview" && request.method === "GET") {
    const admin = await adminFor(request,env);
    if (!admin) return json({error:"Unauthorised"},401);
    const [orders,products,customers,sales,lowStock,recent] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) AS total FROM orders").first(),
      env.DB.prepare("SELECT COUNT(*) AS total FROM products WHERE status='active'").first(),
      env.DB.prepare("SELECT COUNT(DISTINCT customer_phone) AS total FROM orders").first(),
      env.DB.prepare("SELECT COALESCE(SUM(total_paisa),0) AS total FROM orders WHERE status NOT IN ('cancelled','returned')").first(),
      env.DB.prepare("SELECT COUNT(*) AS total FROM products WHERE status='active' AND track_inventory=1 AND inventory_quantity<=5").first(),
      env.DB.prepare("SELECT id,order_number,customer_name,total_paisa,status,created_at FROM orders ORDER BY created_at DESC LIMIT 6").all()
    ]);
    return json({stats:{orders:orders?.total||0,products:products?.total||0,customers:customers?.total||0,revenuePaisa:sales?.total||0,lowStock:lowStock?.total||0},recentOrders:recent.results});
  }
  if (path === "/v1/products" && request.method === "GET") {
    const page = Math.max(1,Number(url.searchParams.get("page")||1));
    const limit = Math.min(48,Math.max(1,Number(url.searchParams.get("limit")||24)));
    const result = await env.DB.prepare("SELECT id,title,slug,description,price_paisa,compare_at_price_paisa,featured FROM products WHERE status='active' ORDER BY featured DESC,created_at DESC LIMIT ? OFFSET ?").bind(limit,(page-1)*limit).all();
    return json({data:result.results,pagination:{page,limit,hasMore:result.results.length===limit}});
  }
  if (path === "/v1/collections" && request.method === "GET") {
    const result = await env.DB.prepare("SELECT id,title,slug,description,image_key FROM collections WHERE is_active=1 ORDER BY sort_order ASC,title ASC").all();
    return json({data:result.results});
  }
  return json({error:"Not found"},404);
}
export default {
  async fetch(request, env) {
    try { return await route(request,env); }
    catch (error) { console.error("Commerce API error",error); return json({error:"Internal server error"},500); }
  }
};
