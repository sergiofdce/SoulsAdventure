const jwt = require("jsonwebtoken");

// Clave secreta para verificar JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware básico para rutas API (devuelve error JSON)
const auth = (req, res, next) => {
    // Obtener el token del header
    const token = req.header("x-auth-token");

    // Verificar si no hay token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No hay token, acceso denegado",
        });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Añadir usuario a la solicitud
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error de autenticación:", error);
        res.status(401).json({
            success: false,
            message: "Token no válido",
        });
    }
};

// Middleware para rutas web (redirecciona al login)
const requireAuth = (req, res, next) => {
    // Obtener el token de las cookies o del encabezado de autorización
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    // Si no hay token, redirigir al inicio de sesión
    if (!token) {
        return res.redirect("/index.html");
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // Si el token no es válido, redirigir al inicio de sesión
        return res.redirect("/index.html");
    }
};

module.exports = { auth, requireAuth };
