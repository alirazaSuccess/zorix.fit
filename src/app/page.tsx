import { ArrowDown, ArrowRight, ArrowUpRight, Instagram, Menu, Search, ShoppingBag, UserRound } from "lucide-react";

const categories = [
  { name: "For Her", detail: "Everyday confidence", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85" },
  { name: "For Him", detail: "Made for your everyday", image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85" },
  { name: "Daily Essentials", detail: "The pieces you reach for", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85" }
];

const products = [
  { name: "The Everyday Edit", type: "Essential collection", price: "From Rs. 1,490", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85", tag: "BESTSELLER" },
  { name: "Soft Form", type: "Comfort series", price: "From Rs. 1,250", image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=85", tag: "NEW ARRIVAL" },
  { name: "Off-Duty Comfort", type: "Relaxed essentials", price: "From Rs. 1,790", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85", tag: "CURATED FOR YOU" }
];

function Header() {
  return (
    <>
      <div className="bg-[#24211f] px-4 py-2 text-center text-[10px] tracking-[.18em] text-white">A LITTLE MORE COMFORT IN EVERY ORDER · SHOP THE EDIT</div>
      <header className="sticky top-0 z-30 border-b border-[#e7e1d9] bg-[#f7f5f1]/95 backdrop-blur">
        <div className="container-shell flex h-[76px] items-center justify-between">
          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[.13em] md:flex">
            <a href="#shop" className="hover:text-[#a65c45]">Shop</a><a href="#collections" className="hover:text-[#a65c45]">Collections</a><a href="#story" className="hover:text-[#a65c45]">Our story</a>
          </nav>
          <button aria-label="Open menu" className="md:hidden"><Menu size={21}/></button>
          <a href="#" className="absolute left-1/2 -translate-x-1/2 text-[27px] font-black tracking-[.2em]">ZORIX<span className="text-[#a65c45]">.</span></a>
          <div className="flex items-center gap-5"><button aria-label="Search"><Search size={19} strokeWidth={1.5}/></button><button aria-label="Account" className="hidden sm:block"><UserRound size={19} strokeWidth={1.5}/></button><button aria-label="Shopping bag" className="relative"><ShoppingBag size={19} strokeWidth={1.5}/><span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#a65c45] text-[9px] text-white">0</span></button></div>
        </div>
      </header>
    </>
  );
}

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="relative min-h-[620px] overflow-hidden bg-[#d8d0c6] md:min-h-[690px]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,18,17,.58)_0%,rgba(20,18,17,.2)_58%,rgba(20,18,17,.03)_100%)]"/>
        <div className="absolute inset-0 bg-cover bg-[center_35%]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2200&q=90')" }}/>
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent"/>
        <div className="container-shell relative flex min-h-[620px] items-center py-20 md:min-h-[690px]">
          <div className="max-w-[580px] text-white">
            <p className="eyebrow mb-6">THE NEW EVERYDAY</p>
            <h1 className="display-title text-6xl leading-[.98] md:text-[88px]">Feel good.<br/>Be <em>you.</em></h1>
            <p className="mt-7 max-w-[360px] text-sm leading-7 text-white/85">Thoughtful essentials designed to move with you, made for the way you live every day.</p>
            <a href="#shop" className="mt-9 inline-flex items-center gap-8 bg-white px-7 py-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#24211f] transition hover:bg-[#a65c45] hover:text-white">Explore the collection <ArrowUpRight size={15}/></a>
          </div>
        </div>
        <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[.2em] text-white md:flex">Scroll to discover <ArrowDown size={14}/></div>
      </section>

      <section className="container-shell py-20 md:py-28" id="collections">
        <div className="mb-10 flex items-end justify-between gap-4"><div><p className="eyebrow mb-3 text-[#a65c45]">A WORLD OF COMFORT</p><h2 className="display-title text-4xl md:text-5xl">Find your everyday.</h2></div><a href="#shop" className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-widest md:flex">View all <ArrowRight size={14}/></a></div>
        <div className="grid gap-4 md:grid-cols-3">{categories.map((item, index) => <a href="#shop" key={item.name} className="image-zoom group relative h-[430px] overflow-hidden bg-[#e8e1d8] md:h-[500px]"><img src={item.image} alt="" className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"/><div className="absolute bottom-7 left-7 text-white"><p className="mb-2 text-[9px] uppercase tracking-[.2em]">{item.detail}</p><h3 className="display-title text-4xl">{item.name}</h3><span className="mt-4 inline-flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.18em]">Discover <ArrowUpRight size={14}/></span></div></a>)}</div>
      </section>

      <section className="bg-[#eeeae3] py-20 md:py-24" id="shop">
        <div className="container-shell">
          <div className="mb-10 flex items-end justify-between"><div><p className="eyebrow mb-3 text-[#a65c45]">THE ZORIX SELECTION</p><h2 className="display-title text-4xl md:text-5xl">Considered essentials.</h2></div><a href="#shop" className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-widest sm:flex">Shop all <ArrowRight size={14}/></a></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">{products.map((product) => <article key={product.name}><a href="#shop" className="image-zoom group relative mb-4 block aspect-[3/4] overflow-hidden bg-[#ddd5ca]"><img src={product.image} alt="" className="h-full w-full object-cover"/><span className="absolute left-3 top-3 bg-[#f7f5f1] px-2 py-1 text-[8px] font-bold tracking-[.14em]">{product.tag}</span><span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f5f1] opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={17}/></span></a><p className="mb-1 text-[9px] uppercase tracking-[.16em] text-[#8b847c]">{product.type}</p><h3 className="text-sm font-semibold md:text-base">{product.name}</h3><p className="mt-2 text-xs text-[#716b64]">{product.price}</p></article>)}</div>
          <p className="mt-8 text-[10px] text-[#8b847c]">Preview collection and sample pricing — product catalogue will be connected in the next development stage.</p>
        </div>
      </section>

      <section className="container-shell grid gap-10 py-20 md:grid-cols-2 md:items-center md:py-28" id="story">
        <div className="relative h-[440px] overflow-hidden bg-[#e4d9cf]"><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85" alt="ZORIX editorial campaign" className="h-full w-full object-cover"/></div>
        <div className="max-w-[470px] md:pl-10"><p className="eyebrow mb-4 text-[#a65c45]">MADE FOR REAL LIFE</p><h2 className="display-title text-5xl leading-[1.05] md:text-6xl">Your comfort.<br/><em>Your kind of confidence.</em></h2><p className="mt-6 text-sm leading-7 text-[#716b64]">We believe the best pieces are the ones that feel right. ZORIX is building a thoughtful edit of everyday essentials, with comfort at the centre of everything.</p><a href="#collections" className="mt-8 inline-flex items-center gap-4 border-b border-[#24211f] pb-2 text-[10px] font-bold uppercase tracking-[.18em]">Get to know ZORIX <ArrowRight size={14}/></a></div>
      </section>

      <section className="bg-[#292522] px-6 py-16 text-center text-white md:py-20"><p className="eyebrow mb-4 text-[#d6a28e]">STAY IN THE KNOW</p><h2 className="display-title text-4xl md:text-5xl">Good things, occasionally.</h2><p className="mx-auto mt-4 max-w-md text-xs leading-6 text-white/65">Sign up for first looks, new arrivals and a little inspiration for your everyday.</p><form className="mx-auto mt-8 flex max-w-md border-b border-white/40 pb-3"><input type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/50"/><button type="button" className="text-[10px] font-bold uppercase tracking-widest">Join <ArrowRight className="ml-2 inline" size={14}/></button></form></section>
      <footer className="bg-[#f7f5f1]"><div className="container-shell flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between"><a href="#" className="text-2xl font-black tracking-[.2em]">ZORIX<span className="text-[#a65c45]">.</span></a><p className="text-[10px] text-[#8b847c]">Comfort. Confidence. Everyday.</p><div className="flex items-center gap-5 text-[10px] uppercase tracking-widest"><a href="#shop">Shop</a><a href="#story">About</a><a href="mailto:hello@zorix.fit">Contact</a><a href="#" aria-label="Instagram"><Instagram size={16}/></a></div><p className="text-[10px] text-[#8b847c]">© {new Date().getFullYear()} ZORIX. All rights reserved.</p></div></footer>
    </main>
  );
}