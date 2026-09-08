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


import { db } from "../../firebase";


import type {
    Category
} from "./categories.types";


/* ==========================================
   OBTENER CATEGORÍAS
========================================== */

export async function getCategories() {

    const categoriesQuery =
        query(

            collection(
                db,
                "categories"
            ),

            orderBy(
                "order",
                "asc"
            )

        );


    return await getDocs(
        categoriesQuery
    );

}


/* ==========================================
   CREAR CATEGORÍA
========================================== */

export async function createCategory(

    category:
        Omit<
            Category,
            "id" | "createdAt"
        >

) {

    return await addDoc(

        collection(
            db,
            "categories"
        ),

        {

            ...category,

            createdAt:
                serverTimestamp()

        }

    );

}


/* ==========================================
   EDITAR CATEGORÍA
========================================== */

export async function editCategory(

    id: string,

    category:
        Partial<Category>

) {

    await updateDoc(

        doc(
            db,
            "categories",
            id
        ),

        category

    );

}


/* ==========================================
   ELIMINAR CATEGORÍA
========================================== */

export async function removeCategory(
    id: string
) {

    await deleteDoc(

        doc(
            db,
            "categories",
            id
        )

    );

}


/* ==========================================
   PUBLICAR / OCULTAR
========================================== */

export async function toggleCategoryPublished(

    id: string,

    value: boolean

) {

    await updateDoc(

        doc(
            db,
            "categories",
            id
        ),

        {

            published:
                value

        }

    );

}