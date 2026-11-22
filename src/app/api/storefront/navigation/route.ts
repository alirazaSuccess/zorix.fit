import {NextResponse} from "next/server";
export async function GET(){
 const base=process.env.COMMERCE_API_URL?.replace(/\/$/,"");
 if(!base)return NextResponse.json({settings:{},collections:[],pages:[]},{status:200});
 try{const r=await fetch(base+"/v1/storefront/navigation",{cache:"no-store"});return NextResponse.json(await r.json(),{status:r.status,headers:{"Cache-Control":"no-store"}});}
 catch{return NextResponse.json({settings:{},collections:[],pages:[]},{status:200});}
}
