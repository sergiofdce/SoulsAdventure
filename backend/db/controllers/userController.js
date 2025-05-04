const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Clave secreta para firmar JWT
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = "24h";

// Registrarse
exports.register = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ success: false, message: "El nombre del personaje es obligatorio" });
        }

        // Crear nuevo usuario en MongoDB
        const user = new User({ username });
        await user.save();

        // Generar token JWT que incluye el ID y username
        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
            },
        });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({
            success: false,
            message: "Error al registrar usuario",
            error: error.message,
        });
    }
};

// Guardar progreso
exports.savePlayerData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { playerData } = req.body;

        if (!playerData) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron datos para guardar",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { playerData }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            message: "Partida guardada correctamente",
            data: updatedUser.playerData,
        });
    } catch (error) {
        console.error("Error guardando la partida:", error);
        res.status(500).json({
            success: false,
            message: "Error guardando la partida",
            error: error.message,
        });
    }
};

// Obtener datos del jugador
exports.getPlayerData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            playerData: user.playerData || {},
        });
    } catch (error) {
        console.error("Error obteniendo datos del jugador:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener datos del jugador",
            error: error.message,
        });
    }
};

// Verificar token
exports.verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                playerData: user.playerData,
            },
        });
    } catch (error) {
        console.error("Error al verificar token:", error);
        res.status(500).json({
            success: false,
            message: "Error al verificar token",
            error: error.message,
        });
    }
};
