import {
    createUserRecord,
    editUser,
    getUsers,
    removeUser,
    toggleUserActive
} from "./users.service";

import type { UserRole } from "./users.types";


/* ==========================================
   ELEMENTOS
========================================== */

const modal =
    document.querySelector("#user-modal") as HTMLDivElement;

const modalTitle =
    document.querySelector("#user-modal-title") as HTMLHeadingElement;

const form =
    document.querySelector("#user-form") as HTMLFormElement;

const usersTable =
    document.querySelector("#users-table") as HTMLTableSectionElement;

const searchInput =
    document.querySelector("#search-user") as HTMLInputElement;

const newButton =
    document.querySelector("#new-user-btn") as HTMLButtonElement;

const cancelButton =
    document.querySelector("#cancel-user") as HTMLButtonElement;

const nameInput =
    document.querySelector("#name") as HTMLInputElement;

const emailInput =
    document.querySelector("#email") as HTMLInputElement;

const roleInput =
    document.querySelector("#role") as HTMLSelectElement;

const activeInput =
    document.querySelector("#active") as HTMLInputElement;

const saveButton =
    form.querySelector(
        "button[type='submit']"
    ) as HTMLButtonElement;


let editingId: string | null = null;


/* ==========================================
   NUEVO USUARIO
========================================== */

newButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    activeInput.checked = true;

    modalTitle.textContent =
        "Nuevo usuario";

    saveButton.textContent =
        "Guardar usuario";

    modal.classList.remove("hidden");

});


/* ==========================================
   CANCELAR
========================================== */

cancelButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    activeInput.checked = true;

    modal.classList.add("hidden");

});


/* ==========================================
   GUARDAR / EDITAR
========================================== */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            const userData = {

                name: nameInput.value.trim(),

                email: emailInput.value.trim(),

                role:
                    roleInput.value as UserRole,

                active:
                    activeInput.checked

            };


            if (editingId) {

                await editUser(
                    editingId,
                    userData
                );

                alert(
                    "Usuario actualizado correctamente."
                );

            } else {

                await createUserRecord(
                    userData
                );

                alert(
                    "Usuario agregado correctamente."
                );

            }


            editingId = null;

            form.reset();

            activeInput.checked = true;

            modal.classList.add("hidden");

            modalTitle.textContent =
                "Nuevo usuario";

            saveButton.textContent =
                "Guardar usuario";

            await loadUsers();

        } catch (error) {

            console.error(error);

            alert(
                "Ocurrió un error al guardar el usuario."
            );

        }

    }
);


/* ==========================================
   ELIMINAR
========================================== */

async function deleteUser(
    id: string
) {

    const confirmed = confirm(
        "¿Seguro que deseas eliminar este usuario?"
    );

    if (!confirmed) return;


    try {

        await removeUser(id);

        await loadUsers();

        alert(
            "Usuario eliminado correctamente."
        );

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo eliminar el usuario."
        );

    }

}


/* ==========================================
   CARGAR USUARIOS
========================================== */

async function loadUsers(
    search = ""
) {

    usersTable.innerHTML = "";


    try {

        const snapshot =
            await getUsers();


        snapshot.forEach((item) => {

            const user =
                item.data();


            const searchText = `
                ${user.name}
                ${user.email}
                ${user.role}
            `.toLowerCase();


            if (
                !searchText.includes(
                    search.toLowerCase()
                )
            ) {

                return;

            }


            const row =
                document.createElement("tr");


            const roleName =
                user.role === "admin"
                    ? "Administrador"
                    : user.role === "editor"
                        ? "Editor"
                        : "Visualizador";


            row.innerHTML = `

                <td>
                    ${user.name}
                </td>

                <td>
                    ${user.email}
                </td>

                <td>
                    ${roleName}
                </td>

                <td>

                    <input
                        type="checkbox"
                        class="active-toggle"
                        ${user.active ? "checked" : ""}>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        type="button">

                        ✏️

                    </button>

                    <button
                        class="btn-delete"
                        type="button">

                        🗑️

                    </button>

                </td>

            `;


            /* ==========================================
               EDITAR
            =========================================== */

            const editButton =
                row.querySelector(
                    ".btn-edit"
                ) as HTMLButtonElement;


            editButton.addEventListener(
                "click",
                () => {

                    editingId = item.id;

                    nameInput.value =
                        user.name;

                    emailInput.value =
                        user.email;

                    roleInput.value =
                        user.role;

                    activeInput.checked =
                        user.active;

                    modalTitle.textContent =
                        "Editar usuario";

                    saveButton.textContent =
                        "Actualizar usuario";

                    modal.classList.remove(
                        "hidden"
                    );

                }
            );


            /* ==========================================
               ELIMINAR
            =========================================== */

            const deleteButton =
                row.querySelector(
                    ".btn-delete"
                ) as HTMLButtonElement;


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteUser(
                        item.id
                    );

                }
            );


            /* ==========================================
               ACTIVAR / DESACTIVAR
            =========================================== */

            const activeToggle =
                row.querySelector(
                    ".active-toggle"
                ) as HTMLInputElement;


            activeToggle.addEventListener(
                "change",
                async () => {

                    try {

                        await toggleUserActive(
                            item.id,
                            activeToggle.checked
                        );

                    } catch (error) {

                        console.error(error);

                        alert(
                            "No se pudo cambiar el estado."
                        );

                        activeToggle.checked =
                            !activeToggle.checked;

                    }

                }
            );


            usersTable.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        alert(
            "No se pudieron cargar los usuarios."
        );

    }

}


/* ==========================================
   BUSCADOR
========================================== */

searchInput.addEventListener(
    "input",
    () => {

        loadUsers(
            searchInput.value
        );

    }
);


/* ==========================================
   INICIAR
========================================== */

loadUsers();