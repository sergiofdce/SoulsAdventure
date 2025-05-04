const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Esquema para datos del jugador (opcional, para guardar estado del juego)
const playerDataSchema = new mongoose.Schema(
    {
        level: { type: Number, default: 1 },
        souls: { type: Number, default: 0 },
        health: { type: Number, default: 100 },
        maxHealth: { type: Number, default: 100 },
        resistance: { type: Number, default: 10 },
        strength: { type: Number, default: 10 },
        speed: { type: Number, default: 10 },
        inventory: { type: Object, default: {} },
    },
    { _id: false }
);

// Esquema principal de usuario
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "El nombre de usuario es obligatorio"],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"],
        minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    playerName: {
        type: String,
        required: [true, "El nombre del personaje es obligatorio"],
        trim: true,
    },
    playerData: {
        type: playerDataSchema,
        default: () => ({}),
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Método para comparar contraseñas (útil para el login)
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
