import {
    UPGRADE_COST_MULTIPLIER,
    STAT_UPGRADE_MULTIPLIERS,
    TRAINING_CONFIG,
    INITIAL_PLAYER_STATS,
} from "../config/constants.js";

export default class TrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: "TrainingScene" });
        this.totalUpgradesApplied = 0;
    }

    // Enviar objeto Player
    init(data) {
        this.player = data.player;
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
        const levelInfo = this.player.getLevelInfo();

        // Mostrar estadísticas actuales del jugador
        document.getElementById("player-level").textContent = levelInfo.level;
        document.getElementById("player-souls").textContent = levelInfo.souls;

        // Mostrar solo el valor del costo de mejora sin texto adicional
        document.getElementById("required-souls").textContent = this.player.upgradeCost;

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
            this.player.confirmUpgrades();
            this.closeTraining();
        });
    }

    upgradeStat(stat) {
        if (this.player.prepareUpgradeStat(stat)) {
            // Incrementar contador de mejoras
            this.totalUpgradesApplied++;

            // Actualizar interfaz para la estadística mejorada utilizando el multiplicador
            const adjustedValue = this.player.getAdjustedStatValue(stat);
            document.getElementById(`player-${stat}`).textContent = adjustedValue;

            // Obtener información actualizada del nivel
            const levelInfo = this.player.getLevelInfo();

            // Actualizar visualización de almas
            document.getElementById("player-souls").textContent = levelInfo.souls;

            // Actualizar el costo mostrado ya que ha cambiado
            document.getElementById("required-souls").textContent = this.player.upgradeCost;

            // El costo de mejora no cambia, así que no necesitamos actualizar
            // el texto de required-souls en cada mejora

            // Mostrar directamente el nivel potencial sin flechas de transición
            if (TRAINING_CONFIG.showPotentialLevel && TRAINING_CONFIG.levelUpPerStat) {
                const potentialLevel = this.player.level + this.totalUpgradesApplied;
                document.getElementById("player-level").textContent = potentialLevel;
            }

            // Calcular almas gastadas
            const spentSouls = INITIAL_PLAYER_STATS.souls - this.player.souls;

            // Verificar si el elemento existe antes de actualizar el contenido
            const spentSoulsElement = document.getElementById("stats-spent-souls");
            if (spentSoulsElement) {
                spentSoulsElement.textContent = spentSouls;
            }

            // Actualizar la sección de estadísticas con los valores mejorados
            const adjustedHealth = this.player.getAdjustedStatValue("health");
            const adjustedResistance = this.player.getAdjustedStatValue("resistance");
            const adjustedStrength = this.player.getAdjustedStatValue("strength");
            const adjustedSpeed = this.player.getAdjustedStatValue("speed");

            document.getElementById("stats-health-upgraded").textContent = adjustedHealth;
            document.getElementById("stats-resistance-upgraded").textContent = adjustedResistance;
            document.getElementById("stats-strength-upgraded").textContent = adjustedStrength;
            document.getElementById("stats-speed-upgraded").textContent = adjustedSpeed;

            // Actualizar estados de los botones
            this.updateUpgradeButtons();
        }
    }

    updateUpgradeButtons() {
        const stats = ["health", "resistance", "strength", "speed"];
        stats.forEach((stat) => {
            const button = document.querySelector(`.upgrade-btn[data-stat="${stat}"]`);
            if (this.player.canUpgradeStat(stat)) {
                button.disabled = false;
            } else {
                button.disabled = true;
            }
        });
    }

    closeTraining() {
        // Reiniciar mejoras pendientes si no se confirmaron
        this.player.cancelUpgrades();

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
