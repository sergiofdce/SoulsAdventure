document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const newGameBtn = document.getElementById("new-game-btn");
    const howToPlayBtn = document.getElementById("how-to-play-btn");
    const registerForm = document.getElementById("register-form");
    const howToPlaySection = document.getElementById("how-to-play");
    const backFromRegister = document.getElementById("back-from-register");
    const backFromHowTo = document.getElementById("back-from-howto");
    const signupForm = document.getElementById("signup-form");
    const registerMessage = document.getElementById("register-message");
    const menuOptions = document.querySelector(".menu-options");

    // Comprobar si hay un token guardado
    const token = localStorage.getItem("authToken");


    async function registerUser() {
        const username = document.getElementById("player-name").value;

        if (!username) {
            registerMessage.textContent = "Por favor, ingresa un nombre para tu personaje";
            registerMessage.classList.add("error");
            return;
        }

        try {
            const response = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("authToken", data.token);


                registerMessage.textContent = "¡Personaje creado con éxito! Iniciando juego...";
                registerMessage.classList.remove("error");
                registerMessage.classList.add("success");

                // Redirección con un pequeño delay y usando el token como parámetro
                setTimeout(() => {
                    window.location.href = `/game.html?token=${data.token}`;
                }, 1500);
            } else {
                registerMessage.textContent = data.message || "Error al crear el personaje";
                registerMessage.classList.add("error");
            }
        } catch (error) {
            registerMessage.textContent = "Error de conexión";
            registerMessage.classList.add("error");
        }
    }


    // Event Listeners
    newGameBtn.addEventListener("click", () => {
        showRegisterForm();
    });

    howToPlayBtn.addEventListener("click", () => {
        showHowToPlay();
    });

    backFromRegister.addEventListener("click", (e) => {
        e.preventDefault();
        showMainMenu();
    });

    backFromHowTo.addEventListener("click", (e) => {
        e.preventDefault();
        showMainMenu();
    });

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        registerUser();
    });

    // Funciones para mostrar/ocultar elementos
    function showRegisterForm() {
        hideAllForms();
        registerForm.classList.remove("hidden");
        menuOptions.classList.add("hidden");
    }

    function showHowToPlay() {
        hideAllForms();
        howToPlaySection.classList.remove("hidden");
        menuOptions.classList.add("hidden");
    }

    function showMainMenu() {
        hideAllForms();
        menuOptions.classList.remove("hidden");
    }

    function hideAllForms() {
        registerForm.classList.add("hidden");
        howToPlaySection.classList.add("hidden");

        registerMessage.textContent = "";
        registerMessage.classList.remove("error", "success");

        signupForm.reset();
    }
});
