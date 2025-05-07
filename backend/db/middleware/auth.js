const jwt = require("jsonwebtoken");

// Clave secreta para verificar JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para rutas API
const auth = (req, res, next) => {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No hay token, acceso denegado",
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Token no válido",
        });
    }
};

// Middleware para rutas web - modificado para usar token del query param
const requireAuth = (req, res, next) => {
    // Buscamos el token en query param o headers
    const token = req.query.token || req.headers.authorization?.split(" ")[1] || req.header("x-auth-token");

    // Si no hay token, permitimos el acceso a la página
    // La verificación del lado cliente redirigirá si es necesario
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // Si hay un token pero es inválido, permitimos
        // que el cliente maneje la redirección
        next();
    }
};

module.exports = { auth, requireAuth };
