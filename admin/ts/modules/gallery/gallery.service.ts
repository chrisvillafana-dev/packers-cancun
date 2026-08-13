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

import type { GalleryItem } from "./gallery.types";


/* ==========================================
   OBTENER GALERÍA
========================================== */

export async function getGallery() {

    const galleryQuery = query(
        collection(db, "gallery"),
        orderBy("createdAt", "desc")
    );

    return await getDocs(galleryQuery);

}


/* ==========================================
   CREAR ELEMENTO
========================================== */

export async function createGalleryItem(
    item: Omit<GalleryItem, "id" | "createdAt">
) {

    await addDoc(
        collection(db, "gallery"),
        {
            ...item,
            createdAt: serverTimestamp()
        }
    );

}


/* ==========================================
   EDITAR ELEMENTO
========================================== */

export async function editGalleryItem(
    id: string,
    item: Partial<GalleryItem>
) {

    await updateDoc(
        doc(db, "gallery", id),
        item
    );

}


/* ==========================================
   ELIMINAR ELEMENTO
========================================== */

export async function removeGalleryItem(
    id: string
) {

    await deleteDoc(
        doc(db, "gallery", id)
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
        doc(db, "gallery", id),
        {
            published: value
        }
    );

}