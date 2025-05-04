const express = require("express");
const userController = require("../controllers/userController");
const { auth } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Rutas públicas
router.post("/register", userController.register);
router.post("/login", userController.login);

// Rutas protegidas
router.get("/verify", auth, userController.verifyToken);
router.post("/save-data", auth, userController.savePlayerData);

module.exports = router;
