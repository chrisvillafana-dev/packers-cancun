import {
    collection,
    getDocs,
    query,
    orderBy
} from "firebase/firestore";

import { db } from "./firebase";


export interface PublicMatch {

    id: string;

    category: string;

    rival: string;

    date: string;

    time: string;

    location: string;

    result?: string;

    outcome?: string;

    createdAt?: any;

}


export async function getMatches(): Promise<PublicMatch[]> {

    const matchesQuery = query(

        collection(db, "matches"),

        orderBy(
            "date",
            "asc"
        )

    );


    const snapshot =
        await getDocs(matchesQuery);


    return snapshot.docs.map(
        (document) => ({

            id: document.id,

            ...document.data()

        } as PublicMatch)
    );

}