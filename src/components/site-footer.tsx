import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";

export function SiteFooter() {
  return <footer className="bg-[#302625] text-[#f8eee9]">
    <div className="container-shell grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:py-20">
      <div>
        <Link href="/" className="text-3xl font-extrabold tracking-[.2em]">ZORIX<span className="text-[#d69b91]">.</span></Link>
        <p className="mt-5 max-w-xs text-xs leading-7 text-white/60">Thoughtful intimates and everyday essentials, designed to make you feel comfortable in your own skin.</p>
        <div className="mt-6 flex gap-4"><Instagram size={17}/></div>
      </div>
      <div><h3 className="footer-heading">Explore</h3><div className="footer-links"><Link href="/shop">Shop all</Link><Link href="/collections/night-suits">Night suits</Link><Link href="/collections/bras">Bras</Link><Link href="/collections/underwear">Underwear</Link><Link href="/collections/sport">Sport collection</Link></div></div>
      <div><h3 className="footer-heading">Customer care</h3><div className="footer-links"><Link href="/contact">Contact us</Link><Link href="/faq">FAQs</Link><Link href="/shipping-returns">Shipping & returns</Link><Link href="/privacy-policy">Privacy policy</Link></div></div>
      <div><h3 className="footer-heading">A note from ZORIX</h3><p className="mt-4 text-xs leading-7 text-white/60">A softer everyday starts here. Join our list for new arrivals, thoughtful edits and little updates.</p><form className="mt-5 flex border-b border-white/35 pb-3"><input type="email" placeholder="Your email address" aria-label="Your email address" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-white/45"/><button type="button" className="text-[9px] font-bold uppercase tracking-widest">Join <ArrowRight className="ml-2 inline" size={13}/></button></form></div>
    </div>
    <div className="border-t border-white/10"><div className="container-shell flex flex-col gap-3 py-5 text-[9px] uppercase tracking-[.14em] text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} ZORIX. All rights reserved.</span><span>Made for your everyday · Pakistan</span></div></div>
  </footer>;
}
