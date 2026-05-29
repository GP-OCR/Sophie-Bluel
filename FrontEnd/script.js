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

async function init() {
    try {
        allWorks = await getWorks();
        displayWorks(allWorks);
        setupFilters();
        checkAuthentication();
    } catch (error) {
        console.error(error);
    }
}

init();