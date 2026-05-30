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
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.innerHTML = `<img src="${work.imageUrl}" alt="${work.title}"><figcaption>${work.title}</figcaption>`;
        gallery.appendChild(figure);
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelector(".filter-btn.active")?.classList.remove("active");
            e.target.classList.add("active");
            const filtered = e.target.dataset.id === "all" ? allWorks : allWorks.filter(w => w.categoryId === Number(e.target.dataset.id));
            displayWorks(filtered);
        });
    });
}

function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (token) {
        document.getElementById("edit-bar").style.display = "flex";
        document.getElementById("edit-btn").style.display = "inline-block";
        document.querySelector(".filters").style.display = "none";
        const loginLink = document.getElementById("nav-login");
        loginLink.textContent = "logout";
        loginLink.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.reload();
        });
    }
}

function displayModalGallery(works) {
    const modalGallery = document.querySelector(".modal-gallery");
    if (!modalGallery) return;
    modalGallery.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.classList.add("modal-figure");
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <button class="btn-delete" onclick="deleteWork(${work.id})">🗑</button>
        `;
        modalGallery.appendChild(figure);
    });
}

async function deleteWork(id) {
    if (!confirm("Supprimer ce projet ?")) return;
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (response.ok) {
        allWorks = allWorks.filter(w => w.id !== id);
        displayWorks(allWorks);
        displayModalGallery(allWorks);
    }
}

function setupModalNavigation() {
    const modal = document.getElementById("modal");
    const galleryView = document.getElementById("modal-gallery-view");
    const addPhotoView = document.getElementById("modal-add-photo-view");
    const btnAddPhoto = document.querySelector(".btn-add-photo");
    const btnBack = document.querySelector(".modal-back");
    const closeBtn = document.querySelector(".modal-close");

    btnAddPhoto.addEventListener("click", () => {
        galleryView.style.display = "none";
        addPhotoView.style.display = "block";
        btnBack.style.display = "block";
    });

    btnBack.addEventListener("click", () => {
        addPhotoView.style.display = "none";
        galleryView.style.display = "block";
        btnBack.style.display = "none";
        resetForm();
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        resetForm();
    });
}

function resetForm() {
    document.getElementById("form-add-photo").reset();
    document.getElementById("image-preview").style.display = "none";
    document.getElementById("image-preview-container").style.display = "flex";
    const validateBtn = document.getElementById("btn-validate");
    validateBtn.disabled = true;
    validateBtn.classList.remove("active");
}

function setupAddPhotoLogic() {
    const fileInput = document.getElementById("file-upload");
    const preview = document.getElementById("image-preview");
    const previewContainer = document.getElementById("image-preview-container");
    const form = document.getElementById("form-add-photo");
    const validateBtn = document.getElementById("btn-validate");

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = "block";
                previewContainer.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
        checkFormValidity();
    });

    const checkFormValidity = () => {
        const isFilled = fileInput.files[0] && document.getElementById("photo-title").value && document.getElementById("photo-category").value;
        validateBtn.disabled = !isFilled;
        isFilled ? validateBtn.classList.add("active") : validateBtn.classList.remove("active");
    };

    form.addEventListener("input", checkFormValidity);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("title", document.getElementById("photo-title").value);
        formData.append("category", document.getElementById("photo-category").value);

        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
            body: formData
        });

        if (response.ok) {
            const newWork = await response.json();
            allWorks.push(newWork);
            displayWorks(allWorks);
            document.getElementById("modal").style.display = "none";
            resetForm();
        }
    });
}

async function init() {
    try {
        allWorks = await getWorks();
        displayWorks(allWorks);
        setupFilters();
        checkAuthentication();
        setupModalNavigation();
        setupAddPhotoLogic();
        document.getElementById("edit-btn").addEventListener("click", () => {
            document.getElementById("modal").style.display = "flex";
            displayModalGallery(allWorks);
        });
    } catch (error) {
        console.error(error);
    }
}

init();