require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: process.env.BASE_API,
        credentials: true,
    })
);
app.use(cookieParser()); // Añadimos cookie-parser para manejar cookies

// Rutas API (importante: definir antes de la autenticación para game.html)
app.use("/api/users", userRoutes);

// Proteger la ruta del juego
app.get("/game.html", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/game.html"));
});

// Configurar la carpeta frontend como archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend")));

// Conexión a MongoDB
mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Conexión a MongoDB establecida");
    })
    .catch((err) => {
        console.error("Error al conectar a MongoDB:", err);
        console.error("Detalles de conexión:", {
            mongoUrl: process.env.MONGODB_URL,
            error: err.message,
        });
    });

// Ruta raíz que sirve el index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error("Error no capturado:", err);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
