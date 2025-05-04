/*****************************************************
Atributos de Player
*****************************************************/
export const PLAYER_BASE_STATS = {
    maxHealth: 25,
    health: 25,
    resistance: 3243243,
    strength: 32342432,
    speed: 234234,
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
