// Mejora de habilidades

// Porcentajes de mejora por cada punto invertido
export const STAT_UPGRADE_MULTIPLIERS = {
    maxHealth: 0.12, // +12% más de salud
    resistance: 1, // +1 punto
    strength: 1, // +1 punto
    speed: 1, // +1 punto
};

// Incremento de coste de almas por nivel
export const LEVEL_UPGRADE_COST_MULTIPLIER = 1.8; // +180% más de costo por nivel

// Sistema de combate
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
};
