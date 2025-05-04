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
    window.location.href = "/index.html";
}

// Función para añadir el token a las solicitudes API
function getAuthHeader() {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Verificar autenticación al cargar game.html
document.addEventListener("DOMContentLoaded", function () {
    // Si estamos en game.html pero no hay token de autenticación
    if (window.location.pathname.includes("/game.html") && !isAuthenticated()) {
        // Redirigir al inicio de sesión
        window.location.href = "/index.html";
    }
});
