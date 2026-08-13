import { db } from "../../firebase";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

import type { Reel } from "./reels.types";


/* ==========================================
   OBTENER REELS
========================================== */

export async function getReels() {

    const reelsQuery = query(
        collection(db, "reels"),
        orderBy("createdAt", "desc")
    );

    return await getDocs(reelsQuery);

}


/* ==========================================
   CREAR REEL
========================================== */

export async function createReel(
    reel: Omit<Reel, "id" | "createdAt">
) {

    await addDoc(
        collection(db, "reels"),
        {
            ...reel,
            createdAt: serverTimestamp()
        }
    );

}


/* ==========================================
   EDITAR REEL
========================================== */

export async function editReel(
    id: string,
    reel: Partial<Reel>
) {

    await updateDoc(
        doc(db, "reels", id),
        reel
    );

}


/* ==========================================
   ELIMINAR REEL
========================================== */

export async function removeReel(
    id: string
) {

    await deleteDoc(
        doc(db, "reels", id)
    );

}


/* ==========================================
   PUBLICAR / OCULTAR
========================================== */

export async function togglePublished(
    id: string,
    value: boolean
) {

    await updateDoc(
        doc(db, "reels", id),
        {
            published: value
        }
    );

}