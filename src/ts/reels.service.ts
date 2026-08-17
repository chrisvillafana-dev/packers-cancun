import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "firebase/firestore";

import { db } from "./firebase";


export interface PublicReel {

    id: string;

    title: string;

    description: string;

    platform: string;

    url: string;

    published: boolean;

    createdAt?: any;

}


export async function getPublishedReels(): Promise<PublicReel[]> {

    const reelsQuery = query(

        collection(db, "reels"),

        where("published", "==", true),

        orderBy("createdAt", "desc")

    );


    const snapshot =
        await getDocs(reelsQuery);


    return snapshot.docs.map(
        (document) => ({

            id: document.id,

            ...document.data()

        } as PublicReel)
    );

}