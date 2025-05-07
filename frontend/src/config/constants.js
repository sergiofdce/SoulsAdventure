/*****************************************************
Atributos de Player
*****************************************************/
export const PLAYER_BASE_STATS = {
    maxHealth: 99,
    health: 99,
    resistance: 99,
    strength: 99,
    speed: 99,
};

/*****************************************************
Mejora de habilidades
*****************************************************/

// Porcentajes de mejora por cada punto invertido
export const STAT_UPGRADE_MULTIPLIERS = {
    maxHealth: 0.12, // +12% más de salud
    resistance: 1, // +1 punto
    strength: 1, // +1 punto
    speed: 1, // +1 punto
};

// Incremento de coste de almas por nivel
export const LEVEL_UPGRADE_COST_MULTIPLIER = 1.8; // +180% más de costo por nivel

/*****************************************************
Sistema de Combate
*****************************************************/

export const COMBAT = {
    LIGHT_ATTACK: {
        BASE_HIT_CHANCE: 0.9, // 90% de probabilidad base de acertar
        SPEED_HIT_BONUS: 0.05, // 5% adicional por cada punto de velocidad de diferencia
        DAMAGE_MULTIPLIER: 0.8, // Daño basado en velocidad * 0.8
        CRITICAL_THRESHOLD: 5, // Diferencia de velocidad para activar crítico
        CRITICAL_MULTIPLIER: 1.5, // Multiplicador de daño crítico (50% más)
    },
    HEAVY_ATTACK: {
        BASE_HIT_CHANCE: 0.6, // 60% de probabilidad base de acertar
        SPEED_HIT_BONUS: 0.05, // 5% adicional por cada punto de velocidad de diferencia
        DAMAGE_MULTIPLIER: 1.5, // Daño basado en fuerza * 1.5
        BASE_STUN_CHANCE: 0.25, // 25% de probabilidad base de aturdir
        STRENGTH_STUN_BONUS: 0.05, // 5% adicional por cada punto de fuerza de diferencia
        STUN_DURATION: 1, // Duración del aturdimiento en turnos
    },
    BLOCK: {
        BASE_TOTAL_BLOCK_CHANCE: 0.05, // 5% de probabilidad base de bloqueo total
        RESISTANCE_BLOCK_BONUS: 0.01, // 1% adicional por cada punto de resistencia
        MAX_TOTAL_BLOCK_CHANCE: 0.4, // Máximo 40% de probabilidad de bloqueo total
        BASE_DAMAGE_REDUCTION: 0.3, // 30% de reducción de daño base
        DEFENSE_REDUCTION_BONUS: 0.02, // 2% adicional por cada punto de defensa
        RESISTANCE_REDUCTION_BONUS: 0.01, // 1% adicional por cada punto de resistencia
        MAX_DAMAGE_REDUCTION: 0.8, // Máximo 80% de reducción de daño
        COUNTER_ATTACK_DAMAGE_SPEED: 0.5, // Multiplicador de velocidad para daño de contraataque
        COUNTER_ATTACK_DAMAGE_STRENGTH: 0.5, // Multiplicador de fuerza para daño de contraataque
    },
    POTION: {
        BASE_PERCENTAGE: 0.2, // Cura base del 20% de la salud máxima
        RESISTANCE_BONUS: 2, // +2 puntos de curación por cada punto de resistencia
    },
};

/*****************************************************
Enemigos
*****************************************************/
export const ENEMIES = {
    // Pueblo
    EnanoObservador: {
        name: "Vigilón",
        scale: 0.6,
        health: 18,
        strength: 3,
        speed: 2,
        souls: 15,
    },
    EnanoMayor: {
        name: "Nublocular",
        scale: 0.6,
        health: 15,
        strength: 4,
        speed: 3,
        souls: 25,
    },
    EnanoFuego: {
        name: "Tenebrillo ",
        scale: 0.5,
        health: 10,
        strength: 3,
        speed: 5,
        souls: 20,
    },
    EnanoEscudo: {
        name: "Pupistral",
        scale: 0.7,
        health: 8,
        strength: 2,
        speed: 8,
        souls: 30,
    },
    // Pantano
    SlimeNormal: {
        name: "Babosa Común",
        scale: 0.7,
        health: 20,
        strength: 4,
        speed: 3,
        souls: 25,
    },
    SlimeFuego: {
        name: "Babosa de Fuego",
        scale: 0.7,
        health: 18,
        strength: 6,
        speed: 4,
        souls: 35,
    },
    SlimePinchos: {
        name: "Babosa Espinosa",
        scale: 0.8,
        health: 25,
        strength: 5,
        speed: 2,
        souls: 40,
    },
    SlimeHumano: {
        name: "Babosa Humanoide",
        scale: 0.75,
        health: 22,
        strength: 7,
        speed: 5,
        souls: 50,
    },
    // Lava
};

/*****************************************************
Jefes
*****************************************************/
export const BOSSES = {
    Toro: {
        name: "Toro",
        scale: 1.2,
        health: 10,
        strength: 10,
        speed: 5,
        souls: 200,
    },
    Nasus: {
        name: "Nasus",
        scale: 1.2,
        health: 10,
        strength: 10,
        speed: 5,
        souls: 200,
    },
};
