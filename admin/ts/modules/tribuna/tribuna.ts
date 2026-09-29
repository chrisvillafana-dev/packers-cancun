import "../../common";
import { db } from "../../firebase";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";

type TribunaStatus="pending"|"approved"|"rejected";
const list=document.querySelector<HTMLElement>("#tribuna-admin-list")!;
const filter=document.querySelector<HTMLSelectElement>("#tribuna-filter")!;
const count=document.querySelector<HTMLElement>("#tribuna-admin-count")!;
let items:{id:string;displayName:string;message:string;status:TribunaStatus;createdAt:any}[]=[];

async function load():Promise<void>{
  const snapshot=await getDocs(query(collection(db,"tribunaComments"),orderBy("createdAt","desc")));
  items=snapshot.docs.map(d=>({id:d.id,displayName:String(d.data().displayName||""),message:String(d.data().message||""),status:(d.data().status||"pending") as TribunaStatus,createdAt:d.data().createdAt}));
  render();
}
function render():void{
  const value=filter.value; const visible=value==="all"?items:items.filter(i=>i.status===value); count.textContent=`${visible.length} mensajes`; list.innerHTML="";
  if(!visible.length){list.innerHTML="<p>No hay mensajes en esta vista.</p>";return;}
  visible.forEach(item=>{
    const card=document.createElement("article"); card.style.cssText="background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:14px;padding:1rem;";
    const name=document.createElement("strong"); name.textContent=item.displayName; const msg=document.createElement("p"); msg.textContent=item.message; msg.style.whiteSpace="pre-wrap";
    const state=document.createElement("small"); state.textContent=`Estado: ${item.status}`;
    const actions=document.createElement("div"); actions.style.cssText="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem";
    const make=(label:string,fn:()=>void)=>{const b=document.createElement("button");b.className="btn";b.type="button";b.textContent=label;b.addEventListener("click",fn);return b;};
    actions.append(make("Aprobar",()=>setStatus(item.id,"approved")),make("Rechazar",()=>setStatus(item.id,"rejected")),make("Eliminar",()=>remove(item.id)));
    card.append(name,state,msg,actions); list.appendChild(card);
  });
}
async function setStatus(id:string,status:TribunaStatus){await updateDoc(doc(db,"tribunaComments",id),{status});await load();}
async function remove(id:string){if(!confirm("¿Eliminar este mensaje definitivamente?"))return;await deleteDoc(doc(db,"tribunaComments",id));await load();}
filter.addEventListener("change",render);load().catch(error=>{console.error(error);list.textContent="No se pudieron cargar los mensajes.";});
