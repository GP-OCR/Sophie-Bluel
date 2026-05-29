const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.style.display = "none";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error("Authentification échouée");
        }

        const data = await response.json();

        // Stockage du token et de l'état connecté
        localStorage.setItem("token", data.token);
        
        // Redirection vers la page d'accueil
        window.location.href = "index.html";

    } catch (error) {
        errorMessage.style.display = "block";
    }
});