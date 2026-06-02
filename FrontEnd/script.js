let allWorks = [];

const API = "http://localhost:5678/api";

async function getWorks() {
    const response = await fetch(`${API}/works`);
    if (!response.ok) {
        throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }
    return response.json();
}

async function getCategories() {
    const response = await fetch(`${API}/categories`);
    if (!response.ok) {
        throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }
    return response.json();
}

function displayFilters(categories) {
    const filters = document.querySelector(".filters");
    if (!filters) return;
    filters.innerHTML = "";
    const items = [{ id: "all", name: "Tous" }, ...categories];
    items.forEach((category, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "filter-btn";
        if (index === 0) btn.classList.add("active");
        btn.dataset.id = category.id;
        btn.textContent = category.name;
        filters.appendChild(btn);
    });
}

function populateCategorySelect(categories) {
    const select = document.getElementById("photo-category");
    if (!select) return;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.label = " ";
    select.appendChild(placeholder);
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function getActiveCategoryId() {
    const active = document.querySelector(".filter-btn.active");
    return active ? active.dataset.id : "all";
}

function renderGallery() {
    const id = getActiveCategoryId();
    const works = id === "all" ? allWorks : allWorks.filter(w => w.categoryId === Number(id));
    displayWorks(works);
}

function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    if (!gallery) return;
    gallery.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        const caption = document.createElement("figcaption");
        caption.textContent = work.title;
        figure.append(img, caption);
        gallery.appendChild(figure);
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelector(".filter-btn.active")?.classList.remove("active");
            e.currentTarget.classList.add("active");
            renderGallery();
        });
    });
}

function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (!token) return;
    document.getElementById("edit-bar").style.display = "flex";
    document.getElementById("edit-btn").style.display = "inline-block";
    document.querySelector(".filters").style.display = "none";
    const loginLink = document.getElementById("nav-login");
    loginLink.textContent = "logout";
    loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
    });
}

function displayModalGallery(works) {
    const modalGallery = document.querySelector(".modal-gallery");
    if (!modalGallery) return;
    modalGallery.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.classList.add("modal-figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        const btn = document.createElement("button");
        btn.className = "btn-delete";
        btn.setAttribute("aria-label", "Supprimer ce projet");
        btn.innerHTML = "&#128465;";
        btn.addEventListener("click", () => deleteWork(work.id));
        figure.append(img, btn);
        modalGallery.appendChild(figure);
    });
}

async function deleteWork(id) {
    if (!confirm("Supprimer ce projet ?")) return;
    try {
        const response = await fetch(`${API}/works/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (!response.ok) {
            alert("La suppression a échoué. Veuillez réessayer.");
            return;
        }
        allWorks = allWorks.filter(w => w.id !== id);
        renderGallery();
        displayModalGallery(allWorks);
    } catch (e) {
        alert("Erreur réseau lors de la suppression.");
    }
}

function showGalleryView() {
    document.getElementById("modal-gallery-view").style.display = "block";
    document.getElementById("modal-add-photo-view").style.display = "none";
    document.querySelector(".modal-back").style.display = "none";
}

function showAddPhotoView() {
    document.getElementById("modal-gallery-view").style.display = "none";
    document.getElementById("modal-add-photo-view").style.display = "block";
    document.querySelector(".modal-back").style.display = "block";
}

function openModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    showGalleryView();
    displayModalGallery(allWorks);
    document.querySelector(".modal-close").focus();
}

function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    resetForm();
    showGalleryView();
    const editBtn = document.getElementById("edit-btn");
    if (editBtn) editBtn.focus();
}

function setupModalNavigation() {
    const modal = document.getElementById("modal");
    const btnAddPhoto = document.querySelector(".btn-add-photo");
    const btnBack = document.querySelector(".modal-back");
    const closeBtn = document.querySelector(".modal-close");

    btnAddPhoto.addEventListener("click", showAddPhotoView);

    btnBack.addEventListener("click", () => {
        showGalleryView();
        resetForm();
    });

    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") closeModal();
    });
}

function resetForm() {
    document.getElementById("form-add-photo").reset();
    document.getElementById("image-preview").style.display = "none";
    document.getElementById("image-preview-container").style.display = "flex";
    document.getElementById("form-error-message").style.display = "none";
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

    const errorMessage = document.getElementById("form-error-message");

    const checkFormValidity = () => {
        const isFilled = fileInput.files[0] && document.getElementById("photo-title").value && document.getElementById("photo-category").value;
        validateBtn.disabled = !isFilled;
        isFilled ? validateBtn.classList.add("active") : validateBtn.classList.remove("active");
        errorMessage.style.display = isFilled ? "none" : "block";
    };

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

    form.addEventListener("input", checkFormValidity);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("title", document.getElementById("photo-title").value);
        formData.append("category", document.getElementById("photo-category").value);

        try {
            const response = await fetch(`${API}/works`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
                body: formData
            });

            if (!response.ok) {
                alert("L'ajout a échoué. Veuillez réessayer.");
                return;
            }

            const newWork = await response.json();
            newWork.categoryId = Number(newWork.categoryId);
            allWorks.push(newWork);
            renderGallery();
            displayModalGallery(allWorks);
            closeModal();
        } catch (err) {
            alert("Erreur réseau lors de l'ajout.");
        }
    });
}

async function init() {
    try {
        const [works, categories] = await Promise.all([getWorks(), getCategories()]);
        allWorks = works;
        displayFilters(categories);
        populateCategorySelect(categories);
        displayWorks(allWorks);
        setupFilters();
        checkAuthentication();
        setupModalNavigation();
        setupAddPhotoLogic();
        document.getElementById("edit-btn").addEventListener("click", openModal);
    } catch (error) {
        console.error(error);
    }
}

init();
