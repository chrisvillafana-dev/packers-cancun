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

import type { News } from "./news.types";

/**
 * Obtener todas las noticias
 */
export async function getNews() {

    const newsQuery = query(
        collection(db, "news"),
        orderBy("createdAt", "desc")
    );

    return await getDocs(newsQuery);

}

/**
 * Crear noticia
 */
export async function createNews(news: News) {

    await addDoc(
        collection(db, "news"),
        {
            ...news,
            createdAt: serverTimestamp()
        }
    );

}

/**
 * Editar noticia
 */
export async function editNews(
    id: string,
    news: Partial<News>
) {

    await updateDoc(
        doc(db, "news", id),
        news
    );

}

/**
 * Eliminar noticia
 */
export async function removeNews(id: string) {

    await deleteDoc(
        doc(db, "news", id)
    );

}

/**
 * Publicar / Ocultar
 */
export async function togglePublished(
    id: string,
    value: boolean
) {

    await updateDoc(
        doc(db, "news", id),
        {
            published: value
        }
    );

}