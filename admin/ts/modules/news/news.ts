import type { News } from "./news.types";
import { db } from "../../firebase";
import { getNews, removeNews, editNews, togglePublished } from "./news.service";

import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc
} from "firebase/firestore";

const modal = document.querySelector("#news-modal") as HTMLDivElement;

const newButton = document.querySelector("#new-news-btn") as HTMLButtonElement;

const cancelButton = document.querySelector("#cancel-news") as HTMLButtonElement;

let editingId: string | null = null;

newButton.addEventListener("click",()=>{

    modal.classList.remove("hidden");

});

cancelButton.addEventListener("click",()=>{

    modal.classList.add("hidden");

});

const form = document.querySelector("#news-form") as HTMLFormElement;

const title = document.querySelector("#title") as HTMLInputElement;

const description = document.querySelector("#description") as HTMLTextAreaElement;

const category = document.querySelector("#category") as HTMLSelectElement;

const published = document.querySelector("#published") as HTMLInputElement;

const newsTable =
document.querySelector("#news-table") as HTMLTableSectionElement;

const searchInput =
document.querySelector("#search-news")
as HTMLInputElement;

async function deleteNews(id: string) {

    const confirmed = confirm(
        "¿Seguro que deseas eliminar esta noticia?"
    );

    if (!confirmed) return;

    try {

        await removeNews(id);

await loadNews();

alert("Noticia eliminada correctamente.");

    } catch (error) {

        console.error(error);

        alert("No se pudo eliminar la noticia.");

    }

}

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
        
        } else {
        
            await addDoc(collection(db, "news"), {
        
                title: title.value,
        
                description: description.value,
        
                category: category.value,
        
                published: published.checked,
        
                createdAt: serverTimestamp()
        
            });
        
        }

        alert("Noticia guardada correctamente.");

        form.reset();

        modal.classList.add("hidden");
        await loadNews();

    } catch (error: any) {

        console.error("Firestore:", error);
    
        alert(`Error: ${error.message}`);
    
    }
});

async function loadNews(search = "") {

    newsTable.innerHTML = "";

    const newsQuery = query(

        collection(db,"news"),

        orderBy("createdAt","desc")

    );

    const snapshot = await getNews();

    snapshot.forEach((doc)=>{

        const news = doc.data();

        const row = document.createElement("tr");

        row.innerHTML = `
<tr>
    <td>${news.title}</td>
    <td>${news.category}</td>
    <td>

<input
type="checkbox"
class="publish-toggle"
data-id="${doc.id}"
${news.published ? "checked" : ""}>

</td>
    <td>
        <button class="btn-edit" data-id="${doc.id}">
            ✏️
        </button>

        <button class="btn-delete" data-id="${doc.id}">
            🗑️
        </button>
    </td>
</tr>
`; 

if(

    !news.title
    .toLowerCase()
    .includes(search.toLowerCase())
    
    ){
    
    return;
    
    }

    newsTable.appendChild(row);

    const editButton =
row.querySelector(".btn-edit") as HTMLButtonElement;

editButton.addEventListener("click", () => {

    editingId = doc.id;

    title.value = news.title;

    description.value = news.description;

    category.value = news.category;

    published.checked = news.published;

    modal.classList.remove("hidden");

});

    const deleteButton =
        row.querySelector(".btn-delete") as HTMLButtonElement;

    deleteButton.addEventListener("click", () => {

        deleteNews(doc.id);

    });

    const toggle =
row.querySelector(".publish-toggle") as HTMLInputElement;

toggle.addEventListener("change", async () => {

    await togglePublished(
        doc.id,
        toggle.checked
    );

});

});

searchInput.addEventListener("input", () => {

    loadNews(searchInput.value);

});

loadNews(); 
