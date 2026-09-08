import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";
export async function getPublishedReels() {
    const reelsQuery = query(collection(db, "reels"), where("published", "==", true), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(reelsQuery);
    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
    }));
}
