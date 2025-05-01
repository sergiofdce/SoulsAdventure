// server.js
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Rutas
app.use(express.static(path.join(__dirname, "../frontend")));

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor inciado en: http://localhost:${PORT}`);
});
