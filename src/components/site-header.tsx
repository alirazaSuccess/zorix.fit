"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";

const links = [
  { href: "/shop", label: "Shop all" },
  { href: "/collections/night-suits", label: "Night suits" },
  { href: "/collections/bras", label: "Bras" },
  { href: "/collections/underwear", label: "Underwear" },
  { href: "/collections/sport", label: "Sport" }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return <>
    <div className="bg-[#302625] px-4 py-2.5 text-center text-[9px] font-medium uppercase tracking-[.22em] text-[#f8eee9] sm:text-[10px]">
      A little luxury in your everyday · Discover the ZORIX edit
    </div>
    <header className="sticky top-0 z-40 border-b border-[#e9dfd9] bg-[#fbf8f5]/95 backdrop-blur-xl">
      <div className="container-shell relative flex h-[76px] items-center justify-between">
        <button className="md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21}/> : <Menu size={21}/>}
        </button>
        <nav className="hidden items-center gap-7 text-[10px] font-semibold uppercase tracking-[.16em] md:flex" aria-label="Main navigation">
          {links.map(link => <Link key={link.href} href={link.href} className="transition hover:text-[#a65b55]">{link.label}</Link>)}
        </nav>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[27px] font-extrabold tracking-[.22em]" aria-label="ZORIX home">
          ZORIX<span className="text-[#b56d66]">.</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-5">
          <Link href="/shop" aria-label="Search products"><Search size={19} strokeWidth={1.5}/></Link>
          <Link href="/account" aria-label="Account" className="hidden sm:block"><Heart size={19} strokeWidth={1.5}/></Link>
          <Link href="/cart" aria-label="Shopping bag" className="relative"><ShoppingBag size={19} strokeWidth={1.5}/><span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#b56d66] text-[9px] text-white">0</span></Link>
        </div>
      </div>
      {menuOpen && <nav className="border-t border-[#e9dfd9] bg-[#fbf8f5] px-6 py-5 md:hidden" aria-label="Mobile navigation">
        <div className="container-shell grid gap-5 text-[10px] font-semibold uppercase tracking-[.16em]">
          {links.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
        </div>
      </nav>}
    </header>
  </>;
}
