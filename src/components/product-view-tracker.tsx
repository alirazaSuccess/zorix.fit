"use client";
import {useEffect} from "react";
export function ProductViewTracker({productId}:{productId:string}){
 useEffect(()=>{
  try{
   const key="zorix_anon_id",sessionKey="zorix_session_id";
   let anonymous=localStorage.getItem(key);if(!anonymous){anonymous=crypto.randomUUID();localStorage.setItem(key,anonymous);}
   let session=sessionStorage.getItem(sessionKey);if(!session){session=crypto.randomUUID();sessionStorage.setItem(sessionKey,session);}
   void fetch("/api/analytics/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventName:"product_view",path:window.location.pathname,productId,anonymousId:anonymous,sessionId:session})});
  }catch{}
 },[productId]);
 return null;
}
