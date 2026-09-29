import "./common";
import { db } from "./../../admin/ts/firebase";
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore";

const form = document.querySelector<HTMLFormElement>("#tribuna-form");
const nameInput = document.querySelector<HTMLInputElement>("#tribuna-name");
const messageInput = document.querySelector<HTMLTextAreaElement>("#tribuna-message");
const websiteInput = document.querySelector<HTMLInputElement>("#tribuna-website");
const consentInput = document.querySelector<HTMLInputElement>("#tribuna-consent");
const submitButton = document.querySelector<HTMLButtonElement>("#tribuna-submit");
const status = document.querySelector<HTMLElement>("#tribuna-status");
const counter = document.querySelector<HTMLElement>("#tribuna-count");
const messages = document.querySelector<HTMLElement>("#tribuna-messages");

messageInput?.addEventListener("input",()=>{ if(counter) counter.textContent=String(messageInput.value.length); });

form?.addEventListener("submit",async(event)=>{
  event.preventDefault();
  if(!nameInput||!messageInput||!websiteInput||!consentInput||!submitButton||!status)return;
  if(websiteInput.value){ form.reset(); return; }
  const displayName=nameInput.value.trim(); const message=messageInput.value.trim();
  if(displayName.length<2||displayName.length>40){status.textContent="Escribe un nombre o apodo de 2 a 40 caracteres.";return;}
  if(message.length<3||message.length>300){status.textContent="El mensaje debe tener entre 3 y 300 caracteres.";return;}
  if(!consentInput.checked){status.textContent="Debes aceptar la publicación del mensaje.";return;}
  try{
    submitButton.disabled=true; submitButton.textContent="Enviando..."; status.textContent="";
    await addDoc(collection(db,"tribunaComments"),{displayName,message,status:"pending",source:"website",consent:true,createdAt:serverTimestamp()});
    form.reset(); if(counter)counter.textContent="0"; status.textContent="Mensaje enviado. Se publicará después de ser revisado.";
  }catch(error){console.error("Error enviando comentario:",error);status.textContent="No pudimos enviar tu mensaje. Intenta de nuevo.";}
  finally{submitButton.disabled=false;submitButton.textContent="Enviar a la Tribuna";}
});

async function loadMessages():Promise<void>{
  if(!messages)return;
  try{
    const q=query(collection(db,"tribunaComments"),where("status","==","approved"),orderBy("createdAt","desc"),limit(30));
    const snapshot=await getDocs(q); messages.innerHTML="";
    if(snapshot.empty){messages.innerHTML='<div class="tribuna-empty">La tribuna está lista para recibir sus primeros mensajes.</div>';return;}
    snapshot.forEach((docSnapshot)=>{
      const data=docSnapshot.data();
      const article=document.createElement("article"); article.className="tribuna-message";
      const head=document.createElement("div"); head.className="tribuna-message-head";
      const avatar=document.createElement("span"); avatar.className="tribuna-avatar"; avatar.textContent=String(data.displayName||"P").trim().charAt(0).toUpperCase()||"P";
      const author=document.createElement("span"); author.className="tribuna-author"; author.textContent=String(data.displayName||"Packers Fan");
      const date=document.createElement("span"); date.className="tribuna-date"; const d=data.createdAt?.toDate?.(); date.textContent=d?new Intl.DateTimeFormat("es-MX",{day:"numeric",month:"short"}).format(d):"";
      const body=document.createElement("p"); body.textContent=String(data.message||"");
      head.append(avatar,author,date); article.append(head,body); messages.appendChild(article);
    });
  }catch(error){console.error("Error cargando tribuna:",error);messages.innerHTML='<div class="tribuna-empty">No se pudieron cargar los mensajes por ahora.</div>';}
}
loadMessages();
