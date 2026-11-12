const CACHE_NAME="layali-sakina-v9";
const CORE=["./","./index.html","./style.css","./reader-extra.css","./app.js","./store.js","./data.json","./dashboard.html","./dashboard.css","./dashboard.js","./icon-192.png","./icon-512.png","./manifest.webmanifest"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x.startsWith("layali-sakina-")&&x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 if(new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  try{
   const network=await fetch(event.request);
   if(network.ok){const clone=network.clone();await caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone)).catch(()=>{});}
   return network;
  }catch{
   const cached=await caches.match(event.request);if(cached)return cached;
   if(event.request.mode==="navigate"){const shell=await caches.match("./index.html");if(shell)return shell;}
   return Response.error();
  }
 })());
});
