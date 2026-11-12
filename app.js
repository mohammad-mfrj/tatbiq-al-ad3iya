"use strict";
const $=id=>document.getElementById(id);
const card=$("touchSurface"),counter=$("counter"),title=$("duaTitle"),text=$("duaText"),source=$("duaSource");
const pageNumber=$("pageNumber"),ring=$("progressRing"),prev=$("prevBtn"),next=$("nextBtn");
let items=[],index=0,start=null,lastGestureAt=0;
const save=()=>localStorage.setItem("layali.lastPrayer",items[index]?.id||"");
function render(){
 if(!items.length){title.textContent="أدعية";text.textContent="لا توجد أدعية معروضة. افتح الإدارة لاختيار 20 إلى 30 دعاءً.";counter.textContent="0 / 0";pageNumber.textContent="0";prev.disabled=true;next.disabled=true;return;}
 const item=items[index],number=index+1,total=items.length;
 title.textContent=item.title||"دعاء";text.textContent=item.text;source.textContent=item.source||"";
 counter.textContent=number+" / "+total;pageNumber.textContent=String(number);
 ring.style.setProperty("--progress",(number/total*100)+"%");
 ring.setAttribute("aria-valuemax",String(total));ring.setAttribute("aria-valuenow",String(number));
 ring.setAttribute("aria-valuetext","الدعاء "+number+" من "+total);
 prev.disabled=total<2;next.disabled=total<2;card.scrollTop=0;save();
}
function move(delta){if(items.length<2)return;index=(index+delta+items.length)%items.length;render();}
function readHalf(clientX){const r=card.getBoundingClientRect();return clientX<r.left+r.width/2?1:-1;}
card.addEventListener("touchstart",e=>{start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
card.addEventListener("touchend",e=>{
 if(!start||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;
 if(Math.hypot(dx,dy)>12)lastGestureAt=Date.now();
 if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.35)move(dx>0?-1:1);
},{passive:true});
card.addEventListener("touchcancel",()=>{start=null;lastGestureAt=Date.now();},{passive:true});
card.addEventListener("click",e=>{if(Date.now()-lastGestureAt<650)return;move(readHalf(e.clientX));});
card.addEventListener("keydown",e=>{const moves={ArrowRight:-1,ArrowLeft:1,PageUp:-1,PageDown:1,Enter:1," ":1};if(Object.prototype.hasOwnProperty.call(moves,e.key)){e.preventDefault();move(moves[e.key]);}});
prev.addEventListener("click",()=>move(-1));next.addEventListener("click",()=>move(1));
function reloadCatalog(base){
 const state=DuaStore.load(),saved=localStorage.getItem("layali.lastPrayer");
 items=DuaStore.active(base,state);index=Math.max(0,items.findIndex(item=>item.id===saved));render();
}
async function initialize(){
 try{
  const r=await fetch("./data.json",{cache:"no-cache"});if(!r.ok)throw Error("HTTP "+r.status);
  const base=await r.json();if(!Array.isArray(base)||base.some(x=>!x.id||!x.text))throw Error("Invalid prayer data");
  const font=Number(localStorage.getItem("layali.fontLevel")||0);document.documentElement.style.setProperty("--dua-size",Math.max(22,Math.min(39,27+font*3))+"px");
  reloadCatalog(base);window.addEventListener("storage",e=>{if(e.key===DuaStore.KEY)reloadCatalog(base);});
 }catch(err){title.textContent="تعذر تحميل الأدعية";text.textContent="يرجى إعادة فتح التطبيق بعد الاتصال بالإنترنت.";console.error(err);}
}
if("serviceWorker" in navigator&&(location.protocol==="https:"||["localhost","127.0.0.1"].includes(location.hostname)))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
initialize();
