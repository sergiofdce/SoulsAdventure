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
    if (token) {
        verifyToken(token);
    }

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
                localStorage.setItem(
                    "soulsAdventure_user",
                    JSON.stringify({
                        id: data.user.id,
                        username: data.user.username,
                    })
                );

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

    async function verifyToken(token) {
        try {
            const response = await fetch(`/api/users/verify`, {
                method: "GET",
                headers: {
                    "x-auth-token": token,
                },
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem(
                    "soulsAdventure_user",
                    JSON.stringify({
                        id: data.user.id,
                        username: data.user.username,
                    })
                );

                if (data.user.playerData) {
                    localStorage.setItem("soulsAdventure_playerData", JSON.stringify(data.user.playerData));
                }
            } else {
                localStorage.removeItem("authToken");
                localStorage.removeItem("soulsAdventure_user");
                localStorage.removeItem("soulsAdventure_playerData");
            }
        } catch (error) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("soulsAdventure_user");
            localStorage.removeItem("soulsAdventure_playerData");
        }
    }

    // Función para guardar datos del jugador
    window.savePlayerData = async function (playerData) {
        const token = localStorage.getItem("authToken");
        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`/api/users/save-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
                body: JSON.stringify({ playerData }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("soulsAdventure_playerData", JSON.stringify(playerData));
                return true;
            } else {
                console.error("Error al guardar datos:", data.message);
                return false;
            }
        } catch (error) {
            console.error("Error de conexión al guardar datos");
            return false;
        }
    };

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
