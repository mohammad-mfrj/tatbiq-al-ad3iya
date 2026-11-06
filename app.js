"use strict";
const $=id=>document.getElementById(id);
const card=$("touchSurface"),counter=$("counter"),title=$("duaTitle"),text=$("duaText"),source=$("duaSource");
const pageNumber=$("pageNumber"),pageTotal=$("pageTotal"),ring=$("progressRing"),prev=$("prevBtn"),next=$("nextBtn");
let items=[],index=0,start=null,lastGestureAt=0;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const save=()=>localStorage.setItem("layali.lastPrayer",items[index]?.id||"");
function render(){
  if(!items.length){
    title.textContent="أدعية";text.textContent="لا توجد أدعية معتمدة حاليًا.";
    counter.textContent="0 / 0";pageNumber.textContent="00";pageTotal.textContent="من 00";
    prev.disabled=true;next.disabled=true;return;
  }
  const item=items[index],number=index+1,total=items.length;
  title.textContent=item.title||"دعاء";
  text.textContent=item.text;
  source.textContent=item.source||"";
  counter.textContent=number+" / "+total;
  pageNumber.textContent=String(number).padStart(2,"0");
  pageTotal.textContent="من "+total;
  ring.style.setProperty("--progress",(number/total*100)+"%");
  ring.setAttribute("aria-valuemax",String(total));
  ring.setAttribute("aria-valuenow",String(number));
  ring.setAttribute("aria-valuetext","الدعاء "+number+" من "+total);
  prev.disabled=index===0;
  next.disabled=index===total-1;
  card.scrollTop=0;
  save();
}
function move(delta){
  if(!items.length)return;
  const target=clamp(index+delta,0,items.length-1);
  if(target===index)return;
  index=target;render();
}
function readHalf(clientX){
  const bounds=card.getBoundingClientRect();
  return clientX<bounds.left+bounds.width/2?1:-1;
}
card.addEventListener("touchstart",e=>{
  if(e.touches.length!==1){start=null;return;}
  start={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
card.addEventListener("touchend",e=>{
  if(!start||e.changedTouches.length!==1)return;
  const dx=e.changedTouches[0].clientX-start.x;
  const dy=e.changedTouches[0].clientY-start.y;
  start=null;
  const traveled=Math.hypot(dx,dy);
  if(traveled>12)lastGestureAt=Date.now();
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.35)move(dx>0?-1:1);
},{passive:true});
card.addEventListener("touchcancel",()=>{start=null;lastGestureAt=Date.now();},{passive:true});
card.addEventListener("click",e=>{
  if(Date.now()-lastGestureAt<650)return;
  move(readHalf(e.clientX));
});
card.addEventListener("keydown",e=>{
  const moves={ArrowRight:-1,ArrowLeft:1,PageUp:-1,PageDown:1,Enter:1," ":1};
  if(Object.prototype.hasOwnProperty.call(moves,e.key)){
    e.preventDefault();move(moves[e.key]);
  }
});
prev.addEventListener("click",()=>move(-1));
next.addEventListener("click",()=>move(1));
function restoreFont(){
  const level=Number(localStorage.getItem("layali.fontLevel")||0);
  document.documentElement.style.setProperty("--dua-size",clamp(27+level*3,22,39)+"px");
}
async function initialize(){
  try{
    const response=await fetch("./data.json",{cache:"no-cache"});
    if(!response.ok)throw Error("HTTP "+response.status);
    const data=await response.json();
    if(!Array.isArray(data)||data.some(item=>!item.id||!item.text))throw Error("Invalid prayer data");
    items=data;
    const saved=localStorage.getItem("layali.lastPrayer");
    index=Math.max(0,items.findIndex(item=>item.id===saved));
    restoreFont();render();
  }catch(error){
    title.textContent="تعذر تحميل الأدعية";
    text.textContent="يرجى إعادة فتح التطبيق بعد الاتصال بالإنترنت.";
    console.error(error);
  }
}
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
}
initialize();
