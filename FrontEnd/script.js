let allWorks = [];

async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
        throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }
    return response.json();
}

function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    if (!gallery) return;
    gallery.innerHTML = "";

    for (const work of works) {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const figcaption = document.createElement("figcaption");

        img.src = work.imageUrl;
        img.alt = work.title;
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    }
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(button => {
        button.addEventListener("click", (e) => {
            document.querySelector(".filter-btn.active")?.classList.remove("active");
            e.target.classList.add("active");

            const categoryId = e.target.dataset.id;

            if (categoryId === "all") {
                displayWorks(allWorks);
            } else {
                const filteredWorks = allWorks.filter(work => work.categoryId === Number(categoryId));
                displayWorks(filteredWorks);
            }
        });
    });
}

function checkAuthentication() {
    const token = localStorage.getItem("token");
    const editBar = document.getElementById("edit-bar");
    const editBtn = document.getElementById("edit-btn");
    const filtersZone = document.querySelector(".filters");
    const navLogin = document.getElementById("nav-login");

    if (token) {
        if (editBar) editBar.style.display = "flex";
        if (editBtn) editBtn.style.display = "inline-block";
        if (filtersZone) filtersZone.style.display = "none";
        
        if (navLogin) {
            navLogin.textContent = "logout";
            navLogin.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                window.location.reload();
            });
        }
    }
}

function displayModalGallery(works) {
    const modalGallery = document.querySelector(".modal-gallery");
    if (!modalGallery) return;
    modalGallery.innerHTML = "";

    for (const work of works) {
        const figure = document.createElement("figure");
        figure.classList.add("modal-figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn-delete");
        deleteBtn.setAttribute("aria-label", `Supprimer le projet ${work.title}`);
        deleteBtn.innerHTML = `
            <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.51601 0.866667H4.32268H6.12935V1.73333H2.51601V0.866667ZM0.709351 2.6H8.29602V3.46667H7.56834L7.15177 9.87823C7.1121 10.4901 6.6021 10.9667 5.98822 10.9667H3.01715C2.40327 10.9667 1.89327 10.4901 1.8536 9.87823L1.43703 3.46667H0.709351V2.6ZM2.30491 3.46667L2.71618 9.80064C2.7233 9.91107 2.81534 9.96667 2.92618 9.96667H5.89725C6.00809 9.96667 6.10013 9.91107 6.10725 9.80064L6.51852 3.46667H2.30491Z" fill="white"/>
            </svg>
        `;

        deleteBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (confirm(`Voulez-vous vraiment supprimer le projet "${work.title}" ?`)) {
                await deleteWork(work.id);
            }
        });

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGallery.appendChild(figure);
    }
}

async function deleteWork(id) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            allWorks = allWorks.filter(work => work.id !== id);
            displayWorks(allWorks);
            displayModalGallery(allWorks);
        } else {
            alert("Erreur lors de la suppression du projet.");
        }
    } catch (error) {
        console.error(error);
    }
}

function setupModalEvents() {
    const modal = document.getElementById("modal");
    const editBtn = document.getElementById("edit-btn");
    const closeBtn = document.querySelector(".modal-close");

    if (!modal || !editBtn) return;

    editBtn.addEventListener("click", () => {
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        displayModalGallery(allWorks);
    });

    closeBtn?.addEventListener("click", () => {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
        }
    });
}

async function init() {
    try {
        allWorks = await getWorks();
        displayWorks(allWorks);
        setupFilters();
        checkAuthentication();
        setupModalEvents();
    } catch (error) {
        console.error(error);
    }
}

init();