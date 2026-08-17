import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "firebase/firestore";

import { db } from "./firebase";


export interface PublicNews {

    id: string;

    title: string;

    description: string;

    category: string;

    published: boolean;

    createdAt?: any;

}


export async function getPublishedNews(): Promise<PublicNews[]> {

    const newsQuery = query(

        collection(db, "news"),

        where(
            "published",
            "==",
            true
        ),

        orderBy(
            "createdAt",
            "desc"
        )

    );


    const snapshot =
        await getDocs(newsQuery);


    return snapshot.docs.map(
        (document) => ({

            id: document.id,

            ...document.data()

        } as PublicNews)
    );

}