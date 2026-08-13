import { createNews, editNews, getNews, removeNews, togglePublished } from "./news.service";

const modal = document.querySelector("#news-modal") as HTMLDivElement;

const form = document.querySelector("#news-form") as HTMLFormElement;

const newsTable = document.querySelector("#news-table") as HTMLTableSectionElement;

const searchInput = document.querySelector("#search-news") as HTMLInputElement;

const newButton = document.querySelector("#new-news-btn") as HTMLButtonElement;

const cancelButton = document.querySelector("#cancel-news") as HTMLButtonElement;

const title = document.querySelector("#title") as HTMLInputElement;

const description = document.querySelector("#description") as HTMLTextAreaElement;

const category = document.querySelector("#category") as HTMLSelectElement;

const published = document.querySelector("#published") as HTMLInputElement;

const saveButton = form.querySelector("button[type='submit']") as HTMLButtonElement;

let editingId: string | null = null;

newButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    saveButton.textContent = "Guardar noticia";

    modal.classList.remove("hidden");

});

cancelButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    saveButton.textContent = "Guardar noticia";

    modal.classList.add("hidden");

});

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    try {

        if (editingId) {

            await editNews(editingId, {

                title: title.value,

                description: description.value,

                category: category.value,

                published: published.checked

            });

            alert("Noticia actualizada correctamente.");

        } else {

            await createNews({

                title: title.value,

                description: description.value,

                category: category.value,

                published: published.checked

            });

            alert("Noticia creada correctamente.");

        }

        editingId = null;

        form.reset();

        modal.classList.add("hidden");

        saveButton.textContent = "Guardar noticia";

        await loadNews();

    } catch (error) {

        console.error(error);

        alert("Ocurrió un error.");

    }

});

async function deleteNews(id: string) {

    const confirmed = confirm("¿Eliminar esta noticia?");

    if (!confirmed) return;

    await removeNews(id);

    await loadNews();

}

async function loadNews(search = "") {

    newsTable.innerHTML = "";

    const snapshot = await getNews();

    snapshot.forEach((item) => {

        const news = item.data();

        if (
            !news.title
                .toLowerCase()
                .includes(search.toLowerCase())
        ) {
            return;
        }

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${news.title}</td>

            <td>${news.category}</td>

            <td>

                <input
                    type="checkbox"
                    class="publish-toggle"
                    ${news.published ? "checked" : ""}>

            </td>

            <td>

                <button class="btn-edit">
                    ✏️
                </button>

                <button class="btn-delete">
                    🗑️
                </button>

            </td>
        `;

        const editButton = row.querySelector(".btn-edit") as HTMLButtonElement;

        const deleteButton = row.querySelector(".btn-delete") as HTMLButtonElement;

        const toggle = row.querySelector(".publish-toggle") as HTMLInputElement;

        editButton.addEventListener("click", () => {

            editingId = item.id;

            title.value = news.title;

            description.value = news.description;

            category.value = news.category;

            published.checked = news.published;

            saveButton.textContent = "Actualizar noticia";

            modal.classList.remove("hidden");

        });

        deleteButton.addEventListener("click", () => {

            deleteNews(item.id);

        });

        toggle.addEventListener("change", async () => {

            await togglePublished(
                item.id,
                toggle.checked
            );

        });

        newsTable.appendChild(row);

    });

}

searchInput.addEventListener("input", () => {

    loadNews(searchInput.value);

});

loadNews();