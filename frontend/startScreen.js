
document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const startScreen = document.getElementById("start-screen");
    const newGameBtn = document.getElementById("new-game-btn");
    const continueBtn = document.getElementById("continue-btn");
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const backFromRegister = document.getElementById("back-from-register");
    const backFromLogin = document.getElementById("back-from-login");
    const signupForm = document.getElementById("signup-form");
    const signinForm = document.getElementById("signin-form");
    const registerMessage = document.getElementById("register-message");
    const loginMessage = document.getElementById("login-message");
    const menuOptions = document.querySelector(".menu-options");

    // Comprobar si hay un token guardado
    const token = localStorage.getItem("soulsAdventure_token");
    if (token) {
        // Verificar si el token es válido
        verifyToken(token);
    }

    // Event Listeners
    newGameBtn.addEventListener("click", () => {
        showRegisterForm();
    });

    continueBtn.addEventListener("click", () => {
        showLoginForm();
    });

    backFromRegister.addEventListener("click", (e) => {
        e.preventDefault();
        showMainMenu();
    });

    backFromLogin.addEventListener("click", (e) => {
        e.preventDefault();
        showMainMenu();
    });

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        registerUser();
    });

    signinForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar el token en localStorage
                localStorage.setItem("authToken", data.token);
                // Redirigir a game.html
                window.location.href = "/game.html";
            } else {
                document.getElementById("login-message").textContent = data.message || "Error en el inicio de sesión";
            }
        } catch (error) {
            document.getElementById("login-message").textContent = "Error en la conexión al servidor";
        }
    });

    // Funciones mejoradas para mostrar/ocultar elementos
    function showRegisterForm() {
        // Asegurar que otros elementos estén ocultos
        hideAllForms();

        // Mostrar el formulario de registro
        registerForm.classList.remove("hidden");
        menuOptions.classList.add("hidden");
    }

    function showLoginForm() {
        // Asegurar que otros elementos estén ocultos
        hideAllForms();

        // Mostrar el formulario de login
        loginForm.classList.remove("hidden");
        menuOptions.classList.add("hidden");
    }

    function showMainMenu() {
        // Ocultar todos los formularios
        hideAllForms();

        // Mostrar los botones del menú principal
        menuOptions.classList.remove("hidden");
    }

    function hideAllForms() {
        // Ocultar todos los formularios y mensajes
        registerForm.classList.add("hidden");
        loginForm.classList.add("hidden");

        // Limpiar mensajes
        registerMessage.textContent = "";
        registerMessage.classList.remove("error", "success");

        loginMessage.textContent = "";
        loginMessage.classList.remove("error", "success");

        // Resetear formularios
        signupForm.reset();
        signinForm.reset();
    }

    async function registerUser() {
        const username = document.getElementById("reg-username").value;
        const password = document.getElementById("reg-password").value;
        const playerName = document.getElementById("player-name").value;

        // Validación básica
        if (!username || !password || !playerName) {
            registerMessage.textContent = "Por favor, completa todos los campos";
            registerMessage.classList.add("error");
            return;
        }

        try {
            // Eliminar la referencia a API_BASE_URL, usamos ruta relativa
            const response = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                    playerName,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar el token en localStorage
                localStorage.setItem("authToken", data.token);

                // Guardar datos básicos del usuario
                localStorage.setItem(
                    "soulsAdventure_user",
                    JSON.stringify({
                        id: data.user.id,
                        username: data.user.username,
                        playerName: data.user.playerName,
                    })
                );

                // Mensaje de éxito
                registerMessage.textContent = "¡Registro exitoso! Iniciando juego...";
                registerMessage.classList.remove("error");
                registerMessage.classList.add("success");

                // Redireccionar al juego después de un breve delay
                setTimeout(() => {
                    window.location.href = "/game.html";
                }, 1500);
            } else {
                registerMessage.textContent = data.message || "Error en el registro";
                registerMessage.classList.add("error");
            }
        } catch (error) {
            console.error("Error al registrar:", error);
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
                // El token es válido, actualizar datos del usuario
                localStorage.setItem(
                    "soulsAdventure_user",
                    JSON.stringify({
                        id: data.user.id,
                        username: data.user.username,
                        playerName: data.user.playerName,
                    })
                );

                // Actualizar datos del jugador si existen
                if (data.user.playerData) {
                    localStorage.setItem("soulsAdventure_playerData", JSON.stringify(data.user.playerData));
                }

                // Habilitar el botón de continuar
                continueBtn.disabled = false;
            } else {
                // Token inválido, eliminar
                localStorage.removeItem("soulsAdventure_token");
                localStorage.removeItem("soulsAdventure_user");
                localStorage.removeItem("soulsAdventure_playerData");
            }
        } catch (error) {
            console.error("Error al verificar token:", error);
            // Limpiar datos en caso de error
            localStorage.removeItem("soulsAdventure_token");
            localStorage.removeItem("soulsAdventure_user");
            localStorage.removeItem("soulsAdventure_playerData");
        }
    }

    // Función para guardar datos del jugador
    window.savePlayerData = async function (playerData) {
        const token = localStorage.getItem("soulsAdventure_token");
        if (!token) {
            console.error("No hay token de autenticación");
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
                // También guardar en localStorage para acceso rápido
                localStorage.setItem("soulsAdventure_playerData", JSON.stringify(playerData));
                return true;
            } else {
                console.error("Error al guardar datos:", data.message);
                return false;
            }
        } catch (error) {
            console.error("Error de conexión al guardar datos:", error);
            return false;
        }
    };
});
