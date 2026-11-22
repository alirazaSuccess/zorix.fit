import {NextRequest,NextResponse} from "next/server";
export async function POST(request:NextRequest){
 const origin=request.headers.get("origin");if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Cross-origin request blocked."},{status:403});
 const base=process.env.COMMERCE_API_URL?.replace(/\/$/,"");if(!base)return NextResponse.json({error:"Newsletter is not configured."},{status:503});
 try{const r=await fetch(new URL("/v1/newsletter/subscribe",base),{method:"POST",headers:{"content-type":"application/json"},body:await request.text(),cache:"no-store"});return NextResponse.json(await r.json(),{status:r.status});}catch{return NextResponse.json({error:"Subscription service unavailable."},{status:502});}
}