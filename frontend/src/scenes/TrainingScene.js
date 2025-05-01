import {
    UPGRADE_COST_MULTIPLIER,
    STAT_UPGRADE_MULTIPLIERS,
    TRAINING_CONFIG,
    INITIAL_PLAYER_STATS,
    BASE_UPGRADE_COST,
    LEVEL_UPGRADE_COST_MULTIPLIER,
    BASE_SOULS_REQUIREMENT,
    LEVEL_COST_MULTIPLIER,
} from "../config/constants.js";

export default class TrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: "TrainingScene" });
        this.totalUpgradesApplied = 0;
    }

    // Enviar objeto Player
    init(data) {
        this.player = data.player;

        // Inicializar propiedades de entrenamiento aquí (movidas desde Player)
        this.pendingUpgrades = {
            health: 0,
            resistance: 0,
            strength: 0,
            speed: 0,
        };

        // Calcular almas requeridas para el siguiente nivel
        this.requiredSouls = this.calculateRequiredSouls(this.player.level);

        // Inicializar costos de mejora
        this.upgradeCost = this.calculateUpgradeCost(this.player.level);

        // Guardar una copia de almas iniciales para seguimiento
        this.initialSouls = this.player.souls;
    }

    // Cálculo de almas necesarias para subir de nivel (movido desde Player)
    calculateRequiredSouls(currentLevel) {
        // Fórmula: BASE * (1 + MULTIPLIER)^(level)
        return Math.ceil(BASE_SOULS_REQUIREMENT * Math.pow(1 + LEVEL_COST_MULTIPLIER, currentLevel - 1));
    }

    create() {
        // Mostrar HTML
        document.getElementById("trainer-container").classList.remove("hidden");

        // Inicializar la interfaz de mejoras
        this.setupUpgradeUI();

        // Configurar escuchadores de eventos
        this.setupEventListeners();

        // Cerrar Escena
        this.input.keyboard.on("keydown-ESC", () => {
            this.closeTraining();
        });
    }

    setupUpgradeUI() {
        // Obtener información de nivel actualizada
        const levelInfo = this.player.getPlayerInfo();

        // Mostrar estadísticas actuales del jugador
        document.getElementById("player-level").textContent = levelInfo.level;
        document.getElementById("player-souls").textContent = levelInfo.souls;

        // Mostrar costo de mejora inicial y almas requeridas para el siguiente nivel
        document.getElementById("required-souls").textContent = this.upgradeCost;

        // Actualizar el elemento que muestra las almas requeridas para el siguiente nivel, si existe
        const requiredSoulsElement = document.getElementById("next-level-souls");
        if (requiredSoulsElement) {
            requiredSoulsElement.textContent = this.requiredSouls;
        }

        document.getElementById("player-health").textContent = this.player.health;
        document.getElementById("player-resistance").textContent = this.player.resistance;
        document.getElementById("player-strength").textContent = this.player.strength;
        document.getElementById("player-speed").textContent = this.player.speed;

        // Inicializar contador de mejoras
        this.totalUpgradesApplied = 0;

        // Habilitar/deshabilitar botones según las almas disponibles
        this.updateUpgradeButtons();

        // Mostrar/ocultar costos según la configuración
        if (!TRAINING_CONFIG.showCosts) {
            document.querySelectorAll(".upgrade-cost").forEach((el) => {
                if (el) el.style.display = "none";
            });
        }

        // Configurar sección de estadísticas detalladas del jugador
        this.setupStatsUI();
    }

    setupStatsUI() {
        // Inicializar la información de estadísticas del jugador
        const initialStats = {
            health: INITIAL_PLAYER_STATS.health,
            resistance: INITIAL_PLAYER_STATS.resistance,
            strength: INITIAL_PLAYER_STATS.strength,
            speed: INITIAL_PLAYER_STATS.speed,
        };

        // Mostrar estadísticas base y actuales
        document.getElementById("stats-health-base").textContent = initialStats.health;
        document.getElementById("stats-resistance-base").textContent = initialStats.resistance;
        document.getElementById("stats-strength-base").textContent = initialStats.strength;
        document.getElementById("stats-speed-base").textContent = initialStats.speed;

        document.getElementById("stats-health-upgraded").textContent = this.player.health;
        document.getElementById("stats-resistance-upgraded").textContent = this.player.resistance;
        document.getElementById("stats-strength-upgraded").textContent = this.player.strength;
        document.getElementById("stats-speed-upgraded").textContent = this.player.speed;
    }

    setupEventListeners() {
        // Botones de mejora
        const upgradeButtons = document.querySelectorAll(".upgrade-btn");
        upgradeButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const stat = e.target.getAttribute("data-stat");
                this.upgradeStat(stat);
            });
        });

        // Botón aceptar
        document.getElementById("accept-upgrades").addEventListener("click", () => {
            this.confirmUpgrades();
            this.closeTraining();
        });
    }

    // Métodos movidos desde Player
    calculateUpgradeCost(level) {
        return Math.ceil(BASE_UPGRADE_COST * (1 + (level - 1) * LEVEL_UPGRADE_COST_MULTIPLIER));
    }

    canUpgradeStat(stat) {
        return this.player.souls >= this.upgradeCost;
    }

    getAdjustedStatValue(stat) {
        const pendingBonus = Math.ceil(this.player[stat] * STAT_UPGRADE_MULTIPLIERS[stat] * this.pendingUpgrades[stat]);
        return this.player[stat] + pendingBonus;
    }

    prepareUpgradeStat(stat) {
        if (this.canUpgradeStat(stat)) {
            // Añadir mejora pendiente
            this.pendingUpgrades[stat]++;

            // Restar almas al jugador
            this.player.spendSouls(this.upgradeCost);

            // Actualizar el costo para la siguiente mejora
            this.updateUpgradeCost(true);

            return true;
        }
        return false;
    }

    updateUpgradeCost(usePotentialLevel = false) {
        let levelToUse = this.player.level;

        // Si se solicita usar el nivel potencial, calcular la suma de nivel actual + mejoras pendientes
        if (usePotentialLevel) {
            const totalPendingUpgrades = Object.values(this.pendingUpgrades).reduce((sum, val) => sum + val, 0);
            levelToUse = this.player.level + totalPendingUpgrades;
        }

        // Fórmula: BASE_COST * (1 + (nivel-1) * MULTIPLIER)
        this.upgradeCost = this.calculateUpgradeCost(levelToUse);
    }

    confirmUpgrades() {
        // Calcular la cantidad total de mejoras realizadas
        const totalUpgrades = Object.values(this.pendingUpgrades).reduce((sum, val) => sum + val, 0);

        // Determinar el aumento de nivel
        const levelIncrease = TRAINING_CONFIG.levelUpPerStat ? totalUpgrades : 0;

        // Aplicar todas las mejoras al jugador de una vez
        this.player.applyPlayerStats(this.pendingUpgrades, levelIncrease);

        // Recalcular almas requeridas para el siguiente nivel
        if (levelIncrease > 0) {
            this.requiredSouls = this.calculateRequiredSouls(this.player.level);
        }

        // Reiniciar mejoras pendientes
        this.pendingUpgrades = {
            health: 0,
            resistance: 0,
            strength: 0,
            speed: 0,
        };
    }

    cancelUpgrades() {
        if (this.totalUpgradesApplied > 0) {
            // Calcular almas a reembolsar
            const soulDifference = this.initialSouls - this.player.souls;

            // Restaurar almas al jugador
            this.player.addSouls(soulDifference);

            // Reiniciar mejoras pendientes
            this.pendingUpgrades = {
                health: 0,
                resistance: 0,
                strength: 0,
                speed: 0,
            };

            // Restaurar costo inicial
            this.upgradeCost = this.calculateUpgradeCost(this.player.level);
        }
    }

    // Método modificado de la escena original
    upgradeStat(stat) {
        if (this.prepareUpgradeStat(stat)) {
            // Incrementar contador de mejoras
            this.totalUpgradesApplied++;

            // Actualizar interfaz para la estadística mejorada utilizando el multiplicador
            const adjustedValue = this.getAdjustedStatValue(stat);
            document.getElementById(`player-${stat}`).textContent = adjustedValue;

            // Actualizar visualización de almas
            document.getElementById("player-souls").textContent = this.player.souls;

            // Actualizar el costo mostrado ya que ha cambiado
            document.getElementById("required-souls").textContent = this.upgradeCost;

            // Mostrar directamente el nivel potencial sin flechas de transición
            if (TRAINING_CONFIG.showPotentialLevel && TRAINING_CONFIG.levelUpPerStat) {
                const potentialLevel = this.player.level + this.totalUpgradesApplied;
                document.getElementById("player-level").textContent = potentialLevel;
            }

            // Calcular almas gastadas
            const spentSouls = this.initialSouls - this.player.souls;

            // Verificar si el elemento existe antes de actualizar el contenido
            const spentSoulsElement = document.getElementById("stats-spent-souls");
            if (spentSoulsElement) {
                spentSoulsElement.textContent = spentSouls;
            }

            // Actualizar la sección de estadísticas con los valores mejorados
            document.getElementById("stats-health-upgraded").textContent = this.getAdjustedStatValue("health");
            document.getElementById("stats-resistance-upgraded").textContent = this.getAdjustedStatValue("resistance");
            document.getElementById("stats-strength-upgraded").textContent = this.getAdjustedStatValue("strength");
            document.getElementById("stats-speed-upgraded").textContent = this.getAdjustedStatValue("speed");

            // Actualizar estados de los botones
            this.updateUpgradeButtons();
        }
    }

    updateUpgradeButtons() {
        const stats = ["health", "resistance", "strength", "speed"];
        stats.forEach((stat) => {
            const button = document.querySelector(`.upgrade-btn[data-stat="${stat}"]`);
            if (this.canUpgradeStat(stat)) {
                button.disabled = false;
            } else {
                button.disabled = true;
            }
        });
    }

    closeTraining() {
        // Cancelar mejoras pendientes y devolver almas
        this.cancelUpgrades();

        // Reiniciar contador de mejoras
        this.totalUpgradesApplied = 0;

        // Ocultar interfaz y volver al juego
        document.getElementById("trainer-container").classList.add("hidden");

        // Eliminar escuchadores de eventos
        const upgradeButtons = document.querySelectorAll(".upgrade-btn");
        upgradeButtons.forEach((button) => {
            button.replaceWith(button.cloneNode(true));
        });

        const acceptButton = document.getElementById("accept-upgrades");
        acceptButton.replaceWith(acceptButton.cloneNode(true));

        this.scene.resume("GameScene");
        this.scene.stop();
    }

    update() {
        // Lógica adicional de actualización para el entrenamiento puede añadirse aquí
    }
}
