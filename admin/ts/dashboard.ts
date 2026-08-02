import { auth } from "./firebase";

import {

onAuthStateChanged,

signOut

} from "firebase/auth";

const welcome = document.querySelector("#welcome-user") as HTMLHeadingElement;

const logoutButton = document.querySelector("#logout-btn") as HTMLButtonElement;

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href="./login.html";

return;

}

welcome.textContent=`Bienvenido, ${user.email}`;

});

logoutButton.addEventListener("click",async()=>{

await signOut(auth);

window.location.href="./login.html";

});