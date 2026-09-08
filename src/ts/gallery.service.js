import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
export async function getPublishedGallery() {
    const galleryQuery = query(collection(db, "gallery"), where("published", "==", true));
    const snapshot = await getDocs(galleryQuery);
    const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
    // Ordenamos aquí para evitar depender de un índice compuesto.
    items.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() ?? 0;
        const dateB = b.createdAt?.toMillis?.() ?? 0;
        return dateB - dateA;
    });
    return items;
}
