const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definir el esquema de usuario
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  playerData: {
    type: Object,
    default: {} // Datos del jugador guardados como objeto JSON
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true // Añade automáticamente createdAt y updatedAt
});

// Método pre-save para hashear la contraseña antes de guardarla
userSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña es nueva o ha sido modificada
  if (!this.isModified('password')) return next();
  
  try {
    // Generar un salt y hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para verificar contraseña
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;