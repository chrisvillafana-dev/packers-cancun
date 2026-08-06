import { db } from "../../firebase";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";

import type { News } from "./news.types";

import { updateDoc } from "firebase/firestore";

export async function editNews(id: string, news: Partial<News>) {

    await updateDoc(

        doc(db, "news", id),

        news

    );

}

export async function getNews() {

    const newsQuery = query(
        collection(db, "news"),
        orderBy("createdAt", "desc")
    );

    return await getDocs(newsQuery);

}

export async function removeNews(id: string) {

    await deleteDoc(doc(db, "news", id));

}

export async function togglePublished(
    id: string,
    value: boolean
){

    await updateDoc(
        doc(db,"news",id),
        {
            published:value
        }
    );

}