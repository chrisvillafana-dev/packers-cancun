import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
export async function getMatches() {
    const matchesQuery = query(collection(db, "matches"), orderBy("date", "asc"));
    const snapshot = await getDocs(matchesQuery);
    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
    }));
}
