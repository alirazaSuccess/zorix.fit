import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
type Props={params:Promise<{slug:string}>};
async function getPage(slug:string){
 const base=process.env.COMMERCE_API_URL?.replace(/\/$/,"");
 if(!base)return null;
 try{const r=await fetch(base+"/v1/content/pages/"+encodeURIComponent(slug),{cache:"no-store"});if(!r.ok)return null;return (await r.json()).page;}catch{return null;}
}
export async function generateMetadata({params}:Props){
 const {slug}=await params,page=await getPage(slug);
 return {title:page?.seo_title||page?.title||"ZORIX",description:page?.seo_description||"Discover ZORIX."};
}
export default async function ContentPage({params}:Props){
 const {slug}=await params,page=await getPage(slug);if(!page)notFound();
 const body=typeof page.content?.body==="string"?page.content.body:"";
 return <main className="min-h-screen bg-[#fbf8f5]"><SiteHeader/><section className="bg-[#f0e9e4] py-16 md:py-24"><div className="container-shell"><p className="eyebrow mb-4 text-[#ad6963]">ZORIX · INFORMATION</p><h1 className="display-title text-5xl md:text-7xl">{page.title}</h1></div></section><article className="container-shell min-h-[45vh] max-w-4xl py-12 md:py-20"><div className="whitespace-pre-wrap text-sm leading-8 text-[#625651]">{body}</div></article><SiteFooter/></main>;
}
