import {

    collection,

    getDocs,

    addDoc,

    deleteDoc,

    doc,

    query,

    orderBy,

    serverTimestamp,

    updateDoc,

    getDoc,

    setDoc

} from "firebase/firestore";


import {
    db
} from "../../firebase";


import type {
    Player
} from "./players.types";


/* ==========================================
   OBTENER JUGADORES
========================================== */

export async function getPlayers() {

    const playersQuery =
        query(

            collection(
                db,
                "players"
            ),

            orderBy(
                "createdAt",
                "desc"
            )

        );


    return await getDocs(
        playersQuery
    );

}


/* ==========================================
   CREAR JUGADOR
========================================== */

export async function createPlayer(

    player:
        Omit<
            Player,
            "id" | "createdAt"
        >

) {

    await addDoc(

        collection(
            db,
            "players"
        ),

        {

            ...player,

            createdAt:
                serverTimestamp()

        }

    );

}


/* ==========================================
   EDITAR JUGADOR
========================================== */

export async function editPlayer(

    id: string,

    player:
        Partial<Player>

) {

    await updateDoc(

        doc(
            db,
            "players",
            id
        ),

        player

    );

}


/* ==========================================
   ELIMINAR JUGADOR
========================================== */

export async function removePlayer(
    id: string
) {

    await deleteDoc(

        doc(
            db,
            "players",
            id
        )

    );

}


/* ==========================================
   PUBLICAR / OCULTAR
========================================== */

export async function togglePublished(

    id: string,

    value: boolean

) {

    await updateDoc(

        doc(
            db,
            "players",
            id
        ),

        {

            published:
                value

        }

    );

}


/* ==========================================
   CATEGORÍAS
========================================== */

export async function getPlayerCategories() {

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
   CONFIGURACIÓN DE STATS
========================================== */

export async function getStatsSettings() {

    const settingsRef =
        doc(
            db,
            "settings",
            "stats"
        );


    return await getDoc(
        settingsRef
    );

}


/* ==========================================
   GUARDAR MVP
========================================== */

export async function setWeeklyMvp(

    playerId: string

) {

    const settingsRef =
        doc(
            db,
            "settings",
            "stats"
        );


    await setDoc(

        settingsRef,

        {

            weeklyMvp:
                playerId,

            updatedAt:
                serverTimestamp()

        },

        {

            merge:
                true

        }

    );

}