import {

    collection,

    deleteDoc,

    doc,

    getDocs,

    orderBy,

    query,

    updateDoc

} from "firebase/firestore";


import {
    db
} from "../../firebase";


import type {
    RequestStatus
} from "./requests.types";


/* ==========================================
   OBTENER SOLICITUDES
========================================== */

export async function getJoinRequests() {

    const requestsQuery =
        query(

            collection(
                db,
                "joinRequests"
            ),

            orderBy(
                "createdAt",
                "desc"
            )

        );


    return await getDocs(
        requestsQuery
    );

}


/* ==========================================
   ACTUALIZAR ESTADO
========================================== */

export async function updateRequestStatus(

    id: string,

    status: RequestStatus

) {

    await updateDoc(

        doc(
            db,
            "joinRequests",
            id
        ),

        {
            status
        }

    );

}


/* ==========================================
   ELIMINAR SOLICITUD
========================================== */

export async function removeJoinRequest(
    id: string
) {

    await deleteDoc(

        doc(
            db,
            "joinRequests",
            id
        )

    );

}