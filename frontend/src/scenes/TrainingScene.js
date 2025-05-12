import { STAT_UPGRADE_MULTIPLIERS, LEVEL_UPGRADE_COST_MULTIPLIER } from "../config/constants.js";

export default class TrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: "TrainingScene" });
        this.totalUpgradesApplied = 0;

        // Valores configurables de la escena
        this.baseUpgradeCost = 25;
        this.levelUpPerStat = true;
        this.showPotentialLevel = true;
        this.showCosts = false;
        this.MAX_PLAYER_LEVEL = 50; // Nivel máximo del jugador

        // Añadir flag para seguimiento de mejoras confirmadas
        this.upgradesConfirmed = false;
    }

    // Enviar objeto Player
    init(data) {
        this.player = data.player;

        // Inicializar propiedades de entrenamiento aquí
        this.pendingUpgrades = {
            maxHealth: 0,
            resistance: 0,
            strength: 0,
            speed: 0,
        };

        // Inicializar costos de mejora
        this.upgradeCost = this.calculateUpgradeCost(this.player.level);

        // Guardar una copia de almas iniciales para seguimiento
        this.initialSouls = this.player.souls;
    }

    create() {
        // Ocultar HUD
        document.getElementById("hud-container").classList.add("hidden");
        document.getElementById("hud-key-container").classList.add("hidden");

        // Mostrar HTML
        document.getElementById("trainer-container").classList.remove("hidden");

        // Inicializar la interfaz de mejoras
        this.setupUpgradeUI();

        // Configurar escuchadores de eventos
        this.setupEventListeners();

        // Cerrar Escena
        this.input.keyboard.on("keydown-ESC", () => {
            this.player.savePlayerData();
            this.closeTraining();
        });
    }

    setupUpgradeUI() {
        // Obtener información de nivel actualizada
        const levelInfo = this.player.getPlayerInfo();

        // Mostrar estadísticas actuales del jugador
        document.getElementById("player-level").textContent = levelInfo.level;
        document.getElementById("player-souls").textContent = levelInfo.souls;

        // Mostrar costo de mejora inicial
        document.getElementById("required-souls").textContent = this.upgradeCost;

        // Actualizar estadísticas del jugador en la interfaz
        // Corregir IDs para que coincidan con el HTML
        document.getElementById("player-health").textContent = this.player.maxHealth;
        document.getElementById("player-resistance").textContent = this.player.resistance;
        document.getElementById("player-strength").textContent = this.player.strength;
        document.getElementById("player-speed").textContent = this.player.speed;

        // Inicializar contador de mejoras
        this.totalUpgradesApplied = 0;

        // Habilitar/deshabilitar botones según las almas disponibles
        this.updateUpgradeButtons();
        this.updateDowngradeButtons();

        // Mostrar/ocultar costos según la configuración
        if (!this.showCosts) {
            document.querySelectorAll(".upgrade-cost").forEach((el) => {
                if (el) el.style.display = "none";
            });
        }

        // Configurar sección de estadísticas detalladas del jugador
        this.setupStatsUI();
    }

    setupStatsUI() {
        // Mostrar estadísticas base y actuales
        document.getElementById("stats-health-base").textContent = this.player.maxHealth;
        document.getElementById("stats-resistance-base").textContent = this.player.resistance;
        document.getElementById("stats-strength-base").textContent = this.player.strength;
        document.getElementById("stats-speed-base").textContent = this.player.speed;

        document.getElementById("stats-health-upgraded").textContent = this.player.maxHealth;
        document.getElementById("stats-resistance-upgraded").textContent = this.player.resistance;
        document.getElementById("stats-strength-upgraded").textContent = this.player.strength;
        document.getElementById("stats-speed-upgraded").textContent = this.player.speed;
    }

    setupEventListeners() {
        // Botones de mejora (+)
        const upgradeButtons = document.querySelectorAll(".upgrade-btn");
        upgradeButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const stat = e.target.getAttribute("data-stat");
                this.upgradeStat(stat);
            });
        });

        // Botones de desmejora (-)
        const downgradeButtons = document.querySelectorAll(".downgrade-btn");
        downgradeButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const stat = e.target.getAttribute("data-stat");
                this.downgradeStat(stat);
            });
        });

        // Botón aceptar
        document.getElementById("accept-upgrades").addEventListener("click", () => {
            this.confirmUpgrades();
            this.closeTraining();
        });
    }

    calculateUpgradeCost(level) {
        return Math.ceil(this.baseUpgradeCost * (1 + (level - 1) * LEVEL_UPGRADE_COST_MULTIPLIER));
    }

    canUpgradeStat(stat) {
        // Verificar si se alcanzó el nivel máximo (solo si las mejoras incrementan el nivel)
        if (this.levelUpPerStat) {
            const potentialLevel = this.player.level + this.totalUpgradesApplied + 1;
            if (potentialLevel > this.MAX_PLAYER_LEVEL) {
                return false;
            }
        }

        return this.player.souls >= this.upgradeCost;
    }

    getAdjustedStatValue(stat) {
        // Para estadísticas con incremento fijo (resistance, strength, speed)
        if (stat !== "maxHealth") {
            return this.player[stat] + STAT_UPGRADE_MULTIPLIERS[stat] * this.pendingUpgrades[stat];
        } else {
            // Para maxHealth que usa incremento porcentual
            const pendingBonus = Math.ceil(
                this.player[stat] * STAT_UPGRADE_MULTIPLIERS[stat] * this.pendingUpgrades[stat]
            );
            return this.player[stat] + pendingBonus;
        }
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
        const levelIncrease = this.levelUpPerStat ? totalUpgrades : 0;

        // Aplicar todas las mejoras al jugador de una vez
        this.player.applyPlayerStats(this.pendingUpgrades, levelIncrease);

        // Marcar las mejoras como confirmadas para evitar reembolsos
        this.upgradesConfirmed = true;

        // Reiniciar mejoras pendientes
        this.pendingUpgrades = {
            maxHealth: 0,
            resistance: 0,
            strength: 0,
            speed: 0,
        };

        // Actualizar el HUD con los valores actualizados
        this.updateHUD();
    }

    updateHUD() {

        // Actualizar almas en el HUD
        const soulsElement = document.getElementById("souls-amount");
        if (soulsElement) {
            soulsElement.textContent = this.player.souls;
        }
    }

    cancelUpgrades() {
        if (this.totalUpgradesApplied > 0) {
            // Calcular almas a reembolsar
            const soulDifference = this.initialSouls - this.player.souls;

            // Restaurar almas al jugador
            this.player.addSouls(soulDifference);

            // Reiniciar mejoras pendientes
            this.pendingUpgrades = {
                maxHealth: 0,
                resistance: 0,
                strength: 0,
                speed: 0,
            };

            // Restaurar costo inicial
            this.upgradeCost = this.calculateUpgradeCost(this.player.level);
        }
    }

    upgradeStat(stat) {
        // Mapear los IDs del HTML a los atributos del jugador
        const statMapping = {
            health: "maxHealth",
            resistance: "resistance",
            strength: "strength",
            speed: "speed",
        };

        // Obtener el atributo real a mejorar
        const playerStat = statMapping[stat] || stat;

        // Solo permitir mejorar maxHealth, resistance, strength y speed
        if (!["maxHealth", "resistance", "strength", "speed"].includes(playerStat)) {
            console.warn(`No se puede mejorar el atributo ${stat}`);
            return;
        }

        // Verificar nivel máximo antes de mejorar
        if (this.levelUpPerStat) {
            const potentialLevel = this.player.level + this.totalUpgradesApplied + 1;
            if (potentialLevel > this.MAX_PLAYER_LEVEL) {
                console.warn(`No se puede mejorar más. Nivel máximo (${this.MAX_PLAYER_LEVEL}) alcanzado.`);
                return;
            }
        }

        if (this.prepareUpgradeStat(playerStat)) {
            // Incrementar contador de mejoras
            this.totalUpgradesApplied++;

            // Actualizar interfaz para la estadística mejorada utilizando el multiplicador
            const adjustedValue = this.getAdjustedStatValue(playerStat);
            document.getElementById(`player-${stat}`).textContent = adjustedValue;

            // Actualizar visualización de almas
            document.getElementById("player-souls").textContent = this.player.souls;

            // Actualizar el costo mostrado ya que ha cambiado
            document.getElementById("required-souls").textContent = this.upgradeCost;

            // Mostrar directamente el nivel potencial sin flechas de transición
            if (this.showPotentialLevel && this.levelUpPerStat) {
                const potentialLevel = this.player.level + this.totalUpgradesApplied;
                document.getElementById("player-level").textContent = potentialLevel;

                // Mostrar mensaje cuando se alcance el nivel máximo
                if (potentialLevel >= this.MAX_PLAYER_LEVEL) {
                    const levelElement = document.getElementById("player-level");
                    if (levelElement) {
                        levelElement.textContent = `${this.MAX_PLAYER_LEVEL} (MAX)`;
                    }
                }
            }

            // Calcular almas gastadas
            const spentSouls = this.initialSouls - this.player.souls;

            // Verificar si el elemento existe antes de actualizar el contenido
            const spentSoulsElement = document.getElementById("stats-spent-souls");
            if (spentSoulsElement) {
                spentSoulsElement.textContent = spentSouls;
            }

            // Actualizar la sección de estadísticas con los valores mejorados
            // Usar IDs del HTML pero valores del jugador
            document.getElementById("stats-health-upgraded").textContent = this.getAdjustedStatValue(
                playerStat === "maxHealth" ? "maxHealth" : "maxHealth"
            );
            document.getElementById("stats-resistance-upgraded").textContent = this.getAdjustedStatValue("resistance");
            document.getElementById("stats-strength-upgraded").textContent = this.getAdjustedStatValue("strength");
            document.getElementById("stats-speed-upgraded").textContent = this.getAdjustedStatValue("speed");

            // Actualizar estados de los botones
            this.updateUpgradeButtons();
            this.updateDowngradeButtons();
        }
    }

    downgradeStat(stat) {
        // Mapear los IDs del HTML a los atributos del jugador
        const statMapping = {
            health: "maxHealth",
            resistance: "resistance",
            strength: "strength",
            speed: "speed",
        };

        // Obtener el atributo real que se quiere desmejorar
        const playerStat = statMapping[stat] || stat;

        // Verificar si hay mejoras pendientes para deshacer
        if (this.pendingUpgrades[playerStat] > 0) {
            // Reducir la mejora pendiente
            this.pendingUpgrades[playerStat]--;

            // Devolver las almas al jugador
            const currentLevel = this.player.level + this.totalUpgradesApplied - 1;
            const refundAmount = this.calculateUpgradeCost(currentLevel);
            this.player.addSouls(refundAmount);

            // Decrementar contador de mejoras
            this.totalUpgradesApplied--;

            // Actualizar el valor que se mostrará
            const adjustedValue = this.getAdjustedStatValue(playerStat);
            document.getElementById(`player-${stat}`).textContent = adjustedValue;

            // Actualizar visualización de almas
            document.getElementById("player-souls").textContent = this.player.souls;

            // Actualizar el costo mostrado ya que ha cambiado
            this.upgradeCost = this.calculateUpgradeCost(this.player.level + this.totalUpgradesApplied);
            document.getElementById("required-souls").textContent = this.upgradeCost;

            // Mostrar directamente el nivel potencial
            if (this.showPotentialLevel && this.levelUpPerStat) {
                const potentialLevel = this.player.level + this.totalUpgradesApplied;
                const levelElement = document.getElementById("player-level");

                if (potentialLevel >= this.MAX_PLAYER_LEVEL) {
                    levelElement.textContent = `${this.MAX_PLAYER_LEVEL} (MAX)`;
                } else {
                    levelElement.textContent = potentialLevel;
                }
            }

            // Calcular almas gastadas
            const spentSouls = this.initialSouls - this.player.souls;

            // Verificar si el elemento existe antes de actualizar el contenido
            const spentSoulsElement = document.getElementById("stats-spent-souls");
            if (spentSoulsElement) {
                spentSoulsElement.textContent = spentSouls > 0 ? spentSouls : 0;
            }

            // Actualizar la sección de estadísticas con los valores ajustados
            document.getElementById("stats-health-upgraded").textContent = this.getAdjustedStatValue("maxHealth");
            document.getElementById("stats-resistance-upgraded").textContent = this.getAdjustedStatValue("resistance");
            document.getElementById("stats-strength-upgraded").textContent = this.getAdjustedStatValue("strength");
            document.getElementById("stats-speed-upgraded").textContent = this.getAdjustedStatValue("speed");

            // Actualizar estados de los botones
            this.updateUpgradeButtons();
            this.updateDowngradeButtons();
        }
    }

    updateUpgradeButtons() {
        // Usar los IDs reales del HTML
        const stats = ["health", "resistance", "strength", "speed"];

        // Verificar si el nivel máximo se ha alcanzado
        let maxLevelReached = false;
        if (this.levelUpPerStat) {
            const potentialLevel = this.player.level + this.totalUpgradesApplied;
            maxLevelReached = potentialLevel >= this.MAX_PLAYER_LEVEL;
        }

        stats.forEach((stat) => {
            const button = document.querySelector(`.upgrade-btn[data-stat="${stat}"]`);
            if (button) {
                // Deshabilitar el botón si se alcanza el nivel máximo o no hay suficientes almas
                const canUpgrade = !maxLevelReached && this.canUpgradeStat(stat === "health" ? "maxHealth" : stat);
                button.disabled = !canUpgrade;

                // Opcional: Añadir mensaje de nivel máximo en el tooltip del botón
                if (maxLevelReached) {
                    button.title = `Nivel máximo (${this.MAX_PLAYER_LEVEL}) alcanzado`;
                } else {
                    button.title = "";
                }
            }
        });

        // También actualizar los botones de desmejora
        this.updateDowngradeButtons();
    }

    updateDowngradeButtons() {
        const stats = ["health", "resistance", "strength", "speed"];
        const statMapping = {
            health: "maxHealth",
            resistance: "resistance",
            strength: "strength",
            speed: "speed",
        };

        stats.forEach((stat) => {
            const playerStat = statMapping[stat];
            const button = document.querySelector(`.downgrade-btn[data-stat="${stat}"]`);
            if (button) {
                // Habilitar el botón solo si hay mejoras pendientes para ese atributo
                button.disabled = this.pendingUpgrades[playerStat] <= 0;
            }
        });
    }

    closeTraining() {
        // Cancelar mejoras pendientes y devolver almas SOLO si no se han confirmado
        if (!this.upgradesConfirmed) {
            this.cancelUpgrades();
        }

        // Reiniciar contador de mejoras y flag de confirmación
        this.totalUpgradesApplied = 0;
        this.upgradesConfirmed = false;

        // Ocultar interfaz y volver al juego
        document.getElementById("trainer-container").classList.add("hidden");

        // Eliminar escuchadores de eventos
        const upgradeButtons = document.querySelectorAll(".upgrade-btn");
        upgradeButtons.forEach((button) => {
            button.replaceWith(button.cloneNode(true));
        });

        const downgradeButtons = document.querySelectorAll(".downgrade-btn");
        downgradeButtons.forEach((button) => {
            button.replaceWith(button.cloneNode(true));
        });

        const acceptButton = document.getElementById("accept-upgrades");
        acceptButton.replaceWith(acceptButton.cloneNode(true));

        // Mostrar HUD
        document.getElementById("hud-container").classList.remove("hidden");
        document.getElementById("hud-key-container").classList.remove("hidden");

        // Actualizar el HUD con los valores actuales antes de volver a la escena principal
        this.updateHUD();

        this.scene.resume("GameScene");
        this.scene.stop();
    }

    update() {
        // Lógica adicional de actualización para el entrenamiento puede añadirse aquí
    }
}
