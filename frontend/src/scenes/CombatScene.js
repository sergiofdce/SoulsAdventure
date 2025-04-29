export default class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: "CombatScene" });

        // Objetos Player y Enemy
        this.player = null;
        this.enemy = null;

        // Variables combate
        this.isPlayerTurn = true;
        this.turnCount = 0;
        this.combatActive = false;
    }

    // Método init que recibe instancia de Player y Enemy
    init(data) {
        // Obtener las instancias de player y enemy
        this.player = data.player;
        this.enemy = data.enemy;

        console.log(this.player);
        console.log(this.enemy);

        // Salud Player
        this.playerMaxHealth = this.player.maxHealth;
        this.playerCurrentHealth = this.player.health;

        // Salud Enemy
        this.enemyMaxHealth = this.enemy.health;
        this.enemyCurrentHealth = this.enemy.health;

        // Reiniciar la bandera de victoria
        this.victoryProcessed = false;
    }

    create() {
        // Mostrar el contenedor de combate HTML
        this.showCombatContainer();

        // Configurar la interfaz
        this.setupCombatUI();

        // Iniciar combate
        this.startCombat();

        // Configurar controles de botones
        this.setupButtonListeners();

        console.log(this.enemy.health, this.enemy.health);
    }

    startCombat() {
        // Inicializar variables de combate
        this.combatActive = true;
        this.turnCount = 0;

        // Por defecto, desactivar todos los controles hasta determinar quién empieza
        this.disablePlayerControls();

        // Determinar quien empieza basado en la velocidad (speed)
        this.isPlayerTurn = this.player.speed >= this.enemy.speed;

        // Mensaje inicial basado en quien empieza
        if (this.isPlayerTurn) {
            this.addCombatLogMessage(
                `¡Tu velocidad (${this.player.speed}) es mayor que la del enemigo (${this.enemy.speed})! Atacas primero.`,
                "combat-info"
            );
            this.time.delayedCall(500, () => {
                this.enablePlayerControls();
            });
        } else {
            this.addCombatLogMessage(
                `¡El enemigo es más rápido (${this.enemy.speed}) que tú (${this.player.speed})! Ataca primero.`,
                "enemy-action"
            );
            this.disablePlayerControls();
            // Dar tiempo para que el jugador lea el mensaje antes del ataque enemigo
            this.time.delayedCall(2000, () => {
                this.enemyAction();
            });
        }
    }

    showCombatContainer() {
        // Ocultar HUD
        document.getElementById("hud-container").classList.add("hidden");

        // Mostrar el contenedor HTML de combate
        document.getElementById("combat-container").classList.remove("hidden");
    }

    setupCombatUI() {
        // Mostrar nombre player
        document.getElementById("player-name").textContent = this.player.name;

        // Mostrar nombre Enemigo
        document.getElementById("enemy-name").textContent = this.enemy.name;

        // Actualizar textos de salud
        document.getElementById("player-current-health").textContent = this.playerCurrentHealth;
        document.getElementById("player-max-health").textContent = this.playerMaxHealth;
        document.getElementById("enemy-current-health").textContent = this.enemyCurrentHealth;
        document.getElementById("enemy-max-health").textContent = this.enemyMaxHealth;

        // Actualizar barras de salud
        this.updateHealthBar("player", this.player.health, this.player.maxHealth);
        this.updateHealthBar("enemy", this.enemy.health, this.enemy.health);
    }

    // Nuevo método para actualizar las barras de vida
    updateHealthBar(type, currentHealth, maxHealth) {
        const healthBar =
            type === "player"
                ? document.querySelector("#player-container .health-bar")
                : document.querySelector("#enemy-container .health-bar");

        // Actualizar el texto de salud actual
        const currentHealthElement = document.getElementById(`${type}-current-health`);
        if (currentHealthElement) {
            currentHealthElement.textContent = Math.max(0, currentHealth);
        }

        if (healthBar) {
            // Calcular el porcentaje de vida
            const healthPercent = Math.max(0, Math.min((currentHealth / maxHealth) * 100, 100));

            // Establecer el ancho de la barra según el porcentaje de vida
            healthBar.style.width = `${healthPercent}%`;

            // Aplicar un degradado de color basado en el porcentaje de vida
            if (healthPercent > 60) {
                // Verde a amarillo para vida alta
                const greenValue = Math.floor((255 * (healthPercent - 60)) / 40);
                healthBar.style.backgroundColor = `rgb(${255 - greenValue}, 255, 0)`;
            } else if (healthPercent > 30) {
                // Amarillo a rojo para vida media
                const redValue = Math.floor((255 * (healthPercent - 30)) / 30);
                healthBar.style.backgroundColor = `rgb(255, ${redValue}, 0)`;
            } else {
                // Rojo para vida baja
                healthBar.style.backgroundColor = "rgb(255, 0, 0)";
            }
        }
    }

    setupButtonListeners() {
        // Ataque ligero
        const attackLightBtn = document.querySelector(".combat-button.attack-light");
        if (attackLightBtn) {
            attackLightBtn.addEventListener("click", () => {
                // Verificar explícitamente si es el turno del jugador antes de procesar
                if (this.isPlayerTurn && this.combatActive && !attackLightBtn.disabled) {
                    this.handleAttackLight();
                }
            });
        }

        // Ataque pesado
        const attackHeavyBtn = document.querySelector(".combat-button.attack-heavy");
        if (attackHeavyBtn) {
            attackHeavyBtn.addEventListener("click", () => {
                // Verificar explícitamente si es el turno del jugador antes de procesar
                if (this.isPlayerTurn && this.combatActive && !attackHeavyBtn.disabled) {
                    this.handleAttackHeavy();
                }
            });
        }

        // Curar
        const healBtn = document.querySelector(".combat-button.heal");
        if (healBtn) {
            healBtn.addEventListener("click", () => {
                // Verificar explícitamente si es el turno del jugador antes de procesar
                if (this.isPlayerTurn && this.combatActive && !healBtn.disabled) {
                    this.handleHeal();
                }
            });
        }

        // Huir
        const dodgeBtn = document.querySelector(".combat-button.dodge");
        if (dodgeBtn) {
            dodgeBtn.addEventListener("click", () => {
                // La huida se puede intentar incluso si no es el turno del jugador
                if (this.combatActive && !dodgeBtn.disabled) {
                    this.handleDodge();
                }
            });
        }
    }

    handleAttackLight() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar inmediatamente los controles para evitar doble clic
        this.disablePlayerControls();

        // Usar el nuevo sistema de ataque ligero
        this.performLightAttack("player");

        // Finalizar turno con retraso adecuado para todas las animaciones
        this.time.delayedCall(2000, () => {
            this.endTurn();
        });
    }

    handleAttackHeavy() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar inmediatamente los controles para evitar doble clic
        this.disablePlayerControls();

        // Usar el nuevo sistema de ataque pesado
        this.performHeavyAttack("player");

        // Finalizar turno con retraso adecuado
        this.time.delayedCall(2500, () => {
            this.endTurn();
        });
    }

    handleHeal() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar inmediatamente los controles para evitar doble clic
        this.disablePlayerControls();

        this.addCombatLogMessage("Te has curado.", "heal-action");
        // Implementar la curación
        this.healCharacter("player");

        // Finalizar turno y pasar al enemigo
        this.time.delayedCall(500, () => {
            this.endTurn();
        });
    }

    handleDodge() {
        if (!this.combatActive) return;

        this.addCombatLogMessage("Intentas huir del combate...", "dodge-action");

        // Probabilidad de escape basada en la velocidad del jugador
        // Por ejemplo: 40% base + 2% por cada punto de velocidad por encima de 10
        const escapeChance = 0.4 + Math.max(0, (this.player.speed - 10) * 0.02);

        if (Math.random() < escapeChance) {
            this.addCombatLogMessage("¡Escapaste con éxito!", "combat-info");
            this.time.delayedCall(1000, () => this.exitCombat());
        } else {
            this.addCombatLogMessage("¡No puedes escapar!", "enemy-action");
            // Perder turno y pasar al enemigo
            this.time.delayedCall(500, () => {
                this.endTurn();
            });
        }
    }

    addCombatLogMessage(message, className = "") {
        const combatLog = document.getElementById("combat-log");
        if (combatLog) {
            const messageElement = document.createElement("p");
            messageElement.textContent = message;
            messageElement.classList.add("console-message");

            if (className) {
                messageElement.classList.add(className);
            }

            combatLog.appendChild(messageElement);
            combatLog.scrollTop = combatLog.scrollHeight;
        }
    }

    enablePlayerControls() {
        const buttons = document.querySelectorAll(".combat-button");
        buttons.forEach((button) => {
            button.disabled = false;
            button.classList.remove("disabled");
            // Añadir eventos de click a los botones
            button.style.pointerEvents = "auto";
        });
        this.addCombatLogMessage("Tu turno, elige una acción.", "player-turn");
    }

    disablePlayerControls() {
        const buttons = document.querySelectorAll(".combat-button");
        buttons.forEach((button) => {
            button.disabled = true;
            button.classList.add("disabled");
            // Eliminar eventos de click para evitar interacción
            button.style.pointerEvents = "none";
        });
    }

    // Método para calcular probabilidad de esquivar un ataque
    calculateDodgeChance(attackerSpeed, defenderSpeed, attackType) {
        // Base de probabilidad de esquivar según el tipo de ataque
        const baseDodgeChance = attackType === "light" ? 0.15 : 0.3;

        // Modificador basado en la diferencia de velocidad
        // Si el defensor es más rápido que el atacante, tiene más posibilidades de esquivar
        const speedDifference = defenderSpeed - attackerSpeed;
        const speedModifier = Math.max(0, speedDifference * 0.02);

        // Probabilidad total de esquivar (entre 0 y 0.75)
        return Math.min(0.75, baseDodgeChance + speedModifier);
    }

    // Método para calcular probabilidad de ataque doble (solo para ataques ligeros)
    calculateDoubleAttackChance(attackerSpeed, defenderSpeed) {
        // Probabilidad base del 10%
        const baseDoubleChance = 0.1;

        // Modificador basado en la ventaja de velocidad
        // Si el atacante es más rápido que el defensor, tiene más posibilidades de doble ataque
        const speedAdvantage = Math.max(0, attackerSpeed - defenderSpeed);
        const speedModifier = speedAdvantage * 0.015;

        // Probabilidad total de ataque doble (entre 0 y 0.50)
        return Math.min(0.5, baseDoubleChance + speedModifier);
    }

    enemyAction() {
        if (!this.combatActive) return;

        this.addCombatLogMessage("Turno del enemigo...", "enemy-turn");

        // Añadir retraso antes de elegir acción para mejor legibilidad
        this.time.delayedCall(1200, () => {
            // Lógica de IA simple: el enemigo elige una acción aleatoriamente
            const actions = ["attack-light", "attack-heavy"];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];

            switch (randomAction) {
                case "attack-light":
                    this.performLightAttack("enemy");
                    break;
                case "attack-heavy":
                    this.performHeavyAttack("enemy");
                    break;
            }
        });
    }

    // Método para manejar ataques ligeros (tanto de jugador como de enemigo)
    performLightAttack(attacker) {
        const attackerSpeed = attacker === "player" ? this.player.speed : this.enemy.speed;
        const defenderSpeed = attacker === "player" ? this.enemy.speed : this.player.speed;
        const attackerName = attacker === "player" ? this.player.name : this.enemy.name;
        const defenderName = attacker === "player" ? this.enemy.name : "tú";

        // Mensaje de ataque
        this.addCombatLogMessage(
            attacker === "player"
                ? "Has realizado un ataque ligero."
                : `${attackerName} ha realizado un ataque ligero.`,
            attacker === "player" ? "player-action" : "enemy-action"
        );

        // Retraso para leer el mensaje de ataque
        this.time.delayedCall(1000, () => {
            // Calcular si el defensor esquiva
            const dodgeChance = this.calculateDodgeChance(attackerSpeed, defenderSpeed, "light");
            if (Math.random() < dodgeChance) {
                // Ataque esquivado
                this.addCombatLogMessage(
                    attacker === "player"
                        ? `${defenderName} ha esquivado tu ataque ligero.`
                        : "Has esquivado el ataque ligero.",
                    "combat-info"
                );

                // Finalizar turno con retraso si no hay más acciones
                if (attacker === "enemy") {
                    this.time.delayedCall(1500, () => this.endTurn());
                }
            } else {
                // Ataque exitoso - aplicar daño con retraso para mejor lectura
                this.time.delayedCall(800, () => {
                    const combatEnded = this.dealDamage(attacker, "light");
                    if (combatEnded) return;

                    // Calcular si hay un segundo ataque
                    const doubleAttackChance = this.calculateDoubleAttackChance(attackerSpeed, defenderSpeed);
                    if (Math.random() < doubleAttackChance) {
                        this.time.delayedCall(1200, () => {
                            this.addCombatLogMessage(
                                attacker === "player"
                                    ? "¡Tu velocidad te permite un segundo ataque rápido!"
                                    : `¡La velocidad de ${attackerName} le permite un segundo ataque rápido!`,
                                "combat-info"
                            );

                            // Pequeña pausa antes del segundo ataque
                            this.time.delayedCall(1500, () => {
                                // Volver a calcular si esquiva el segundo ataque (mayor probabilidad)
                                const secondDodgeChance = dodgeChance * 1.2; // 20% más fácil esquivar el segundo ataque
                                if (Math.random() < secondDodgeChance) {
                                    this.addCombatLogMessage(
                                        attacker === "player"
                                            ? `${defenderName} ha esquivado tu segundo ataque.`
                                            : "Has esquivado el segundo ataque.",
                                        "combat-info"
                                    );

                                    // Finalizar turno después del intento de segundo ataque
                                    if (attacker === "enemy") {
                                        this.time.delayedCall(1800, () => this.endTurn());
                                    }
                                } else {
                                    // Implementar daño del segundo ataque con retraso
                                    this.time.delayedCall(1000, () => {
                                        // Implementar daño del segundo ataque (70% del daño original)
                                        const secondAttackEnded = this.dealDamage(attacker, "light", 0.7);
                                        if (secondAttackEnded) return;

                                        // Finalizar turno después del doble ataque completo
                                        if (attacker === "enemy") {
                                            this.time.delayedCall(1800, () => this.endTurn());
                                        }
                                    });
                                }
                            });
                        });

                        // Si es jugador, no llamamos a endTurn aquí, se manejará después
                        if (attacker === "player") return;
                    } else {
                        // Sin ataque doble, finalizar turno con retraso
                        if (attacker === "enemy") {
                            this.time.delayedCall(1500, () => this.endTurn());
                        }
                    }
                });
            }
        });
    }

    // Método para manejar ataques pesados (tanto de jugador como de enemigo)
    performHeavyAttack(attacker) {
        const attackerSpeed = attacker === "player" ? this.player.speed : this.enemy.speed;
        const defenderSpeed = attacker === "player" ? this.enemy.speed : this.player.speed;
        const attackerName = attacker === "player" ? this.player.name : this.enemy.name;
        const defenderName = attacker === "player" ? this.enemy.name : "tú";

        // Mensaje de ataque
        this.addCombatLogMessage(
            attacker === "player"
                ? "Has realizado un ataque pesado."
                : `${attackerName} ha realizado un ataque pesado.`,
            attacker === "player" ? "player-action" : "enemy-action"
        );

        // Retraso antes de resolver el ataque pesado
        this.time.delayedCall(1200, () => {
            // Calcular si el defensor esquiva
            const dodgeChance = this.calculateDodgeChance(attackerSpeed, defenderSpeed, "heavy");
            if (Math.random() < dodgeChance) {
                // Ataque esquivado
                this.addCombatLogMessage(
                    attacker === "player"
                        ? `${defenderName} ha esquivado tu ataque pesado.`
                        : `Has esquivado el ataque pesado de ${attackerName}.`,
                    "combat-info"
                );

                // Retraso para el mensaje de pérdida de equilibrio
                this.time.delayedCall(1200, () => {
                    this.addCombatLogMessage(
                        attacker === "player" ? "¡Pierdes el equilibrio!" : `¡${attackerName} pierde el equilibrio!`,
                        attacker === "player" ? "player-action" : "enemy-action"
                    );

                    // Si el atacante es el jugador, establecer una flag para saltar su siguiente turno
                    if (attacker === "player") {
                        this.player.skipNextTurn = true;
                        // Mayor tiempo de espera para que se pueda leer el mensaje
                        this.time.delayedCall(1500, () => {
                            this.addCombatLogMessage(
                                "Perderás tu próximo turno recuperando el equilibrio.",
                                "player-action"
                            );
                        });
                    } else {
                        this.enemy.skipNextTurn = true;
                        // Mayor tiempo de espera para que se pueda leer el mensaje
                        this.time.delayedCall(1500, () => {
                            this.addCombatLogMessage(
                                `${attackerName} perderá su próximo turno recuperando el equilibrio.`,
                                "enemy-action"
                            );
                        });
                    }
                });

                // Finalizar turno con un retraso mayor para leer todos los mensajes
                if (attacker === "enemy") {
                    this.time.delayedCall(3500, () => this.endTurn());
                }
            } else {
                // Retraso antes de aplicar el daño para mejor legibilidad
                this.time.delayedCall(800, () => {
                    // Ataque exitoso
                    const combatEnded = this.dealDamage(attacker, "heavy");
                    if (combatEnded) return;

                    // Finalizar turno con retraso
                    if (attacker === "enemy") {
                        this.time.delayedCall(1800, () => this.endTurn());
                    }
                });
            }
        });
    }

    dealDamage(source, attackType, damageModifier = 1.0) {
        // Determinar el daño basado en la fuente, tipo de ataque y atributos
        let damage = 0;

        if (source === "player") {
            // El jugador ataca al enemigo - usar la fuerza del jugador
            let baseDamage = attackType === "light" ? 8 : 15;

            // Aplicar multiplicador basado en la fuerza del jugador
            const strengthMultiplier = 1 + Math.max(0, (this.player.strength - 10) * 0.1);

            // Aplicar el modificador adicional (para ataques dobles, etc.)
            damage = Math.ceil(baseDamage * strengthMultiplier * damageModifier);

            // Mensaje específico para ataques con modificador (como segundos ataques)
            const damageMessage =
                damageModifier < 1.0
                    ? `Has causado ${damage} puntos de daño adicional al enemigo.`
                    : `Has causado ${damage} puntos de daño al enemigo.`;

            // Aplicar el daño al enemigo
            this.enemyCurrentHealth = Math.max(0, this.enemyCurrentHealth - damage);

            // Actualizar la barra de vida del enemigo
            this.updateHealthBar("enemy", this.enemyCurrentHealth, this.enemyMaxHealth);

            this.addCombatLogMessage(damageMessage, "combat-info");
        } else {
            // El enemigo ataca al jugador - usar la fuerza del enemigo
            let baseDamage = attackType === "light" ? 6 : 12;

            // Aplicar multiplicador basado en la fuerza del enemigo
            const enemyStrengthMultiplier = 1 + Math.max(0, (this.enemy.strength - 3) * 0.1);
            baseDamage = Math.ceil(baseDamage * enemyStrengthMultiplier);

            // Reducir el daño basado en la resistencia del jugador
            // Por ejemplo: 5% menos de daño por cada punto de resistencia por encima de 10
            const resistanceMultiplier = Math.max(0.5, 1 - Math.max(0, (this.player.resistance - 10) * 0.05));
            damage = Math.ceil(baseDamage * resistanceMultiplier);

            // Aplicar el daño al jugador
            this.playerCurrentHealth = Math.max(0, this.playerCurrentHealth - damage);

            // Actualizar la barra de vida del jugador
            this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);

            // Actualizar el texto de salud si existe
            const healthAmount = document.getElementById("health-amount");
            if (healthAmount) {
                healthAmount.textContent = this.playerCurrentHealth;
            }

            this.addCombatLogMessage(`${this.enemy.name} te ha causado ${damage} puntos de daño.`, "enemy-action");
        }

        // Verificar si el combate ha terminado después de aplicar el daño
        return this.checkCombatEnd();
    }

    healCharacter(target) {
        if (target === "player") {
            // Cantidad de curación basada en resistencia
            // 10% base + 0.5% por cada punto de resistencia
            const healPercent = 0.1 + this.player.resistance * 0.005;
            const healAmount = Math.ceil(this.playerMaxHealth * healPercent);

            // Aplicar curación
            this.playerCurrentHealth = Math.min(this.playerMaxHealth, this.playerCurrentHealth + healAmount);

            // Actualizar la barra de vida
            this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);

            // Actualizar el texto de salud si existe
            const healthAmount = document.getElementById("health-amount");
            if (healthAmount) {
                healthAmount.textContent = this.playerCurrentHealth;
            }

            this.addCombatLogMessage(`Te has curado ${healAmount} puntos de vida.`, "heal-action");
        }
    }

    endTurn() {
        this.turnCount++;
        this.isPlayerTurn = !this.isPlayerTurn;

        // Verificar si el combate ha terminado antes de continuar
        if (this.checkCombatEnd()) {
            return;
        }

        // Verificar si el jugador debe saltar su turno
        if (this.isPlayerTurn && this.player.skipNextTurn) {
            this.player.skipNextTurn = false; // Restablecer el flag
            this.addCombatLogMessage("Estás recuperando el equilibrio y pierdes tu turno.", "player-action");

            // Dar tiempo para leer el mensaje antes de ceder el turno
            this.time.delayedCall(1500, () => {
                this.isPlayerTurn = false; // Ceder el turno al enemigo
                this.time.delayedCall(1000, () => {
                    this.enemyAction();
                });
            });
            return;
        }

        // Verificar si el enemigo debe saltar su turno
        if (!this.isPlayerTurn && this.enemy.skipNextTurn) {
            this.enemy.skipNextTurn = false; // Restablecer el flag
            this.addCombatLogMessage(
                `${this.enemy.name} está recuperando el equilibrio y pierde su turno.`,
                "enemy-action"
            );

            // Dar tiempo para leer el mensaje antes de devolver el turno
            this.time.delayedCall(1500, () => {
                this.isPlayerTurn = true; // Devolver el turno al jugador
                this.enablePlayerControls();
            });
            return;
        }

        // Continuar con el siguiente turno normalmente
        if (this.isPlayerTurn) {
            this.enablePlayerControls();
        } else {
            this.disablePlayerControls();
            this.time.delayedCall(500, () => {
                this.enemyAction();
            });
        }
    }

    checkCombatEnd() {
        // Verificar si el jugador ha muerto
        if (this.playerCurrentHealth <= 0) {
            this.addCombatLogMessage("¡Has sido derrotado!", "enemy-action");
            this.time.delayedCall(1500, () => {
                // Actualizar la salud del jugador antes de salir (por ejemplo, dejarlo con 1 punto de vida)
                if (this.player) {
                    this.player.health = 1;
                }
                this.exitCombat();
            });
            return true;
        }

        // Verificar si el enemigo ha muerto
        if (this.enemyCurrentHealth <= 0) {
            // Evitar múltiples mensajes de victoria si la función se llama más de una vez
            if (!this.victoryProcessed) {
                this.victoryProcessed = true; // Marcar que ya se procesó la victoria

                this.addCombatLogMessage(`¡Has derrotado a ${this.enemy.name}!`, "player-action");

                // Recompensa de almas por victoria
                const soulsReward = 50;
                if (this.player && typeof this.player.souls !== "undefined") {
                    this.player.souls += soulsReward;
                    this.addCombatLogMessage(`Has ganado ${soulsReward} almas.`, "combat-info");

                    // Actualizar el texto de almas en el HUD
                    const soulsAmount = document.getElementById("souls-amount");
                    if (soulsAmount) {
                        soulsAmount.textContent = this.player.souls;
                    }
                }

                this.time.delayedCall(2500, () => {
                    // Actualizar la salud del jugador antes de salir
                    if (this.player) {
                        this.player.health = this.playerCurrentHealth;
                    }

                    this.exitCombat();

                    // Si el enemigo está en la escena, marcarlo como eliminado
                    if (this.enemy && typeof this.enemy.kill === "function") {
                        this.enemy.kill();
                    }
                });
            }
            return true;
        }

        return false;
    }

    exitCombat() {
        // Finalizar el combate activo
        this.combatActive = false;

        // Ocultar el contenedor de combate
        const combatContainer = document.getElementById("combat-container");
        if (combatContainer) {
            combatContainer.classList.add("hidden");
        }

        // Limpiar el log de combate
        const combatLog = document.getElementById("combat-log");
        if (combatLog) {
            // Mantener solo el primer mensaje inicial
            const firstMessage = combatLog.querySelector(".console-message");
            while (combatLog.childElementCount > 1) {
                combatLog.removeChild(combatLog.lastChild);
            }
        }

        // Mostrar HUD
        document.getElementById("hud-container").classList.remove("hidden");

        // Reanudar la escena del juego
        this.scene.resume("GameScene");
        this.scene.stop();
    }
}
