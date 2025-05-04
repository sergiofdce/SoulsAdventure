const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Clave secreta para firmar JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Tiempo de expiración del token (1 día)
const TOKEN_EXPIRY = "24h";

// Registrarse
exports.register = async (req, res) => {
    try {
        console.log("========= INICIO PROCESO REGISTRO =========");
        console.log("Datos recibidos:", req.body);

        const { username, password, playerName } = req.body;

        // Validación más detallada
        if (!username) {
            console.log("Error: Falta el nombre de usuario");
            return res.status(400).json({ success: false, message: "El nombre de usuario es obligatorio" });
        }
        if (!password) {
            console.log("Error: Falta la contraseña");
            return res.status(400).json({ success: false, message: "La contraseña es obligatoria" });
        }
        if (!playerName) {
            console.log("Error: Falta el nombre del personaje");
            return res.status(400).json({ success: false, message: "El nombre del personaje es obligatorio" });
        }

        // Verificar si el usuario ya existe
        console.log("Verificando si el usuario ya existe...");
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            console.log("Error: El usuario ya existe");
            return res.status(400).json({
                success: false,
                message: "El nombre de usuario ya está en uso",
            });
        }

        console.log("Usuario no existente, procediendo a crear...");

        try {
            // Crear el hash de la contraseña manualmente en vez de usar el middleware
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            console.log("Contraseña hasheada correctamente");

            // Crear nuevo usuario con la contraseña ya hasheada
            const user = new User({
                username,
                password: hashedPassword,
                playerName,
            });

            console.log("Usuario creado, guardando en la base de datos...");
            await user.save();
            console.log("Usuario guardado exitosamente con ID:", user._id);

            // Generar token JWT
            console.log("Generando token JWT...");
            const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });

            // Establecer el token como cookie HttpOnly
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
                maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
                sameSite: "strict",
            });

            console.log("Token generado correctamente");

            res.status(201).json({
                success: true,
                message: "Usuario registrado correctamente",
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    playerName: user.playerName,
                },
            });

            console.log("========= FIN PROCESO REGISTRO (EXITOSO) =========");
        } catch (saveError) {
            console.error("Error al guardar el usuario:", saveError);
            return res.status(500).json({
                success: false,
                message: "Error al guardar el usuario en la base de datos",
                error: saveError.message,
            });
        }
    } catch (error) {
        console.error("========= ERROR EN PROCESO DE REGISTRO =========");
        console.error(error);

        // Manejar errores específicos de MongoDB
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((val) => val.message);
            console.log("Error de validación:", messages);
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: messages,
            });
        }

        res.status(500).json({
            success: false,
            message: "Error interno del servidor al registrar usuario",
            errorMsg: error.message,
        });
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar el usuario
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario o contraseña incorrectos",
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Usuario o contraseña incorrectos",
            });
        }

        // Generar token
        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
            maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
            sameSite: "strict",
        });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                playerName: user.playerName,
                playerData: user.playerData,
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            success: false,
            message: "Error al iniciar sesión",
            error: error.message,
        });
    }
};

// Guardar progreso
exports.savePlayerData = async (req, res) => {
    try {
        // Corregir para obtener userId del token decodificado por el middleware auth
        const userId = req.user.userId;
        const { playerData } = req.body;

        if (!playerData) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron datos para guardar",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { playerData }, { new: true }).select("-password");

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
        // Obtener el ID del usuario desde el token
        const userId = req.user.userId;
        
        // Buscar usuario por ID
        const user = await User.findById(userId).select("-password");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        // Devolver los datos del jugador
        res.status(200).json({
            success: true,
            playerData: user.playerData || {}
        });
    } catch (error) {
        console.error("Error obteniendo datos del jugador:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener datos del jugador",
            error: error.message
        });
    }
};

// Controlador para verificar token
exports.verifyToken = async (req, res) => {
    try {
        // El middleware auth ya ha verificado el token y añadido req.user
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // Respuesta exitosa
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                playerName: user.playerName,
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
