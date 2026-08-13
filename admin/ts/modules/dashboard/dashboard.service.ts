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

    const [
        newsSnapshot,
        matchesSnapshot,
        reelsSnapshot,
        gallerySnapshot
    ] = await Promise.all([

        getDocs(
            collection(db, "news")
        ),

        getDocs(
            collection(db, "matches")
        ),

        getDocs(
            collection(db, "reels")
        ),

        getDocs(
            collection(db, "gallery")
        )

    ]);


    return {

        news: newsSnapshot.size,

        matches: matchesSnapshot.size,

        reels: reelsSnapshot.size,

        gallery: gallerySnapshot.size

    };

}