import { NextRequest, NextResponse } from "next/server";
export async function POST(request:NextRequest){
 const origin=request.headers.get("origin");
 if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Cross-origin request blocked."},{status:403});
 const base=process.env.COMMERCE_API_URL?.replace(/\/$/,"");
 if(!base)return NextResponse.json({error:"Analytics API is not configured."},{status:503});
 try{const upstream=await fetch(new URL("/v1/analytics/events",base),{method:"POST",headers:{"content-type":"application/json"},body:await request.text(),cache:"no-store"});return new NextResponse(await upstream.text(),{status:upstream.status,headers:{"content-type":"application/json","cache-control":"no-store"}});}catch{return NextResponse.json({error:"Analytics API unavailable."},{status:502});}
}
