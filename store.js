"use strict";
(function(){
 const KEY="ad3iya.library.v1";
 const recommended=["d075","d076","d059","d066","d034","d019","d037","d038","d067","d030","d052","d024","d035","d045","d046","d074","d062","d063","d010","d015","d053","d014","d070","d026","d025"];
 const reasons={
 d075:"دعاء أضفته بنفسك؛ مختصر ويركز على الرزق والأمنيات",d076:"أضفته بنفسك؛ قصير ومناسب للقراءة اليومية",d059:"توحيد بصياغة مختصرة",d066:"ذكر جامع للتوحيد والحمد",d034:"دعاء قصير للشكر",d019:"التوبة والطهارة بنص قصير",d037:"الحاجة إلى قضاء الدين",d038:"الهدى والعفاف والغنى",d067:"طلب الهداية والحق",d030:"المحافظة على الصلاة والذكر",d052:"الاستعانة بالله والتوكل",d024:"مغفرة ورحمة في سطر واحد",d035:"سؤال دوام العافية",d045:"الاستعاذة والحفظ",d046:"التسبيح والحمد",d074:"حسن الخاتمة",d062:"بداية اليوم",d063:"الاستغاثة بالله",d010:"الفرج والطمأنينة",d015:"طلب تغير الحال",d053:"الرحمة والمغفرة والفرج",d014:"العفو والمغفرة",d070:"الإيمان والعافية",d026:"الحمد والتسليم",d025:"الثبات على الشهادة"
 };
 const norm=s=>String(s||"").normalize("NFKD").replace(/[\u064b-\u065f\u0670\u0640]/g,"").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[^\u0621-\u064a]/g,"");
 function defaults(){return {version:1,selected:recommended.slice(),overrides:{},custom:[],deleted:[]};}
 function sanitize(x){
  const clean=defaults();if(!x||typeof x!=="object")return clean;
  if(Array.isArray(x.selected))clean.selected=[...new Set(x.selected.filter(id=>typeof id==="string"))].slice(0,30);
  if(x.overrides&&typeof x.overrides==="object")for(const [id,v] of Object.entries(x.overrides)){
    if(typeof id==="string"&&v&&typeof v.title==="string"&&typeof v.text==="string")clean.overrides[id]={title:v.title.slice(0,140),text:v.text.slice(0,20000)};
  }
  if(Array.isArray(x.custom))clean.custom=x.custom.filter(v=>v&&typeof v.id==="string"&&v.id.startsWith("custom-")&&typeof v.title==="string"&&typeof v.text==="string").map(v=>({id:v.id,title:v.title.slice(0,140),text:v.text.slice(0,20000),source:""})).slice(0,200);
  if(Array.isArray(x.deleted))clean.deleted=[...new Set(x.deleted.filter(id=>typeof id==="string"))];
  return clean;
 }
 function load(){try{const raw=localStorage.getItem(KEY);return raw?sanitize(JSON.parse(raw)):defaults();}catch{return defaults();}}
 function save(state){localStorage.setItem(KEY,JSON.stringify(sanitize(state)));}
 function catalog(base,state){
  const entries=(Array.isArray(base)?base:[]).map(item=>Object.assign({},item,state.overrides[item.id]||{}));
  const ids=new Set(entries.map(x=>x.id));
  for(const item of state.custom)if(!ids.has(item.id)){entries.push(item);ids.add(item.id);}
  return entries;
 }
 function active(base,state){const map=new Map(catalog(base,state).map(item=>[item.id,item]));return state.selected.filter(id=>!state.deleted.includes(id)&&map.has(id)).map(id=>map.get(id));}
 function verify(base,state){
  const all=catalog(base,state),ids=new Set(all.map(x=>x.id)),selected=state.selected.filter(id=>ids.has(id)&&!state.deleted.includes(id));
  if(selected.length<20||selected.length>30)return `اختر من 20 إلى 30 دعاءً. العدد الحالي: ${selected.length}.`;
  if(new Set(selected).size!==selected.length)return "يوجد تكرار في العناصر المحددة.";
  if(all.some(x=>!x.title.trim()||!x.text.trim()))return "العنوان والنص مطلوبان لكل دعاء.";
  const seen=new Set();for(const x of all.filter(x=>!state.deleted.includes(x.id))){const n=norm(x.text);if(seen.has(n))return `يوجد دعاء مكرر: ${x.title}`;seen.add(n);}
  return null;
 }
 window.DuaStore={KEY,recommended,reasons,norm,defaults,sanitize,load,save,catalog,active,verify};
})();
