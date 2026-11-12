"use strict";
const D=document,D$=id=>D.getElementById(id);
const {recommended,reasons,norm,load,save,sanitize,catalog,verify}=DuaStore;
let base=[],working=load(),dirty=false,editorId=null;
let filter="all",search="";
const max=30,min=20;
const clone=x=>JSON.parse(JSON.stringify(x));
const toast=s=>{D$("statusText").textContent=s;};
function all(){return catalog(base,working);}
function count(){const ids=new Set(all().map(x=>x.id));return working.selected.filter(id=>ids.has(id)&&!working.deleted.includes(id)).length;}
function markDirty(){dirty=true;refresh();}
function tag(label,className){const x=D.createElement("span");x.className="tag"+(className?" "+className:"");x.textContent=label;return x;}
function makeButton(label,onClick,className="small-btn",disabled=false){const b=D.createElement("button");b.type="button";b.className=className;b.textContent=label;b.disabled=disabled;b.addEventListener("click",onClick);return b;}
function entry(item){
 const active=working.selected.includes(item.id),deleted=working.deleted.includes(item.id),rec=recommended.includes(item.id),custom=item.id.startsWith("custom-");
 const box=D.createElement("article");box.className="entry"+(active?" active":"")+(deleted?" deleted":"");box.dataset.id=item.id;
 const head=D.createElement("div");head.className="entry-head";
 const main=D.createElement("div");main.className="entry-main";
 const h=D.createElement("h3");h.textContent=item.title;main.append(h);
 const meta=D.createElement("div");meta.className="entry-meta";
 meta.append(tag(rec?"ترشيح للإبقاء":"ترشيح للاستبعاد",rec?"positive":"secondary"),tag(item.text.length+" حرفًا","secondary"));
 if(active)meta.append(tag("ضمن القراءة"));if(custom)meta.append(tag("أضفته أنت","positive"));if(deleted)meta.append(tag("في المحذوفات","secondary"));
 main.append(meta);head.append(main);
 if(!deleted){const label=D.createElement("label");label.className="keep-box";const input=D.createElement("input");input.type="checkbox";input.checked=active;input.setAttribute("aria-label","إبقاء "+item.title+" في القراءة");
 input.addEventListener("change",()=>{
   if(input.checked){if(count()>=max){input.checked=false;toast("الحد الأقصى 30 دعاءً. أزل دعاءً أولًا.");return;}working.selected.push(item.id);}
   else working.selected=working.selected.filter(id=>id!==item.id);
   markDirty();
 });label.append(input,D.createTextNode("إبقاء"));head.append(label);}
 box.append(head);
 const excerpt=D.createElement("p");excerpt.className="entry-excerpt";excerpt.textContent=item.text;box.append(excerpt);
 const why=D.createElement("p");why.className="recommend-note";
 why.textContent=rec?(reasons[item.id]||"موضوع متنوع وصياغة مناسبة"):(item.text.length>550?"ترشيح للاستبعاد: نص طويل أو موضوع مشابه لأدعية أقصر.":"ترشيح للاستبعاد: يمكن الاكتفاء بأدعية مختارة من الموضوع نفسه.");box.append(why);
 const controls=D.createElement("div");controls.className="entry-controls";
 controls.append(makeButton("قراءة كاملة",()=>{const e=excerpt.classList.toggle("expanded");controls.querySelector("button").textContent=e?"اختصار النص":"قراءة كاملة";}));
 if(!deleted){controls.append(makeButton("تعديل",()=>openEditor(item.id)));controls.append(makeButton("حذف",()=>{
   if(!confirm("نقل هذا الدعاء إلى المحذوفات؟ يمكن استعادته لاحقًا."))return;
   working.deleted.push(item.id);working.selected=working.selected.filter(id=>id!==item.id);markDirty();
 },"small-btn danger"));
 if(active){const at=working.selected.indexOf(item.id);controls.append(makeButton("أعلى",()=>swap(at,-1),"small-btn",at===0));controls.append(makeButton("أسفل",()=>swap(at,1),"small-btn",at===working.selected.length-1));}
 }else controls.append(makeButton("استعادة",()=>{working.deleted=working.deleted.filter(id=>id!==item.id);markDirty();}));
 box.append(controls);return box;
}
function swap(index,delta){const j=index+delta;if(index<0||j<0||j>=working.selected.length)return;[working.selected[index],working.selected[j]]=[working.selected[j],working.selected[index]];markDirty();}
function refresh(){
 const items=all();const active=count();const trash=working.deleted.length;
 D$("selectedCount").textContent=active;D$("libraryCount").textContent=items.length-trash;D$("archiveCount").textContent=items.length-trash-active;
 const issue=verify(base,working);D$("saveBtn").disabled=!!issue||!dirty;
 if(issue){toast(issue+" لن يُحفظ الاختيار حتى يصبح بين 20 و30.");}
 else toast(dirty?`تعديلات غير محفوظة: اخترت ${active} دعاءً.`:`كل التغييرات محفوظة محليًا. ${active} دعاءً للقراءة.`);
 const matched=items.filter(x=>{
  const del=working.deleted.includes(x.id),isActive=working.selected.includes(x.id);
  if(filter==="active"&&!isActive)return false;if(filter==="archive"&&(del||isActive))return false;
  if(filter==="deleted"&&!del)return false;if(filter==="recommended"&&!recommended.includes(x.id))return false;
  if(filter!=="deleted"&&del)return false;
  return !search||norm(x.title+" "+x.text).includes(norm(search));
 });
 D$("resultsLine").textContent=`عرض ${matched.length} من ${items.length} دعاءً وذكرًا في المكتبة`;
 const holder=D$("entries");holder.replaceChildren();const frag=D.createDocumentFragment();for(const x of matched)frag.append(entry(x));holder.append(frag);
}
function openEditor(id=null){
 editorId=id;const item=id?all().find(x=>x.id===id):null;
 D$("editorHeading").textContent=item?"تعديل الدعاء":"إضافة دعاء جديد";
 D$("editTitle").value=item?item.title:"";D$("editText").value=item?item.text:"";
 D$("editorHint").textContent=item?"التعديل سيظهر في القراءة بعد حفظ التغييرات.":"أدخل عنوانًا ونصًا جديدين. يمكنك إرسالهما لاحقًا لتحديث نسخة GitHub العامة.";
 D$("editor").showModal();D$("editTitle").focus();
}
D$("editorForm").addEventListener("submit",e=>{
 e.preventDefault();const title=D$("editTitle").value.trim(),text=D$("editText").value.trim();
 if(!title||!text){alert("أدخل العنوان ونص الدعاء.");return;}
 if(/\p{Extended_Pictographic}/u.test(text)){alert("الرموز التعبيرية غير مسموح بها داخل الأدعية.");return;}
 const existing=all().find(x=>norm(x.text)===norm(text)&&x.id!==editorId&&!working.deleted.includes(x.id));
 if(existing){alert("هذا الدعاء موجود بالفعل في المكتبة بعنوان: "+existing.title);return;}
 if(editorId){const item=working.custom.find(x=>x.id===editorId);
  if(item){item.title=title;item.text=text;}
  else working.overrides[editorId]={title,text};
 }else{
  const id="custom-"+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
  working.custom.push({id,title,text,source:""});if(count()<max)working.selected.push(id);
 }
 D$("editor").close();markDirty();
});
D$("closeEditor").addEventListener("click",()=>D$("editor").close());D$("cancelEditor").addEventListener("click",()=>D$("editor").close());
D$("addBtn").addEventListener("click",()=>openEditor());
D$("searchInput").addEventListener("input",e=>{search=e.target.value;refresh();});
D$("filterSelect").addEventListener("change",e=>{filter=e.target.value;refresh();});
D$("recommendBtn").addEventListener("click",()=>{
 if(!confirm("استبدال قائمتك المختارة بالترشيحات الـ25؟ سيبقى أرشيف الأدعية وتعديلات النصوص كما هما."))return;
 working.selected=recommended.filter(id=>!working.deleted.includes(id)&&all().some(x=>x.id===id));markDirty();
});
D$("resetBtn").addEventListener("click",()=>{if(dirty&&!confirm("التراجع عن التعديلات غير المحفوظة؟"))return;working=load();dirty=false;refresh();});
D$("saveBtn").addEventListener("click",()=>{
 const error=verify(base,working);if(error){alert(error);return;}
 try{save(working);dirty=false;refresh();toast("تم حفظ اختيارك وتعديلاتك على هذا الجهاز. افتح القراءة لمشاهدتها.");}
 catch(error){alert("تعذر حفظ البيانات محليًا: "+error.message);}
});
D$("downloadBtn").addEventListener("click",()=>{
 const payload={app:"Ad3iya",format:1,exportedAt:new Date().toISOString(),data:sanitize(working)};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob);const a=D.createElement("a");a.href=url;a.download="ad3iya-backup.json";D.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
});
D$("importInput").addEventListener("change",async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>4*1024*1024)throw Error("حجم النسخة كبير جدًا");const payload=JSON.parse(await file.text());if(payload.app!=="Ad3iya"||payload.format!==1||!payload.data)throw Error("صيغة النسخة غير معتمدة");const proposal=sanitize(payload.data);
  if(verify(base,proposal))throw Error(verify(base,proposal));
  working=proposal;markDirty();toast("تم استيراد النسخة للمراجعة. اضغط حفظ التغييرات لتثبيتها.");
 }catch(err){alert("تعذر استيراد النسخة: "+err.message);}finally{e.target.value="";}
});
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue="";}});
(async()=>{
 try{const res=await fetch("./data.json",{cache:"no-cache"});if(!res.ok)throw Error("HTTP "+res.status);
   base=await res.json();if(!Array.isArray(base)||!base.length)throw Error("لا توجد أدعية في المصدر");
   working=load();refresh();
 }catch(err){D$("resultsLine").textContent="تعذر تحميل المكتبة: "+err.message;console.error(err);}
})();
