import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
const collections: Record<string,{title:string;description:string;image:string;note:string}> = {
 "night-suits":{title:"Night Suits",description:"Ease into the evening with sleepwear that feels as lovely as it looks. Discover soft silhouettes and relaxed everyday comfort.",image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=90",note:"SLOW DOWN. SOFTEN UP."},
 "bras":{title:"Bras",description:"Your everyday foundation, thoughtfully considered. Explore comfortable styles designed to support your day.",image:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=90",note:"SUPPORT THAT FEELS RIGHT."},
 "underwear":{title:"Underwear",description:"The pieces closest to you deserve a little extra thought. Find your everyday favourites in the ZORIX edit.",image:"https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1800&q=90",note:"YOUR EVERYDAY, REDEFINED."},
 "sport-bras":{title:"Sport Bras",description:"Move freely and feel supported. Discover active essentials for stretching, training and everything in between.",image:"https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=90",note:"MADE TO MOVE WITH YOU."},
 "sport-underwear":{title:"Sport Underwear",description:"Lightweight-feeling foundations for active days. Comfort and confidence, from warm-up to wind-down.",image:"https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1800&q=90",note:"COMFORT IN MOTION."},
 "sport":{title:"The Sport Edit",description:"Performance-minded essentials for your active routine. Find your feel-good fit.",image:"https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=90",note:"MOVE YOUR WAY."}
};
export default async function CollectionPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const item=collections[slug];
 if(!item) return <main className="container-shell py-28 text-center"><h1 className="display-title text-6xl">Collection not found.</h1><Link href="/shop" className="mt-8 inline-block text-xs underline">Back to shop</Link></main>;
 return <main><SiteHeader/>
 <section className="relative flex min-h-[440px] items-end overflow-hidden bg-[#8d7770] md:min-h-[570px]"><img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-[#211817]/75 via-[#211817]/15 to-transparent"/><div className="container-shell relative pb-12 pt-28 text-white md:pb-16"><p className="eyebrow mb-4 text-[#f0c9bf]">{item.note}</p><h1 className="display-title text-6xl md:text-8xl">{item.title}.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-white/85">{item.description}</p></div></section>
 <section className="container-shell py-16 text-center md:py-24"><p className="eyebrow mb-4 text-[#ad6963]">A COLLECTION TO MAKE YOUR OWN</p><h2 className="display-title text-4xl md:text-6xl">Your next favourite<br/><em>starts here.</em></h2><p className="mx-auto mt-5 max-w-md text-xs leading-7 text-[#887a75]">We're preparing the first ZORIX edit for this collection. Product styles, sizes, colours and prices will be added and managed from your store dashboard.</p><Link href="/shop" className="mt-8 inline-flex items-center gap-3 bg-[#302625] px-7 py-4 text-[9px] font-bold uppercase tracking-[.18em] text-white transition hover:bg-[#b56d66]"><ArrowLeft size={14}/> Explore other collections</Link></section>
 <SiteFooter/></main>
}