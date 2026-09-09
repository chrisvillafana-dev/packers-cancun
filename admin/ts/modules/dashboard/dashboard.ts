import "../../common";
import { auth } from "../../firebase";

import {

onAuthStateChanged,

signOut

} from "firebase/auth";

import {
    getDashboardStats
} from "./dashboard.service";

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

/* ==========================================
   ESTADÍSTICAS
========================================== */

async function loadDashboardStats() {

    try {

        const stats =
            await getDashboardStats();


        const news =
            document.querySelector(
                "#stat-news"
            ) as HTMLElement;


        const matches =
            document.querySelector(
                "#stat-matches"
            ) as HTMLElement;


        const reels =
            document.querySelector(
                "#stat-reels"
            ) as HTMLElement;


        const gallery =
            document.querySelector(
                "#stat-gallery"
            ) as HTMLElement;


        news.textContent =
            stats.news.toString();


        matches.textContent =
            stats.matches.toString();


        reels.textContent =
            stats.reels.toString();


        gallery.textContent =
            stats.gallery.toString();


    } catch (error) {

        console.error(
            "Error cargando estadísticas:",
            error
        );

    }

}


loadDashboardStats();