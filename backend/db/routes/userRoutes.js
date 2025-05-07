const express = require("express");
const userController = require("../controllers/userController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Rutas públicas
router.post("/register", userController.register);

// Rutas protegidas
router.post("/save-data", auth, userController.savePlayerData);
router.get("/get-data", auth, userController.getPlayerData);

// Ruta para validar token
router.get("/validate-token", auth, userController.validateToken);


module.exports = router;
