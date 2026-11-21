import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/setup"]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  const api = process.env.COMMERCE_API_URL?.replace(/\/$/, "");
  const session = request.cookies.get("zorix_admin_session")?.value;
  if (!api || !session) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const response = await fetch(`${api}/v1/admin/me`, {
      headers: { cookie: `zorix_admin_session=${session}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
    if (response.ok) return NextResponse.next();
  } catch {
    // Fail closed if the auth service cannot verify the session.
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname);
  const redirect = NextResponse.redirect(login);
  redirect.cookies.delete("zorix_admin_session");
  return redirect;
}

export const config = { matcher: ["/admin/:path*"] };
