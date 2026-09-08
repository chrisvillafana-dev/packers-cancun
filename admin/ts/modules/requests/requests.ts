import {

    getJoinRequests,

    removeJoinRequest,

    updateRequestStatus

} from "./requests.service";


import type {

    JoinRequest,

    RequestStatus

} from "./requests.types";


/* ==========================================
   ELEMENTOS
========================================== */

const table =
    document.querySelector(
        "#requests-table"
    ) as HTMLTableSectionElement;


const searchInput =
    document.querySelector(
        "#search-request"
    ) as HTMLInputElement;


const statusFilter =
    document.querySelector(
        "#filter-request-status"
    ) as HTMLSelectElement;


const refreshButton =
    document.querySelector(
        "#refresh-requests"
    ) as HTMLButtonElement;


const totalCount =
    document.querySelector(
        "#requests-total"
    ) as HTMLElement;


const newCount =
    document.querySelector(
        "#requests-new"
    ) as HTMLElement;


const contactedCount =
    document.querySelector(
        "#requests-contacted"
    ) as HTMLElement;


const closedCount =
    document.querySelector(
        "#requests-closed"
    ) as HTMLElement;


/* ==========================================
   MODAL
========================================== */

const modal =
    document.querySelector(
        "#request-modal"
    ) as HTMLDivElement;


const modalName =
    document.querySelector(
        "#request-modal-name"
    ) as HTMLElement;


const modalAge =
    document.querySelector(
        "#request-modal-age"
    ) as HTMLElement;


const modalCategory =
    document.querySelector(
        "#request-modal-category"
    ) as HTMLElement;


const modalDate =
    document.querySelector(
        "#request-modal-date"
    ) as HTMLElement;


const modalPhone =
    document.querySelector(
        "#request-modal-phone"
    ) as HTMLAnchorElement;


const modalExperience =
    document.querySelector(
        "#request-modal-experience"
    ) as HTMLElement;


const modalStatus =
    document.querySelector(
        "#request-modal-status"
    ) as HTMLSelectElement;


const closeModalButton =
    document.querySelector(
        "#close-request-modal"
    ) as HTMLButtonElement;


const saveStatusButton =
    document.querySelector(
        "#save-request-status"
    ) as HTMLButtonElement;


const deleteButton =
    document.querySelector(
        "#delete-request"
    ) as HTMLButtonElement;


/* ==========================================
   ESTADO
========================================== */

let requests:
    JoinRequest[] =
    [];


let selectedRequestId:
    string | null =
    null;


/* ==========================================
   CARGAR SOLICITUDES
========================================== */

async function loadRequests(): Promise<void> {

    table.innerHTML = `

        <tr>

            <td
                colspan="7"
                style="
                    text-align:center;
                    padding:2rem;
                "
            >

                Cargando solicitudes...

            </td>

        </tr>

    `;


    try {

        const snapshot =
            await getJoinRequests();


        requests =
            snapshot.docs.map(
                (documentSnapshot) => {

                    const data =
                        documentSnapshot.data();


                    return {

                        id:
                            documentSnapshot.id,

                        name:
                            String(
                                data.name || ""
                            ),

                        age:
                            Number(
                                data.age || 0
                            ),

                        category:
                            String(
                                data.category || ""
                            ),

                        phone:
                            String(
                                data.phone || ""
                            ),

                        experience:
                            String(
                                data.experience || ""
                            ),

                        consent:
                            data.consent === true,

                        status:
                            normalizeStatus(
                                data.status
                            ),

                        source:
                            String(
                                data.source || ""
                            ),

                        createdAt:
                            data.createdAt

                    };

                }
            );


        renderCounters();

        renderRequests();


    } catch (error) {

        console.error(
            "Error cargando solicitudes:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:2rem;
                    "
                >

                    No se pudieron cargar
                    las solicitudes.

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   CONTADORES
========================================== */

function renderCounters(): void {

    totalCount.textContent =
        String(
            requests.length
        );


    newCount.textContent =
        String(

            requests.filter(
                (request) =>
                    request.status ===
                    "new"
            ).length

        );


    contactedCount.textContent =
        String(

            requests.filter(
                (request) =>
                    request.status ===
                    "contacted"
            ).length

        );


    closedCount.textContent =
        String(

            requests.filter(
                (request) =>
                    request.status ===
                    "closed"
            ).length

        );

}


/* ==========================================
   FILTRAR
========================================== */

function getFilteredRequests():
    JoinRequest[] {

    const search =
        normalizeText(
            searchInput.value
        );


    const status =
        statusFilter.value;


    return requests.filter(
        (request) => {

            const matchesStatus =
                !status ||
                request.status ===
                    status;


            if (!matchesStatus) {

                return false;

            }


            if (!search) {

                return true;

            }


            const searchable =
                normalizeText(`

                    ${request.name}

                    ${request.phone}

                    ${request.category}

                    ${request.age}

                `);


            return searchable.includes(
                search
            );

        }
    );

}


/* ==========================================
   RENDER
========================================== */

function renderRequests(): void {

    const filtered =
        getFilteredRequests();


    table.innerHTML =
        "";


    if (
        !filtered.length
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:2.5rem;
                    "
                >

                    No hay solicitudes
                    para mostrar.

                </td>

            </tr>

        `;


        return;

    }


    filtered.forEach(
        (request) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHtml(
                            request.name
                        )}
                    </strong>

                </td>


                <td>

                    ${request.age}

                </td>


                <td>

                    ${escapeHtml(
                        request.category
                    )}

                </td>


                <td>

                    <a
                        href="${escapeAttribute(
                            createWhatsAppUrl(
                                request.phone
                            )
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        ${escapeHtml(
                            request.phone
                        )}

                    </a>

                </td>


                <td>

                    ${escapeHtml(
                        formatDate(
                            request.createdAt
                        )
                    )}

                </td>


                <td>

                    ${createStatusBadge(
                        request.status
                    )}

                </td>


                <td>

                    <button
                        type="button"
                        class="btn-view-request"
                    >
                        Ver
                    </button>

                </td>

            `;


            const viewButton =
                row.querySelector(
                    ".btn-view-request"
                ) as HTMLButtonElement;


            viewButton.addEventListener(
                "click",
                () => {

                    openRequestModal(
                        request
                    );

                }
            );


            table.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   BADGE
========================================== */

function createStatusBadge(
    status: RequestStatus
): string {

    if (
        status ===
        "contacted"
    ) {

        return `

            <span
                style="
                    display:inline-flex;
                    padding:.35rem .7rem;
                    border-radius:999px;
                    background:rgba(24,105,66,.12);
                    color:#186942;
                    font-size:.75rem;
                    font-weight:700;
                "
            >
                Contactado
            </span>

        `;

    }


    if (
        status ===
        "closed"
    ) {

        return `

            <span
                style="
                    display:inline-flex;
                    padding:.35rem .7rem;
                    border-radius:999px;
                    background:rgba(80,80,80,.1);
                    color:#666;
                    font-size:.75rem;
                    font-weight:700;
                "
            >
                Cerrado
            </span>

        `;

    }


    return `

        <span
            style="
                display:inline-flex;
                padding:.35rem .7rem;
                border-radius:999px;
                background:rgba(216,179,75,.18);
                color:#8c6810;
                font-size:.75rem;
                font-weight:700;
            "
        >
            Nueva
        </span>

    `;

}


/* ==========================================
   ABRIR MODAL
========================================== */

function openRequestModal(
    request: JoinRequest
): void {

    if (!request.id) {

        return;

    }


    selectedRequestId =
        request.id;


    modalName.textContent =
        request.name;


    modalAge.textContent =
        String(
            request.age
        );


    modalCategory.textContent =
        request.category;


    modalDate.textContent =
        formatDate(
            request.createdAt
        );


    modalPhone.textContent =
        request.phone;


    modalPhone.href =
        createWhatsAppUrl(
            request.phone
        );


    modalExperience.textContent =
        request.experience ||
        "Sin experiencia especificada.";


    modalStatus.value =
        request.status;


    modal.classList.remove(
        "hidden"
    );

}


/* ==========================================
   CERRAR
========================================== */

function closeRequestModal(): void {

    selectedRequestId =
        null;


    modal.classList.add(
        "hidden"
    );

}


/* ==========================================
   GUARDAR ESTADO
========================================== */

saveStatusButton.addEventListener(
    "click",
    async () => {

        if (
            !selectedRequestId
        ) {

            return;

        }


        const status =
            normalizeStatus(
                modalStatus.value
            );


        try {

            saveStatusButton.disabled =
                true;


            saveStatusButton.textContent =
                "Guardando...";


            await updateRequestStatus(

                selectedRequestId,

                status

            );


            const localRequest =
                requests.find(
                    (request) =>
                        request.id ===
                        selectedRequestId
                );


            if (localRequest) {

                localRequest.status =
                    status;

            }


            closeRequestModal();


            renderCounters();

            renderRequests();


        } catch (error) {

            console.error(
                "Error actualizando solicitud:",
                error
            );


            alert(
                "No se pudo actualizar el estado."
            );


        } finally {

            saveStatusButton.disabled =
                false;


            saveStatusButton.textContent =
                "Guardar estado";

        }

    }
);


/* ==========================================
   ELIMINAR
========================================== */

deleteButton.addEventListener(
    "click",
    async () => {

        if (
            !selectedRequestId
        ) {

            return;

        }


        const selectedRequest =
            requests.find(
                (request) =>
                    request.id ===
                    selectedRequestId
            );


        const confirmed =
            confirm(

                `¿Seguro que deseas eliminar la solicitud de "${selectedRequest?.name || "esta persona"}"?`

            );


        if (!confirmed) {

            return;

        }


        try {

            deleteButton.disabled =
                true;


            deleteButton.textContent =
                "Eliminando...";


            await removeJoinRequest(
                selectedRequestId
            );


            requests =
                requests.filter(
                    (request) =>
                        request.id !==
                        selectedRequestId
                );


            closeRequestModal();


            renderCounters();

            renderRequests();


        } catch (error) {

            console.error(
                "Error eliminando solicitud:",
                error
            );


            alert(
                "No se pudo eliminar la solicitud."
            );


        } finally {

            deleteButton.disabled =
                false;


            deleteButton.textContent =
                "Eliminar";

        }

    }
);


/* ==========================================
   CERRAR MODAL
========================================== */

closeModalButton.addEventListener(
    "click",
    closeRequestModal
);


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            closeRequestModal();

        }

    }
);


/* ==========================================
   FILTROS
========================================== */

searchInput.addEventListener(
    "input",
    renderRequests
);


statusFilter.addEventListener(
    "change",
    renderRequests
);


refreshButton.addEventListener(
    "click",
    loadRequests
);


/* ==========================================
   STATUS
========================================== */

function normalizeStatus(
    value: unknown
): RequestStatus {

    if (
        value ===
        "contacted"
    ) {

        return "contacted";

    }


    if (
        value ===
        "closed"
    ) {

        return "closed";

    }


    return "new";

}


/* ==========================================
   FECHA
========================================== */

function formatDate(
    value: any
): string {

    try {

        if (
            value &&
            typeof value.toDate ===
                "function"
        ) {

            const date =
                value.toDate();


            return date.toLocaleString(
                "es-MX",
                {

                    dateStyle:
                        "medium",

                    timeStyle:
                        "short"

                }
            );

        }


        return "-";


    } catch {

        return "-";

    }

}


/* ==========================================
   WHATSAPP
========================================== */

function createWhatsAppUrl(
    phone: string
): string {

    const cleanPhone =
        String(
            phone || ""
        ).replace(
            /\D/g,
            ""
        );


    if (!cleanPhone) {

        return "#";

    }


    return (
        `https://wa.me/${cleanPhone}`
    );

}


/* ==========================================
   NORMALIZAR TEXTO
========================================== */

function normalizeText(
    value: string
): string {

    return String(value)

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .trim();

}


/* ==========================================
   ESCAPE
========================================== */

function escapeHtml(
    value: string
): string {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    value: string
): string {

    return escapeHtml(
        value
    );

}


/* ==========================================
   START
========================================== */

loadRequests();