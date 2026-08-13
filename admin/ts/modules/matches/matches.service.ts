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

import type { Match } from "./matches.types";

/**
 * Obtener partidos
 */
export async function getMatches() {

    const matchesQuery = query(
        collection(db, "matches"),
        orderBy("createdAt", "desc")
    );

    return await getDocs(matchesQuery);

}

/**
 * Crear partido
 */
export async function createMatch(match: Match) {

    await addDoc(
        collection(db, "matches"),
        {
            ...match,
            createdAt: serverTimestamp()
        }
    );

}

/**
 * Editar partido
 */
export async function editMatch(
    id: string,
    match: Partial<Match>
) {

    await updateDoc(
        doc(db, "matches", id),
        match
    );

}

/**
 * Eliminar partido
 */
export async function removeMatch(id: string) {

    await deleteDoc(
        doc(db, "matches", id)
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
        doc(db, "matches", id),
        {
            published: value
        }
    );

}