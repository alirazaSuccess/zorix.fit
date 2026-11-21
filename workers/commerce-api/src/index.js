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
  const publicAdminPaths = new Set(["/v1/admin/setup-status", "/v1/admin/setup", "/v1/admin/login", "/v1/admin/logout"]);
  const admin = path.startsWith("/v1/admin/") && !publicAdminPaths.has(path) ? await adminFor(request, env) : null;
  if (path.startsWith("/v1/admin/") && !publicAdminPaths.has(path) && !admin) return json({ error: "Unauthorised" }, 401);
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
  if (path === "/v1/admin/products" && request.method === "GET") {
    const result = await env.DB.prepare("SELECT id,title,slug,description,status,product_type,price_paisa,compare_at_price_paisa,sku,track_inventory,inventory_quantity,featured,created_at FROM products ORDER BY created_at DESC LIMIT 200").all();
    return json({ data: result.results });
  }
  if (path === "/v1/admin/products" && request.method === "POST") {
    const data = await body(request);
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const price = Number(data.pricePaisa);
    if (!title || title.length > 180 || !Number.isSafeInteger(price) || price < 0) return json({ error: "Enter a product title and valid price in paisa." }, 400);
    const slug = (typeof data.slug === "string" && data.slug.trim() ? data.slug : title).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,180);
    const id = crypto.randomUUID();
    try {
      await env.DB.prepare("INSERT INTO products (id,title,slug,description,status,product_type,price_paisa,compare_at_price_paisa,sku,track_inventory,inventory_quantity,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
        .bind(id,title,slug,typeof data.description === "string" ? data.description : "",data.status === "active" ? "active" : "draft",typeof data.productType === "string" ? data.productType : "standard",price,Number.isSafeInteger(Number(data.compareAtPricePaisa)) && Number(data.compareAtPricePaisa) > 0 ? Number(data.compareAtPricePaisa) : null,typeof data.sku === "string" && data.sku ? data.sku : null,data.trackInventory === false ? 0 : 1,Math.max(0,Math.floor(Number(data.inventoryQuantity)||0)),data.featured ? 1 : 0).run();
      await env.DB.prepare("INSERT INTO admin_audit_logs (id,admin_id,action,entity_type,entity_id,details_json) VALUES (?,?,'create','product',?,?)").bind(crypto.randomUUID(),admin.id,id,JSON.stringify({title})).run();
      return json({ ok:true,id },201);
    } catch (error) { return json({ error: String(error?.message || "Could not create product").includes("UNIQUE") ? "Product slug or SKU already exists." : "Could not create product." },400); }
  }
  const productMatch = path.match(/^\/v1\/admin\/products\/([^/]+)$/);
  if (productMatch && request.method === "PATCH") {
    const data = await body(request);
    const id = productMatch[1];
    const allowed = ["title","slug","description","status","product_type","price_paisa","compare_at_price_paisa","sku","track_inventory","inventory_quantity","featured"];
    const columns = { title:"title",slug:"slug",description:"description",status:"status",productType:"product_type",pricePaisa:"price_paisa",compareAtPricePaisa:"compare_at_price_paisa",sku:"sku",trackInventory:"track_inventory",inventoryQuantity:"inventory_quantity",featured:"featured" };
    const sets = [], values = [];
    for (const [key,column] of Object.entries(columns)) if (Object.prototype.hasOwnProperty.call(data,key)) { sets.push(column+"=?"); let value=data[key]; if (["trackInventory","featured"].includes(key)) value=value?1:0; if (["pricePaisa","compareAtPricePaisa","inventoryQuantity"].includes(key)) value=Number(value); values.push(value); }
    if (!sets.length) return json({error:"No editable fields supplied."},400);
    sets.push("updated_at=CURRENT_TIMESTAMP");
    try {
      const result=await env.DB.prepare("UPDATE products SET "+sets.join(",")+" WHERE id=?").bind(...values,id).run();
      if (!result.meta.changes) return json({error:"Product not found."},404);
      await env.DB.prepare("INSERT INTO admin_audit_logs (id,admin_id,action,entity_type,entity_id) VALUES (?,?,'update','product',?)").bind(crypto.randomUUID(),admin.id,id).run();
      return json({ok:true});
    } catch { return json({error:"Could not update product. Check unique slug and SKU."},400); }
  }
  if (productMatch && request.method === "DELETE") {
    const result=await env.DB.prepare("UPDATE products SET status='archived',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(productMatch[1]).run();
    if (!result.meta.changes) return json({error:"Product not found."},404);
    await env.DB.prepare("INSERT INTO admin_audit_logs (id,admin_id,action,entity_type,entity_id) VALUES (?,?,'archive','product',?)").bind(crypto.randomUUID(),admin.id,productMatch[1]).run();
    return json({ok:true});
  }
  if (path === "/v1/admin/collections" && request.method === "GET") {
    const result=await env.DB.prepare("SELECT c.id,c.title,c.slug,c.description,c.image_key,c.sort_order,c.is_active,COUNT(cp.product_id) AS product_count FROM collections c LEFT JOIN collection_products cp ON cp.collection_id=c.id GROUP BY c.id ORDER BY c.sort_order,c.title").all();
    return json({data:result.results});
  }
  if (path === "/v1/admin/collections" && request.method === "POST") {
    const data=await body(request), title=typeof data.title==="string"?data.title.trim():"";
    const slug=(typeof data.slug==="string"&&data.slug.trim()?data.slug:title).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,180);
    if(!title||!slug)return json({error:"Collection title is required."},400);
    const id=crypto.randomUUID();
    try {
      await env.DB.prepare("INSERT INTO collections (id,title,slug,description,sort_order,is_active) VALUES (?,?,?,?,?,1)").bind(id,title,slug,typeof data.description==="string"?data.description:"",Math.max(0,Math.floor(Number(data.sortOrder)||0))).run();
      await env.DB.prepare("INSERT INTO admin_audit_logs (id,admin_id,action,entity_type,entity_id) VALUES (?,?,'create','collection',?)").bind(crypto.randomUUID(),admin.id,id).run();
      return json({ok:true,id},201);
    } catch { return json({error:"Collection slug already exists."},400); }
  }
  const collectionMatch=path.match(/^\/v1\/admin\/collections\/([^/]+)$/);
  if(collectionMatch&&request.method==="PATCH"){
    const data=await body(request), id=collectionMatch[1];
    const allowed={title:"title",slug:"slug",description:"description",isActive:"is_active",sortOrder:"sort_order"};
    const sets=[],values=[];
    for(const [key,col] of Object.entries(allowed))if(Object.prototype.hasOwnProperty.call(data,key)){sets.push(col+"=?");values.push(key==="isActive"?(data[key]?1:0):data[key]);}
    if(!sets.length)return json({error:"No fields supplied."},400);
    sets.push("updated_at=CURRENT_TIMESTAMP");
    try{const r=await env.DB.prepare("UPDATE collections SET "+sets.join(",")+" WHERE id=?").bind(...values,id).run();if(!r.meta.changes)return json({error:"Collection not found."},404);return json({ok:true});}catch{return json({error:"Could not update collection."},400);}
  }
  if(collectionMatch&&request.method==="DELETE"){const r=await env.DB.prepare("UPDATE collections SET is_active=0,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(collectionMatch[1]).run();return r.meta.changes?json({ok:true}):json({error:"Collection not found."},404);}
  if(path==="/v1/admin/orders"&&request.method==="GET"){
    const status=url.searchParams.get("status"), q=url.searchParams.get("q");
    let sql="SELECT id,order_number,customer_name,customer_phone,status,payment_status,total_paisa,created_at FROM orders",where=[],values=[];
    if(status){where.push("status=?");values.push(status);}
    if(q){where.push("(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)");values.push("%"+q+"%","%"+q+"%","%"+q+"%");}
    if(where.length)sql+=" WHERE "+where.join(" AND ");
    const result=await env.DB.prepare(sql+" ORDER BY created_at DESC LIMIT 200").bind(...values).all();
    return json({data:result.results});
  }
  if(path==="/v1/admin/orders"&&request.method==="PATCH"){
    const data=await body(request), id=typeof data.id==="string"?data.id:"", status=typeof data.status==="string"?data.status:"";
    const allowed=["pending","confirmed","processing","shipped","delivered","cancelled","returned"];
    if(!id||!allowed.includes(status))return json({error:"Choose a valid order status."},400);
    const old=await env.DB.prepare("SELECT status FROM orders WHERE id=?").bind(id).first();
    if(!old)return json({error:"Order not found."},404);
    await env.DB.prepare("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,id).run();
    await env.DB.prepare("INSERT INTO order_status_events (id,order_id,from_status,to_status,note,created_by_admin_id) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(),id,old.status,status,typeof data.note==="string"?data.note:"",admin.id).run();
    await env.DB.prepare("INSERT INTO admin_audit_logs (id,admin_id,action,entity_type,entity_id) VALUES (?,?,'status_change','order',?)").bind(crypto.randomUUID(),admin.id,id).run();
    return json({ok:true});
  }
  if(path==="/v1/admin/analytics"&&request.method==="GET"){
    const days=Math.min(365,Math.max(1,Number(url.searchParams.get("days")||30)));
    const events=await env.DB.prepare("SELECT event_name,COUNT(*) AS total FROM analytics_events WHERE created_at>=datetime('now',?) GROUP BY event_name ORDER BY event_name").bind("-"+days+" days").all();
    const orders=await env.DB.prepare("SELECT COUNT(*) AS total,COALESCE(SUM(total_paisa),0) AS revenue FROM orders WHERE created_at>=datetime('now',?) AND status NOT IN ('cancelled','returned')").bind("-"+days+" days").first();
    return json({days,events:events.results,orders:orders?.total||0,revenuePaisa:orders?.revenue||0});
  }
  if(path==="/v1/admin/content"&&request.method==="GET"){
    const [sections,pages]=await Promise.all([env.DB.prepare("SELECT * FROM homepage_sections ORDER BY sort_order").all(),env.DB.prepare("SELECT * FROM content_pages ORDER BY title").all()]);
    return json({sections:sections.results,pages:pages.results});
  }
  if(path==="/v1/admin/content/sections"&&request.method==="PATCH"){
    const data=await body(request);
    if(typeof data.id!=="string")return json({error:"Section id required."},400);
    const sets=[],values=[];
    for(const key of ["title","subtitle","body","settingsJson","isVisible","sortOrder"]){if(Object.prototype.hasOwnProperty.call(data,key)){sets.push((({settingsJson:"settings_json",isVisible:"is_visible",sortOrder:"sort_order"})[key]||key)+"=?");values.push(key==="isVisible"?(data[key]?1:0):key==="settingsJson"?JSON.stringify(data[key]):data[key]);}}
    if(!sets.length)return json({error:"No section fields supplied."},400);
    sets.push("updated_at=CURRENT_TIMESTAMP");
    await env.DB.prepare("UPDATE homepage_sections SET "+sets.join(",")+" WHERE id=?").bind(...values,data.id).run();
    return json({ok:true});
  }
  if(path==="/v1/admin/media"&&request.method==="GET"){
    const result=await env.DB.prepare("SELECT id,storage_key,file_name,content_type,size_bytes,alt_text,created_at FROM media_assets ORDER BY created_at DESC LIMIT 200").all();
    return json({data:result.results,cloudinaryConfigured:Boolean(env.CLOUDINARY_CLOUD_NAME&&env.CLOUDINARY_API_KEY&&env.CLOUDINARY_API_SECRET)});
  }
  if(path==="/v1/admin/settings"&&request.method==="GET"){
    const result=await env.DB.prepare("SELECT key,value FROM store_settings ORDER BY key").all().catch(()=>({results:[]}));
    return json({data:Object.fromEntries(result.results.map(row=>[row.key,row.value]))});
  }
  if(path==="/v1/admin/settings"&&request.method==="PATCH"){
    const data=await body(request);
    for(const [key,value] of Object.entries(data)){if(!/^[a-z][a-z0-9_]{1,60}$/.test(key)||typeof value!=="string")continue;await env.DB.prepare("INSERT INTO store_settings (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(key,value).run();}
    return json({ok:true});
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
