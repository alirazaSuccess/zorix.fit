"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
export function AnalyticsTracker(){
 const pathname=usePathname();
 useEffect(()=>{
  try{
   const key="zorix_anon_id",sessionKey="zorix_session_id";
   let anonymous=localStorage.getItem(key);if(!anonymous){anonymous=crypto.randomUUID();localStorage.setItem(key,anonymous);}
   let session=sessionStorage.getItem(sessionKey);if(!session){session=crypto.randomUUID();sessionStorage.setItem(sessionKey,session);}
   void fetch("/api/analytics/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventName:"page_view",path:pathname,anonymousId:anonymous,sessionId:session})});
  }catch{}
 },[pathname]);
 return null;
}
