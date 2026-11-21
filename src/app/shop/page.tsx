import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";

const groups = [
  ["Night Suits","night-suits","Soft, beautiful sleepwear for slower evenings."],
  ["Bras","bras","Everyday essentials made for comfort and confidence."],
  ["Underwear","underwear","Feel-good foundations for every day."],
  ["Sport Bras","sport-bras","Supportive pieces made to move with you."],
  ["Sport Underwear","sport-underwear","Comfort that keeps up with your pace."]
];
const photos = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=88",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=88",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=88",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=88",
  "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=88"
];
export default function ShopPage(){
 return <main className="min-h-screen">
  <header className="border-b border-[#e9dfd9]"><div className="container-shell flex h-20 items-center justify-between"><Link href="/" className="text-2xl font-extrabold tracking-[.2em]">ZORIX<span className="text-[#b56d66]">.</span></Link><nav className="flex gap-5 text-[9px] font-bold uppercase tracking-widest"><Link href="/">Home</Link><Link href="/about">Our story</Link><Link href="/contact">Contact</Link></nav></div></header>
  <section className="bg-[#f0e9e4] py-16 md:py-24"><div className="container-shell"><p className="eyebrow mb-4 text-[#ad6963]">THE COMPLETE EDIT</p><h1 className="display-title text-6xl md:text-8xl">Shop all.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-[#766b66]">Explore thoughtfully selected intimates, sleepwear and active essentials. Find the pieces that feel like you.</p></div></section>
  <section className="container-shell py-12 md:py-16"><div className="mb-8 flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.18em] text-[#887a75]">Explore by collection · 05 categories</p><span className="flex items-center gap-2 text-[9px] uppercase tracking-widest"><SlidersHorizontal size={14}/> Curated edit</span></div>
   <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{groups.map((g,i)=><Link href={`/collections/${g[1]}`} key={g[1]} className="group"><div className="image-zoom relative mb-5 aspect-[4/5] overflow-hidden bg-[#eadfd8]"><img src={photos[i]} alt={g[0]} className="h-full w-full object-cover"/><span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#fbf8f5] transition group-hover:bg-[#b56d66] group-hover:text-white"><ArrowUpRight size={18}/></span></div><p className="eyebrow mb-2 text-[#ad6963]">ZORIX COLLECTION</p><h2 className="display-title text-3xl">{g[0]}</h2><p className="mt-2 text-xs leading-6 text-[#887a75]">{g[2]}</p></Link>)}</div>
  </section>
  <footer className="mt-10 bg-[#302625] py-8 text-center text-[9px] uppercase tracking-widest text-white/50">© {new Date().getFullYear()} ZORIX · Comfort looks good on you.</footer>
 </main>
}