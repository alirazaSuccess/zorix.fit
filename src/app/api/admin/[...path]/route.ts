import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const base = process.env.COMMERCE_API_URL?.replace(/\/$/, "");
  if (!base) return NextResponse.json({ error: "Admin API is not configured. Add COMMERCE_API_URL to the Vercel project environment variables." }, { status: 503 });
  const { path } = await context.params;
  const upstreamUrl = new URL(`/v1/${path.map(encodeURIComponent).join("/")}`, base);
  request.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.append(key, value));
  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  const contentType = request.headers.get("content-type");
  if (cookie) headers.set("cookie", cookie);
  if (contentType) headers.set("content-type", contentType);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  try {
    const upstream = await fetch(upstreamUrl, { method: request.method, headers, body, cache: "no-store", redirect: "manual" });
    const responseHeaders = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    const setCookie = upstream.headers.get("set-cookie");
    if (upstreamType) responseHeaders.set("content-type", upstreamType);
    if (setCookie) responseHeaders.set("set-cookie", setCookie);
    responseHeaders.set("cache-control", "no-store");
    return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: "Could not reach the commerce API." }, { status: 502 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
