"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Box, IndianRupee, ShoppingBag, Users, AlertTriangle } from "lucide-react";

type Overview = { stats: { orders:number; products:number; customers:number; revenuePaisa:number; lowStock:number }; recentOrders: Array<{id:string;order_number:string;customer_name:string;total_paisa:number;status:string;created_at:string}> };
const money = (paisa:number) => new Intl.NumberFormat("en-PK",{style:"currency",currency:"PKR",maximumFractionDigits:0}).format(paisa/100);

export default function AdminOverviewPage() {
  const [data,setData] = useState<Overview|null>(null);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ fetch("/api/admin/overview",{cache:"no-store"}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||"Unable to load dashboard");setData(j);}).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[]);
  const cards = data ? [
    {label:"Total orders",value:data.stats.orders.toLocaleString(),icon:ShoppingBag,detail:"All-time orders"},
    {label:"Gross sales",value:money(data.stats.revenuePaisa),icon:IndianRupee,detail:"Excludes cancelled & returned"},
    {label:"Active products",value:data.stats.products.toLocaleString(),icon:Box,detail:"Published catalogue"},
    {label:"Customers",value:data.stats.customers.toLocaleString(),icon:Users,detail:"Unique phone numbers"}
  ] : [];
  return <div className="mx-auto max-w-[1400px]">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="admin-label mb-2">Store overview</p><h1 className="text-3xl font-semibold tracking-tight">Good to see you.</h1><p className="mt-2 text-xs text-[#887a75]">Here’s what’s happening with your store.</p></div><span className="rounded-full border border-[#e5dcd6] bg-white px-4 py-2 text-[10px] font-semibold text-[#76635e]">Live store data</span></div>
    {error && <div className="mb-6 rounded-xl border border-[#edc6bd] bg-[#fff5f2] p-4 text-xs text-[#9c4e43]">{error} {error.toLowerCase().includes("unauthor") && <a className="underline" href="/admin/login">Sign in</a>}</div>}
    {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(n=><div key={n} className="admin-card h-32 animate-pulse bg-[#f0ebe7]"/> )}</div> : data && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card=>{const Icon=card.icon;return <div className="admin-card" key={card.label}><div className="flex items-center justify-between"><span className="admin-label">{card.label}</span><Icon size={17} className="text-[#b56d66]"/></div><p className="mt-6 text-2xl font-semibold tracking-tight">{card.value}</p><p className="mt-2 text-[10px] text-[#9a8b84]">{card.detail}</p></div>})}</div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="admin-card"><div className="mb-5 flex items-center justify-between"><div><p className="admin-label">Latest activity</p><h2 className="mt-2 text-lg font-semibold">Recent orders</h2></div><a href="/admin/orders" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#a65b55]">All orders <ArrowUpRight size={14}/></a></div>
          {data.recentOrders.length ? <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>{data.recentOrders.map(order=><tr key={order.id}><td className="font-semibold">{order.order_number}</td><td>{order.customer_name}</td><td><span className="rounded-full bg-[#f4eee9] px-2.5 py-1 text-[9px] capitalize">{order.status}</span></td><td className="font-semibold">{money(order.total_paisa)}</td></tr>)}</tbody></table></div> : <div className="rounded-xl bg-[#faf7f4] px-5 py-10 text-center"><ShoppingBag className="mx-auto mb-3 text-[#bba9a1]" size={24}/><p className="text-sm font-medium">No orders yet</p><p className="mt-1 text-xs text-[#94847d]">Your new orders will appear here.</p></div>}
        </section>
        <section className="admin-card"><p className="admin-label">Inventory watch</p><h2 className="mt-2 text-lg font-semibold">Stock attention</h2><div className="mt-6 flex items-center gap-4 rounded-xl bg-[#fbf5ef] p-4"><AlertTriangle className="text-[#b56d66]" size={22}/><div><p className="text-2xl font-semibold">{data.stats.lowStock}</p><p className="text-[10px] text-[#887a75]">Products with 5 or fewer items</p></div></div><p className="mt-5 text-xs leading-6 text-[#887a75]">Keep popular sizes and colours available. Inventory alerts will update as product stock is maintained.</p><a href="/admin/products" className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#a65b55]">Manage products <ArrowUpRight size={14}/></a></section>
      </div>
    </>}
  </div>;
}
