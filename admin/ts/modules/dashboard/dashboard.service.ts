import { db } from "../../firebase";

import {
    collection,
    getDocs
} from "firebase/firestore";

import type { DashboardStats } from "./dashboard.types";


/* ==========================================
   OBTENER ESTADÍSTICAS
========================================== */

export async function getDashboardStats(): Promise<DashboardStats> {

    try {

        const newsSnapshot = await getDocs(
            collection(db, "news")
        );

        const matchesSnapshot = await getDocs(
            collection(db, "matches")
        );

        const reelsSnapshot = await getDocs(
            collection(db, "reels")
        );

        const gallerySnapshot = await getDocs(
            collection(db, "gallery")
        );


        console.log("Dashboard:");

        console.log(
            "Noticias:",
            newsSnapshot.size
        );

        console.log(
            "Partidos:",
            matchesSnapshot.size
        );

        console.log(
            "Reels:",
            reelsSnapshot.size
        );

        console.log(
            "Galería:",
            gallerySnapshot.size
        );


        return {

            news: newsSnapshot.size,

            matches: matchesSnapshot.size,

            reels: reelsSnapshot.size,

            gallery: gallerySnapshot.size

        };


    } catch (error) {

        console.error(
            "Error obteniendo estadísticas del Dashboard:",
            error
        );


        return {

            news: 0,

            matches: 0,

            reels: 0,

            gallery: 0

        };

    }

}