// Constantes del juego

// Sistema de mejora del jugador
export const UPGRADE_COST_MULTIPLIER = 0.1; // 10% de coste adicional por mejora
export const LEVEL_COST_MULTIPLIER = 0.05; // 5% de incremento en almas necesarias por nivel

// Base de almas necesarias para subir al nivel 2
export const BASE_SOULS_REQUIREMENT = 100;

// Base de costo para mejorar cualquier estadística
export const BASE_UPGRADE_COST = 10;

// Multiplicador para incrementar el costo de mejora según el nivel
export const LEVEL_UPGRADE_COST_MULTIPLIER = 0.5; // 50% más de costo por nivel

// Porcentajes de mejora por cada punto invertido
export const STAT_UPGRADE_MULTIPLIERS = {
    health: 0.12, // 12% más de salud por nivel
    resistance: 0.15, // 15% más de resistencia por nivel
    strength: 0.1, // 10% más de fuerza por nivel
    speed: 0.08, // 8% más de velocidad por nivel
};

// Valores iniciales de atributos del jugador
export const INITIAL_PLAYER_STATS = {
    level: 1,
    souls: 10000,
    health: 100,
    resistance: 10,
    strength: 10,
    speed: 10,
    armor: 0,
};

// Configuración del sistema de entrenamiento/mejora
export const TRAINING_CONFIG = {
    levelUpPerStat: true, // Si true, cada mejora de stat aumenta 1 nivel
    showPotentialLevel: true, // Mostrar nivel potencial en la interfaz
    showCosts: false, // Mostrar costes específicos para cada mejora
};

// Otras constantes pueden añadirse aquí
