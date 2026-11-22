"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, LayoutDashboard, LogOut, ShoppingBag, Store, Mail, MapPinned } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/collections", label: "Collections", icon: Boxes },
  { href: "/admin/visitors", label: "Visitors", icon: MapPinned },
  { href: "/admin/newsletter", label: "Newsletter subscribers", icon: Mail }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const isPublicAuthPage = pathname === "/admin/login" || pathname === "/admin/setup";
  const allowedAdminPaths = ["/admin", "/admin/products", "/admin/collections", "/admin/visitors", "/admin/newsletter"];
  useEffect(() => { if (!isPublicAuthPage && !allowedAdminPaths.includes(pathname)) router.replace("/admin"); }, [pathname, router, isPublicAuthPage]);
  useEffect(() => {
    if (isPublicAuthPage) { setAuthChecked(true); return; }
    let active = true;
    fetch("/api/admin/me", { cache: "no-store" }).then(response => {
      if (!active) return;
      if (response.ok) setAuthenticated(true);
      else router.replace("/admin/login");
    }).catch(() => { if (active) router.replace("/admin/login"); }).finally(() => { if (active) setAuthChecked(true); });
    return () => { active = false; };
  }, [pathname, router, isPublicAuthPage]);
  async function signOut() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  if (isPublicAuthPage) return <>{children}</>;
  if (!authChecked || !authenticated) return <div className="flex min-h-screen items-center justify-center bg-[#f7f4f1] text-xs text-[#887a75]">Verifying secure admin session…</div>;
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-brand mb-10 block px-3 text-2xl font-extrabold tracking-[.2em]">ZORIX<span className="text-[#d69b91]">.</span><span className="mt-1 block text-[8px] font-medium tracking-[.24em] text-white/45">STORE ADMIN</span></Link>
      <p className="admin-nav-caption mb-3 px-3 text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Workspace</p>
      <nav className="grid gap-1">{nav.map(item => { const Icon = item.icon; const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} title={item.label} className={`admin-nav-link ${active ? "active" : ""}`}><Icon size={17}/><span className="admin-nav-label">{item.label}</span></Link>; })}</nav>
      <div className="mt-auto grid gap-2">
        <Link href="/" className="admin-nav-link"><Store size={17}/><span className="admin-nav-label">View storefront</span></Link>
        <button onClick={signOut} disabled={busy} className="admin-nav-link text-left"><LogOut size={17}/><span className="admin-nav-label">{busy ? "Signing out…" : "Sign out"}</span></button>
      </div>
    </aside>
    <div className="admin-main">
      <header className="flex h-[76px] items-center justify-between border-b border-[#eae2dc] bg-white px-5 sm:px-8">
        <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#a16d65]">ZORIX MANAGEMENT</p><p className="mt-1 text-sm font-semibold">Store dashboard</p></div>
        <div className="flex items-center gap-3"><span className="hidden text-[10px] text-[#887a75] sm:inline">Pakistan · PKR</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0e4df] text-xs font-bold">Z</span></div>
      </header>
      <main className="p-5 sm:p-8">{children}</main>
    </div>
  </div>;
}
