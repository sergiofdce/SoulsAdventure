// Función para almacenar el token tras un inicio de sesión exitoso
function saveAuthToken(token) {
    localStorage.setItem("authToken", token);
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return localStorage.getItem("authToken") !== null;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("soulsAdventure_user");
    localStorage.removeItem("soulsAdventure_playerData");
    window.location.href = "/index.html";
}

// Función para añadir el token a las solicitudes API
function getAuthHeader() {
    const token = localStorage.getItem("authToken");
    return token ? { "x-auth-token": token } : {};
}

// Verificar autenticación al cargar game.html y capturar token de URL si existe
document.addEventListener("DOMContentLoaded", function () {
    // Capturar token de la URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
        // Guardar token de la URL en localStorage
        localStorage.setItem("authToken", tokenFromUrl);
        // Limpiar parámetro de la URL
        window.history.replaceState({}, document.title, "/game.html");
    }
    
    // Si estamos en game.html pero no hay token de autenticación
    if (window.location.pathname.includes("/game.html") && !isAuthenticated()) {
        // Redirigir al inicio de sesión
        window.location.href = "/index.html";
    }
});
