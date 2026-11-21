import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const categories = [
  { title: "Night Suits", subtitle: "Soft nights. Beautiful mornings.", slug: "night-suits", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=88", tone: "warm" },
  { title: "Bras", subtitle: "Everyday support, elevated.", slug: "bras", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=88", tone: "rose" },
  { title: "Underwear", subtitle: "The essentials you'll live in.", slug: "underwear", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1000&q=88", tone: "sand" },
  { title: "Sport Bras", subtitle: "Made to move with you.", slug: "sport-bras", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=88", tone: "dark" },
  { title: "Sport Underwear", subtitle: "Performance meets comfort.", slug: "sport-underwear", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1000&q=88", tone: "dark" }
];

const edits = [
  { name: "The Soft Touch Night Suit", detail: "Nightwear · Relaxed fit", price: "Rs. 2,490", label: "BESTSELLER", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=850&q=88" },
  { name: "Everyday Comfort Bra", detail: "Bras · All-day comfort", price: "Rs. 1,690", label: "EVERYDAY EDIT", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=850&q=88" },
  { name: "Second Skin Brief", detail: "Underwear · Soft stretch", price: "Rs. 890", label: "CUSTOMER FAVOURITE", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=850&q=88" },
  { name: "Move With You Set", detail: "Activewear · Sport collection", price: "Rs. 2,990", label: "NEW SEASON", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=850&q=88" }
];

async function getLiveCollections(){
 const base=process.env.COMMERCE_API_URL?.replace(/\/$/,"");
 if(!base)return [];
 try{const r=await fetch(base+"/v1/collections",{cache:"no-store"});if(!r.ok)return [];const j=await r.json();return j.data||[];}catch{return [];}
}

async function getLiveProducts(){
 const base=process.env.COMMERCE_API_URL?.replace(/\/$/,"");
 if(!base)return [];
 try{const r=await fetch(base+"/v1/products?limit=8",{cache:"no-store"});if(!r.ok)return [];const j=await r.json();return j.data||[];}catch{return [];}
}

async function getHomepageSections(){
 const base=process.env.COMMERCE_API_URL?.replace(/\/$/,"");
 if(!base)return [];
 try{const r=await fetch(base+"/v1/content/homepage",{cache:"no-store"});if(!r.ok)return [];const j=await r.json();return j.data||[];}catch{return [];}
}

export default async function HomePage() {
  const [cmsSections,liveCollections,liveProducts]=await Promise.all([getHomepageSections(),getLiveCollections(),getLiveProducts()]);
  const displayEdits=liveProducts.length?liveProducts.slice(0,4).map((p:any)=>({name:p.title,detail:p.product_type||"ZORIX ESSENTIALS",price:"Rs. "+Math.round((p.price_paisa||0)/100).toLocaleString("en-PK"),label:p.featured?"FEATURED":"NEW EDIT",image:p.image_url||"",slug:p.slug})):edits;
  const displayCategories=liveCollections.length?liveCollections.map((item:any,i:number)=>({title:item.title,subtitle:item.description||"Explore the collection.",slug:item.slug,image:item.image_key?.startsWith("https://")?item.image_key:categories[i%categories.length].image,tone:"warm"})):categories;
  const heroSection=cmsSections.find((section:any)=>section.section_type==="hero");
  const collectionSection=cmsSections.find((section:any)=>section.section_type==="collection_grid");
  const featuredSection=cmsSections.find((section:any)=>section.section_type==="featured_products");
  const editorialSection=cmsSections.find((section:any)=>section.section_type==="editorial");
  const newsletterSection=cmsSections.find((section:any)=>section.section_type==="newsletter");
  const bannerSections=cmsSections.filter((section:any)=>section.section_type==="banner"&&section.is_visible);
  const heroImage=heroSection?.settings?.image_url||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2200&q=90";
  return <main>
    <SiteHeader/>
    {(!heroSection||heroSection.is_visible)&&<section className="hero-editorial relative min-h-[590px] overflow-hidden md:min-h-[700px]">
      <div className="absolute inset-0 bg-cover bg-[center_32%]" style={{backgroundImage:"url('"+heroImage+"')"}}/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#211817]/65 via-[#211817]/25 to-transparent"/>
      <div className="container-shell relative flex min-h-[590px] items-center py-20 md:min-h-[700px]">
        <div className="max-w-[560px] text-white"><p className="eyebrow mb-6 text-[#f0c9bf]">THE ART OF FEELING GOOD</p><h1 className="display-title text-6xl leading-[.96] md:text-[92px]">{heroSection?.title||<>Comfort looks<br/>good on <em>you.</em></>}</h1><p className="mt-7 max-w-[370px] text-sm leading-7 text-white/85">{heroSection?.body||"Beautifully considered lingerie, sleepwear and active essentials for every version of you."}</p><Link href={heroSection?.settings?.cta_url||"/shop"} className="mt-9 inline-flex items-center gap-8 bg-[#fbf6f1] px-7 py-4 text-[9px] font-bold uppercase tracking-[.2em] text-[#302625] transition hover:bg-[#b56d66] hover:text-white">{heroSection?.settings?.cta_label||"Explore the collection"} <ArrowUpRight size={15}/></Link></div>
      </div>
      <div className="absolute bottom-8 right-8 hidden text-[9px] uppercase tracking-[.2em] text-white/80 md:block">Discover your everyday · 01 / 05</div>
    </section>}

    {bannerSections.map((section:any)=><section key={section.id} className="relative my-8 overflow-hidden bg-[#302625] py-16 text-white md:py-24">{section.settings?.image_url&&<div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage:"url('"+section.settings.image_url+"')"}}/>}<div className="container-shell relative"><p className="eyebrow mb-3 text-[#d8a49b]">{section.subtitle}</p><h2 className="display-title max-w-3xl text-4xl md:text-6xl">{section.title}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/75">{section.body}</p>{section.settings?.cta_label&&<Link href={section.settings?.cta_url||"/shop"} className="mt-7 inline-flex bg-[#fbf6f1] px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-[#302625]">{section.settings.cta_label}</Link>}</div></section>)}

    {(!collectionSection||collectionSection.is_visible)&&<section className="container-shell py-16 md:py-24">
      <div className="mb-9 flex items-end justify-between"><div><p className="eyebrow mb-3 text-[#ad6963]">{collectionSection?.subtitle||"FIND YOUR FEEL-GOOD"}</p><h2 className="display-title text-4xl md:text-6xl">{collectionSection?.title||"The collections."}</h2></div><Link href="/shop" className="hidden items-center gap-2 text-[9px] font-bold uppercase tracking-widest sm:flex">Shop everything <ArrowRight size={14}/></Link></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayCategories.map((item:any, i:number)=><Link key={item.slug} href={`/collections/${item.slug}`} className={`category-tile group relative overflow-hidden bg-[#e9ded7] ${i===0 ? "sm:row-span-2 sm:h-[680px]" : "h-[330px] md:h-[330px]"}`}><img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"/><div className="absolute inset-0 bg-gradient-to-t from-[#211817]/65 via-transparent to-transparent"/><div className="absolute bottom-6 left-6 text-white md:bottom-8 md:left-8"><p className="mb-2 text-[9px] uppercase tracking-[.2em] text-white/75">{item.subtitle}</p><h3 className="display-title text-4xl md:text-5xl">{item.title}</h3><span className="mt-4 inline-flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.18em]">Discover <ArrowUpRight size={14}/></span></div></Link>)}
      </div>
    </section>}

    {(!featuredSection||featuredSection.is_visible)&&<section className="bg-[#f0e9e4] py-16 md:py-24">
      <div className="container-shell"><div className="mb-10 flex items-end justify-between"><div><p className="eyebrow mb-3 text-[#ad6963]">{featuredSection?.subtitle||"THE ZORIX SELECTION"}</p><h2 className="display-title text-4xl md:text-6xl">{featuredSection?.title||"A little something lovely."}</h2></div><Link href="/shop" className="hidden items-center gap-2 text-[9px] font-bold uppercase tracking-widest sm:flex">View all <ArrowRight size={14}/></Link></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">{displayEdits.map((p:any)=><article key={p.name}><Link href={p.slug?"/products/"+p.slug:"/shop"} className="image-zoom group relative mb-4 block aspect-[3/4] overflow-hidden bg-[#e5d9d2]"><img src={p.image} alt={p.name} className="h-full w-full object-cover"/><span className="absolute left-3 top-3 bg-[#fbf8f5] px-2 py-1.5 text-[8px] font-bold tracking-[.13em]">{p.label}</span><span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#fbf8f5] opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={17}/></span></Link><p className="mb-1 text-[9px] uppercase tracking-[.14em] text-[#9b827b]">{p.detail}</p><h3 className="text-xs font-semibold md:text-sm">{p.name}</h3><p className="mt-2 text-xs text-[#76635e]">{p.price}</p></article>)}</div>
        <p className="mt-8 text-[9px] uppercase tracking-wider text-[#927e77]">Editorial preview · Product names, prices and images are temporary and will be editable from your store dashboard.</p>
      </div>
    </section>}

    {(!editorialSection||editorialSection.is_visible)&&<section className="container-shell grid gap-10 py-16 md:grid-cols-2 md:items-center md:gap-20 md:py-24">
      <div className="relative h-[430px] overflow-hidden bg-[#e8dcd5] md:h-[580px]"><img src={editorialSection?.settings?.image_url||"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=88"} alt="ZORIX everyday editorial" className="h-full w-full object-cover"/></div>
      <div className="max-w-[490px]"><p className="eyebrow mb-4 text-[#ad6963]">{editorialSection?.subtitle||"MADE FOR THE WAY YOU FEEL"}</p><h2 className="display-title text-5xl leading-[1.04] md:text-7xl">{editorialSection?.title||<>Your body.<br/><em>Your comfort.</em><br/>Your rules.</>}</h2><p className="mt-7 text-sm leading-8 text-[#766b66]">{editorialSection?.body||"From slow mornings to your strongest moves, ZORIX brings together the pieces that make everyday dressing feel effortless. No fuss. Just feel-good essentials."}</p><Link href="/about" className="mt-8 inline-flex items-center gap-4 border-b border-[#302625] pb-2 text-[9px] font-bold uppercase tracking-[.18em]">Our story <ArrowRight size={14}/></Link></div>
    </section>}

    {(!newsletterSection||newsletterSection.is_visible)&&<section className="bg-[#302625] px-6 py-16 text-center text-white md:py-24"><p className="eyebrow mb-4 text-[#d8a49b]">{newsletterSection?.subtitle||"A LITTLE LOVE IN YOUR INBOX"}</p><h2 className="display-title text-4xl md:text-6xl">{newsletterSection?.title||"Stay close to comfort."}</h2><p className="mx-auto mt-4 max-w-md text-xs leading-7 text-white/65">{newsletterSection?.body||"Be first to know about new collections, special edits and everything happening at ZORIX."}</p><form className="mx-auto mt-8 flex max-w-md border-b border-white/40 pb-3"><input type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/50"/><button type="button" className="text-[9px] font-bold uppercase tracking-widest">Sign up <ArrowRight className="ml-2 inline" size={14}/></button></form></section>}
    <SiteFooter/>
  </main>;
}
