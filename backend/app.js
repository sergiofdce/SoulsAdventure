// app.js
const express = require("express");
const path = require("path");
const app = express();

// Rutas
app.use(express.static(path.join(__dirname, "../frontend")));

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

module.exports = app;
