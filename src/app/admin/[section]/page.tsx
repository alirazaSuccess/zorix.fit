import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

const content: Record<string,{title:string;description:string}> = {
  products:{title:"Products",description:"Catalogue management, variants, sizes, colours, pricing and inventory."},
  collections:{title:"Collections",description:"Create collections, assign products and control collection order."},
  media:{title:"Media library",description:"Upload and organise replaceable store imagery through Cloudinary."},
  content:{title:"Website content",description:"Manage homepage sections, banners, navigation, footer and content pages."},
  orders:{title:"Orders",description:"Review COD orders, customer details, fulfilment status and order history."},
  analytics:{title:"Analytics",description:"Understand visits, product engagement, checkout activity and sales."},
  settings:{title:"Store settings",description:"Manage store details, shipping, COD preferences and account security."}
};
export default async function AdminSectionPage({params}:{params:Promise<{section:string}>}) {
 const {section}=await params; const item=content[section];
 if(!item) return <div className="admin-card"><h1 className="text-xl font-semibold">Section not found</h1><Link href="/admin" className="mt-4 inline-flex text-xs text-[#a65b55] underline">Back to overview</Link></div>;
 return <div className="mx-auto max-w-4xl"><p className="admin-label mb-2">Store management</p><h1 className="text-3xl font-semibold">{item.title}</h1><p className="mt-2 text-sm text-[#887a75]">{item.description}</p><div className="admin-card mt-8 flex min-h-[260px] flex-col items-center justify-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5eae5] text-[#a65b55]"><Construction size={23}/></span><h2 className="mt-5 text-lg font-semibold">This workspace is next in development</h2><p className="mt-2 max-w-md text-xs leading-6 text-[#887a75]">The dashboard shell and secure access are being built first. This section will be connected to the live commerce API and database before it is marked complete.</p><Link href="/admin" className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#a65b55]"><ArrowLeft size={14}/> Back to overview</Link></div></div>;
}
