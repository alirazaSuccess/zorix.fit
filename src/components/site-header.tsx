"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Heart,Menu,Search,ShoppingBag,X,ChevronDown} from "lucide-react";
type NavData={settings?:Record<string,string>;collections?:{title:string;slug:string;description?:string}[];pages?:{title:string;slug:string}[]};
export function SiteHeader(){
 const [menuOpen,setMenuOpen]=useState(false),[shopOpen,setShopOpen]=useState(false),[pagesOpen,setPagesOpen]=useState(false),[nav,setNav]=useState<NavData>({});
 useEffect(()=>{fetch("/api/storefront/navigation",{cache:"no-store"}).then(r=>r.json()).then(setNav).catch(()=>{});},[]);
 const cfg=nav.settings||{};
 let customLinks:{label:string;url:string}[]=[];try{const raw=JSON.parse(cfg.header_links_json||"[]");if(Array.isArray(raw))customLinks=raw.filter((x:any)=>x&&typeof x.label==="string"&&typeof x.url==="string").slice(0,6);}catch{}
 const collections=nav.collections||[],pages=nav.pages||[];
 const logo=cfg.header_logo||"ZORIX",announcement=cfg.header_announcement||"A little luxury in your everyday · Discover the ZORIX edit";
 const shopLabel=cfg.header_shop_label||"Shop",pagesLabel=cfg.header_pages_label||"Pages",collectionsLabel=cfg.header_collections_label||"Collections";
 const showSearch=cfg.header_show_search!=="false",showAccount=cfg.header_show_account!=="false",showCart=cfg.header_show_cart!=="false";
 const homeLink=cfg.header_home_link||"/",homeLabel=cfg.header_home_label||"Home",logoUrl=cfg.header_logo_url||"";
 const shopMenu=<div className="absolute left-0 top-full z-50 hidden min-w-64 border border-[#e9dfd9] bg-[#fbf8f5] p-5 shadow-xl group-hover:block group-focus-within:block"><Link href="/shop" className="mb-3 block border-b border-[#e9dfd9] pb-3 text-[10px] font-bold uppercase tracking-[.16em] hover:text-[#a65b55]">Shop all</Link><p className="mb-2 text-[9px] uppercase tracking-widest text-[#ad6963]">{collectionsLabel}</p>{collections.map(c=><Link key={c.slug} href={"/collections/"+c.slug} className="block py-2 text-xs hover:text-[#a65b55]">{c.title}</Link>){!collections.length&&<Link href="/shop" className="block py-2 text-xs">Browse collections</Link>}</div>;
 const pageMenu=<div className="absolute left-0 top-full z-50 hidden min-w-56 border border-[#e9dfd9] bg-[#fbf8f5] p-5 shadow-xl group-hover:block group-focus-within:block"><p className="mb-2 text-[9px] uppercase tracking-widest text-[#ad6963]">Store pages</p>{pages.map(p=><Link key={p.slug} href={"/pages/"+p.slug} className="block py-2 text-xs hover:text-[#a65b55]">{p.title}</Link>)}{!pages.length&&<Link href="/about" className="block py-2 text-xs">Our story</Link>}</div>;
 return <>
 {announcement.trim()&&<div className="bg-[#302625] px-4 py-2.5 text-center text-[9px] font-medium uppercase tracking-[.22em] text-[#f8eee9] sm:text-[10px]">{announcement}</div>}
 <header className="sticky top-0 z-40 border-b border-[#e9dfd9] bg-[#fbf8f5]/95 backdrop-blur-xl">
  <div className="container-shell relative flex h-[76px] items-center justify-between">
   <button className="md:hidden" aria-label={menuOpen?"Close navigation":"Open navigation"} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>
   <nav className="hidden items-center gap-6 text-[10px] font-semibold uppercase tracking-[.16em] md:flex" aria-label="Main navigation">
    <Link href={homeLink} className="transition hover:text-[#a65b55]">{homeLabel}</Link>
    <div className="group relative"><Link href="/shop" className="flex items-center gap-1 py-6 transition hover:text-[#a65b55]">{shopLabel}<ChevronDown size={12}/></Link>{shopMenu}</div>
    <div className="group relative"><span tabIndex={0} className="flex cursor-pointer items-center gap-1 py-6 transition hover:text-[#a65b55]">{pagesLabel}<ChevronDown size={12}/></span>{pageMenu}</div>
    {customLinks.map((l,i)=><Link key={i} href={l.url} className="transition hover:text-[#a65b55]">{l.label}</Link>)}
   </nav>
   <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[27px] font-extrabold tracking-[.22em]" aria-label="ZORIX home">{logo}<span className="text-[#b56d66]">.</span></Link>
   <div className="flex items-center gap-4 sm:gap-5">{showSearch&&<Link href="/shop" aria-label="Search products"><Search size={19} strokeWidth={1.5}/></Link>}{showAccount&&<Link href="/account" aria-label="Account" className="hidden sm:block"><Heart size={19} strokeWidth={1.5}/></Link>}{showCart&&<Link href="/cart" aria-label="Shopping bag" className="relative"><ShoppingBag size={19} strokeWidth={1.5}/><span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#b56d66] text-[9px] text-white">0</span></Link>}</div>
  </div>
  {menuOpen&&<nav className="border-t border-[#e9dfd9] bg-[#fbf8f5] px-6 py-5 md:hidden" aria-label="Mobile navigation"><div className="container-shell grid gap-4 text-[10px] font-semibold uppercase tracking-[.16em]"><Link href={homeLink} onClick={()=>setMenuOpen(false)}>{homeLabel}</Link><button className="flex items-center justify-between text-left" onClick={()=>setShopOpen(!shopOpen)}>{shopLabel}<ChevronDown size={14}/></button>{shopOpen&&<div className="grid gap-3 border-l border-[#e9dfd9] pl-4"><Link href="/shop" onClick={()=>setMenuOpen(false)}>Shop all</Link><p className="text-[#ad6963]">{collectionsLabel}</p>{collections.map(c=><Link key={c.slug} href={"/collections/"+c.slug} onClick={()=>setMenuOpen(false)}>{c.title}</Link>)}</div>}<button className="flex items-center justify-between text-left" onClick={()=>setPagesOpen(!pagesOpen)}>{pagesLabel}<ChevronDown size={14}/></button>{pagesOpen&&<div className="grid gap-3 border-l border-[#e9dfd9] pl-4">{pages.map(p=><Link key={p.slug} href={"/pages/"+p.slug} onClick={()=>setMenuOpen(false)}>{p.title}</Link>)}</div>}{customLinks.map((l,i)=><Link key={i} href={l.url} onClick={()=>setMenuOpen(false)}>{l.label}</Link>)}</div></nav>}
 </header></>;
}
