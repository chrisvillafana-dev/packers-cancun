import { db } from "../../firebase";

import {
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";

import type { CMSUser } from "./users.types";


/* ==========================================
   OBTENER USUARIOS
========================================== */

export async function getUsers() {

    const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
    );

    return await getDocs(usersQuery);

}


/* ==========================================
   CREAR REGISTRO DE USUARIO
========================================== */

export async function createUserRecord(
    user: Omit<CMSUser, "uid" | "createdAt">
) {

    await addDoc(
        collection(db, "users"),
        {
            ...user,
            createdAt: serverTimestamp()
        }
    );

}


/* ==========================================
   EDITAR USUARIO
========================================== */

export async function editUser(
    id: string,
    user: Partial<CMSUser>
) {

    await updateDoc(
        doc(db, "users", id),
        user
    );

}


/* ==========================================
   ELIMINAR USUARIO
========================================== */

export async function removeUser(
    id: string
) {

    await deleteDoc(
        doc(db, "users", id)
    );

}


/* ==========================================
   ACTIVAR / DESACTIVAR
========================================== */

export async function toggleUserActive(
    id: string,
    value: boolean
) {

    await updateDoc(
        doc(db, "users", id),
        {
            active: value
        }
    );

}