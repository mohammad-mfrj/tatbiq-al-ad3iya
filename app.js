"use strict";
const $=id=>document.getElementById(id);
const card=$("touchSurface"), counter=$("counter"),title=$("duaTitle"),text=$("duaText"),source=$("duaSource"),progress=$("progress");
let items=[],index=0,fontLevel=Number(localStorage.getItem("layali.fontLevel")||0),start=null,lastSwipeAt=0;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const save=()=>localStorage.setItem("layali.lastPrayer",items[index]?.id||"");
function render(){
  if(!items.length){text.textContent="لا توجد أدعية معتمدة حاليًا.";counter.textContent="0 / 0";return;}
  const item=items[index];
  title.textContent=item.title||"دعاء";
  text.textContent=item.text;
  source.textContent=item.source||"";
  counter.textContent=(index+1)+" / "+items.length;
  progress.style.width=((index+1)/items.length*100)+"%";
  card.scrollTop=0;
  save();
}
function move(delta){if(!items.length)return;index=(index+delta+items.length)%items.length;render();}
function setFont(){document.documentElement.style.setProperty("--dua-size",clamp(27+fontLevel*3,22,39)+"px");localStorage.setItem("layali.fontLevel",String(fontLevel));}
$("fontToggle").addEventListener("click",e=>{e.stopPropagation();fontLevel=fontLevel===4?-2:fontLevel+1;setFont();});
card.addEventListener("touchstart",e=>{if(e.touches.length!==1){start=null;return;}start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
card.addEventListener("touchend",e=>{
  if(!start||e.changedTouches.length!==1)return;
  const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;
  start=null;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.35){lastSwipeAt=Date.now();move(dx>0?-1:1);}
},{passive:true});
card.addEventListener("click",()=>{if(Date.now()-lastSwipeAt<650)return;move(1);});
card.addEventListener("keydown",e=>{
  if(["ArrowRight","ArrowLeft"," ","Enter"].includes(e.key)){e.preventDefault();move(e.key==="ArrowRight"?-1:1);}
});
async function initialize(){
 try{
   const r=await fetch("./data.json",{cache:"no-cache"});if(!r.ok)throw Error("HTTP "+r.status);
   const data=await r.json();if(!Array.isArray(data)||data.some(x=>!x.id||!x.text))throw Error("Invalid prayers data");
   items=data;
   const last=localStorage.getItem("layali.lastPrayer");index=Math.max(0,items.findIndex(x=>x.id===last));
   setFont();render();
 }catch(e){title.textContent="تعذر تحميل الأدعية";text.textContent="افتح التطبيق من خادم الويب، وليس بالنقر على ملف HTML مباشرة.";console.error(e);}
}
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1")){
 window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
}
initialize();
