const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Clave secreta para firmar JWT
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = "7d";

// Registrarse
exports.register = async (req, res) => {
    try {
        const { username } = req.body;

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
    }
};

// Verificar token
exports.validateToken = async (req, res) => {
    // El middleware auth ya verificó el token, así que solo devolvemos éxito
    res.status(200).json({
        success: true,
        user: {
            userId: req.user.userId,
            username: req.user.username,
        },
    });
};

// Guardar en MongoDB
exports.savePlayerData = async (req, res) => {
    try {
        const userId = req.user.userId;

        console.log("Guardando datos de:", userId);

        // Actualizar el documento del usuario con los nuevos datos de jugador
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    playerData: req.body,
                    lastSaved: new Date(),
                },
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Datos de jugador guardados correctamente",
            savedAt: updatedUser.lastSaved,
        });
    } catch (error) {
        console.error("Error al guardar datos de jugador:", error);
    }
};

// Cargar desde MongoDB
exports.getPlayerData = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log("Cargando datos de:", userId);

        const user = await User.findById(userId);

        // Devolver los datos del jugador
        res.status(200).json({
            success: true,
            message: "Datos del jugador obtenidos correctamente",
            username: user.username,
            playerData: user.playerData,
        });
    } catch (error) {
        console.error("Error al obtener datos del jugador:", error);
    }
};
