import { COMBAT } from "../config/constants.js";

export default class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: "CombatScene" });

        // Objetos Player y Enemy
        this.player = null;
        this.enemy = null;

        // Variables combate
        this.isPlayerTurn = true;
        this.combatActive = false;

        // Variable para rastrear si el jugador está bloqueando
        this.playerIsBlocking = false;
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

        // Inicializar variable de aturdimiento del enemigo
        this.enemy.stunned = 0;
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
    }

    startCombat() {
        // Inicializar variables de combate
        this.combatActive = true;

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

        // Actualizar contador de pociones
        this.updatePotionCounter();

        // Añadir animaciones de Player
        this.setupPlayerAnimations();

        // Añadir animaciones del enemigo
        this.setupEnemyAnimations();
    }

    // Nuevo método para actualizar el contador de pociones
    updatePotionCounter() {
        const potionCounter = document.getElementById("potion-counter");
        let potionItem = this.player.inventory.getItemData("pocion-salud");
        let potionCount = potionItem ? potionItem.quantity : 0;

        potionCounter.textContent = potionCount;

        // Deshabilitar el botón de curación si no hay pociones
        const healButton = document.querySelector(".combat-button.heal");
        if (healButton) {
            healButton.disabled = potionCount <= 0;
            if (potionCount <= 0) {
                healButton.classList.add("disabled");
            } else {
                healButton.classList.remove("disabled");
            }
        }
    }

    // Configurar sistema de animaciones para el jugador
    setupPlayerAnimations() {
        const animContainer = document.getElementById("player-animation-container");
        // Limpiar cualquier contenido previo
        while (animContainer.firstChild) {
            animContainer.removeChild(animContainer.firstChild);
        }

        // Crear un div para el nuevo juego Phaser
        const animDiv = document.createElement("div");
        animDiv.id = "player-anim-game";

        // Configurar estilos para que ocupe todo el espacio disponible
        animDiv.style.display = "flex";
        animDiv.style.justifyContent = "center";
        animDiv.style.alignItems = "center";

        animContainer.appendChild(animDiv);

        // Obtener las dimensiones actuales del contenedor
        const containerWidth = animContainer.clientWidth || 100;
        const containerHeight = animContainer.clientHeight || 100;

        // Configuración del nuevo juego Phaser
        const animConfig = {
            type: Phaser.AUTO,
            width: containerWidth,
            height: containerHeight,
            transparent: true,
            parent: "player-anim-game",
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },

            scene: {
                preload: function () {
                    this.load.spritesheet("player-combat", this.game.mainScene.player.spritesheet, {
                        frameWidth: 96,
                        frameHeight: 96,
                    });
                },
                create: function () {
                    // Referencia a la escena principal (para acceder desde métodos)
                    this.mainScene = this.game.mainScene;

                    // Crear manualmente las animaciones para este contexto específico
                    this.anims.create({
                        key: "idle",
                        frames: this.anims.generateFrameNumbers("player-combat", { start: 0, end: 5 }),
                        frameRate: 10,
                        repeat: -1,
                        repeatDelay: 5000,
                    });

                    this.anims.create({
                        key: "walk",
                        frames: this.anims.generateFrameNumbers("player-combat", { start: 6, end: 11 }),
                        frameRate: 10,
                        repeat: -1,
                    });

                    this.anims.create({
                        key: "hit",
                        frames: this.anims.generateFrameNumbers("player-combat", { start: 48, end: 53 }),
                        frameRate: 8,
                        repeat: 0,
                    });

                    this.anims.create({
                        key: "light-attack",
                        frames: this.anims.generateFrameNumbers("player-combat", { start: 18, end: 23 }),
                        frameRate: 8,
                        repeat: 0,
                    });

                    this.anims.create({
                        key: "heavy-attack",
                        frames: this.anims.generateFrameNumbers("player-combat", { start: 12, end: 17 }),
                        frameRate: 8,
                        repeat: 0,
                    });

                    this.anims.create({
                        key: "death",
                        frames: this.anims.generateFrameNumbers("player-combat", { start: 48, end: 59 }),
                        frameRate: 5,
                        repeat: 0,
                    });

                    // Ajustar el sprite al centro de la escala actual
                    this.playerSprite = this.add.sprite(
                        this.cameras.main.width / 2,
                        this.cameras.main.height / 2,
                        "player-combat"
                    );

                    // Hacer el sprite considerablemente más grande
                    this.playerSprite.setScale(1.5);

                    // Reproducir animación por defecto
                    this.playerSprite.play("idle");
                },
            },
        };

        // Iniciar el juego secundario para la animación
        this.playerAnimGame = new Phaser.Game(animConfig);

        // Guardar referencia para poder acceder desde los métodos de la escena de combate
        this.playerAnimGame.mainScene = this;

        // Agregar un listener para redimensionar el juego si cambia el tamaño del contenedor
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === animContainer && this.playerAnimGame) {
                    this.playerAnimGame.scale.resize(entry.contentRect.width, entry.contentRect.height);
                }
            }
        });

        // Observar cambios en el contenedor
        resizeObserver.observe(animContainer);
    }

    // Método para reproducir una animación específica
    playPlayerAnimation(animType) {
        // Verificar que el juego de animación esté inicializado
        if (!this.playerAnimGame || !this.playerAnimGame.scene.scenes[0]) {
            console.warn("El sistema de animación no está inicializado");
            return;
        }

        const scene = this.playerAnimGame.scene.scenes[0];

        // Verificar que el sprite del jugador exista
        if (!scene.playerSprite) {
            console.warn("El sprite del jugador no está inicializado");
            return;
        }

        // Reproducir la animación solicitada o la animación por defecto si el tipo no existe
        const validTypes = ["hit", "idle", "light-attack", "heavy-attack", "death"];
        const animationType = validTypes.includes(animType) ? animType : "idle"; // Usar idle como fallback

        scene.playerSprite.play(animationType);
    }

    // Configurar sistema de animaciones para el enemigo
    setupEnemyAnimations() {
        const animContainer = document.getElementById("enemy-animation-container");
        // Limpiar cualquier contenido previo
        while (animContainer.firstChild) {
            animContainer.removeChild(animContainer.firstChild);
        }

        // Crear un div para el nuevo juego Phaser
        const animDiv = document.createElement("div");
        animDiv.id = "enemy-anim-game";

        // Configurar estilos para que ocupe todo el espacio disponible
        animDiv.style.display = "flex";
        animDiv.style.justifyContent = "center";
        animDiv.style.alignItems = "center";

        animContainer.appendChild(animDiv);

        // Obtener las dimensiones actuales del contenedor
        const containerWidth = animContainer.clientWidth || 100;
        const containerHeight = animContainer.clientHeight || 100;

        // Configuración del nuevo juego Phaser
        const animConfig = {
            type: Phaser.AUTO,
            width: containerWidth,
            height: containerHeight,
            transparent: true,
            parent: "enemy-anim-game",
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            scene: {
                preload: function () {
                    // Usar el spritesheet del enemigo desde su propiedad
                    this.load.spritesheet("enemy-combat", this.game.mainScene.enemy.spritesheet, {
                        frameWidth: 96,
                        frameHeight: 96,
                    });
                },
                create: function () {
                    // Referencia a la escena principal (para acceder desde métodos)
                    this.mainScene = this.game.mainScene;

                    // Crear las animaciones necesarias usando el tipo del enemigo como prefijo
                    const enemyType = this.mainScene.enemy.type;

                    // Crear mapeo entre las animaciones de combate y las del enemigo
                    this.animationMap = {
                        idle: `${enemyType}-idle`,
                        walk: `${enemyType}-walk`,
                        hit: `${enemyType}-hit`,
                        "light-attack": `${enemyType}-light-attack`,
                        "heavy-attack": `${enemyType}-heavy-attack`,
                        death: `${enemyType}-death`,
                    };

                    // Obtener las configuraciones de animación del enemigo si están disponibles
                    const animConfigs = this.mainScene.enemy.getAnimationConfigs
                        ? this.mainScene.enemy.getAnimationConfigs()
                        : null;

                    if (animConfigs) {
                        // Usar las configuraciones específicas del enemigo
                        Object.keys(animConfigs).forEach((animKey) => {
                            const config = animConfigs[animKey];
                            this.anims.create({
                                key: animKey,
                                frames: this.anims.generateFrameNumbers("enemy-combat", {
                                    start: config.start,
                                    end: config.end,
                                }),
                                frameRate: config.frameRate,
                                repeat: config.repeat,
                            });
                        });
                    } else {
                        // Fallback con las animaciones genéricas (código anterior)
                        this.anims.create({
                            key: "idle",
                            frames: this.anims.generateFrameNumbers("enemy-combat", { start: 0, end: 5 }),
                            frameRate: 5,
                            repeat: -1,
                        });

                        this.anims.create({
                            key: "walk",
                            frames: this.anims.generateFrameNumbers("enemy-combat", { start: 0, end: 5 }),
                            frameRate: 10,
                            repeat: -1,
                        });

                        this.anims.create({
                            key: "hit",
                            frames: this.anims.generateFrameNumbers("enemy-combat", { start: 18, end: 23 }),
                            frameRate: 8,
                            repeat: 0,
                        });

                        this.anims.create({
                            key: "light-attack",
                            frames: this.anims.generateFrameNumbers("enemy-combat", { start: 12, end: 17 }),
                            frameRate: 8,
                            repeat: 0,
                        });

                        this.anims.create({
                            key: "heavy-attack",
                            frames: this.anims.generateFrameNumbers("enemy-combat", { start: 12, end: 17 }),
                            frameRate: 8,
                            repeat: 0,
                        });

                        this.anims.create({
                            key: "death",
                            frames: this.anims.generateFrameNumbers("enemy-combat", { start: 24, end: 29 }),
                            frameRate: 5,
                            repeat: 0,
                        });
                    }

                    // Ajustar el sprite al centro de la escala actual
                    this.enemySprite = this.add.sprite(
                        this.cameras.main.width / 2,
                        this.cameras.main.height / 2,
                        "enemy-combat"
                    );

                    // Hacer el sprite considerablemente más grande
                    this.enemySprite.setScale(1.5);

                    // Voltear el sprite horizontalmente (efecto espejo)
                    this.enemySprite.flipX = true;

                    // Reproducir animación por defecto
                    this.enemySprite.play("idle");
                },
            },
        };

        // Iniciar el juego secundario para la animación
        this.enemyAnimGame = new Phaser.Game(animConfig);

        // Guardar referencia para poder acceder desde los métodos de la escena de combate
        this.enemyAnimGame.mainScene = this;

        // Agregar un listener para redimensionar el juego si cambia el tamaño del contenedor
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === animContainer && this.enemyAnimGame) {
                    this.enemyAnimGame.scale.resize(entry.contentRect.width, entry.contentRect.height);
                }
            }
        });

        // Observar cambios en el contenedor
        resizeObserver.observe(animContainer);
    }

    // Método para reproducir una animación específica del enemigo
    playEnemyAnimation(animType) {
        // Verificar que el juego de animación esté inicializado
        if (!this.enemyAnimGame || !this.enemyAnimGame.scene.scenes[0]) {
            console.warn("El sistema de animación del enemigo no está inicializado");
            return;
        }

        const scene = this.enemyAnimGame.scene.scenes[0];

        // Verificar que el sprite del enemigo exista
        if (!scene.enemySprite) {
            console.warn("El sprite del enemigo no está inicializado");
            return;
        }

        // Reproducir la animación solicitada o la animación por defecto si el tipo no existe
        const validTypes = ["hit", "idle", "light-attack", "heavy-attack", "death"];
        const animationType = validTypes.includes(animType) ? animType : "idle"; // Usar idle como fallback

        scene.enemySprite.play(animationType);
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

        // Bloquear
        const blockBtn = document.querySelector(".combat-button.dodge");
        if (blockBtn) {
            blockBtn.addEventListener("click", () => {
                // Verificar explícitamente si es el turno del jugador antes de procesar
                if (this.isPlayerTurn && this.combatActive && !blockBtn.disabled) {
                    this.handleBlock();
                }
            });
        }
    }

    handleAttackLight() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar controles para evitar múltiples acciones
        this.disablePlayerControls();

        // Reproducir animación de ataque ligero
        this.playPlayerAnimation("light-attack");

        // Ejecutar ataque ligero
        this.addCombatLogMessage("Has realizado un ataque rápido.", "player-action");

        // Calcular probabilidad de acierto basada en velocidad
        const speedDifference = this.player.speed - this.enemy.speed;
        const hitChance = COMBAT.LIGHT_ATTACK.BASE_HIT_CHANCE + speedDifference * COMBAT.LIGHT_ATTACK.SPEED_HIT_BONUS;
        const roll = Math.random();

        // Verificar si el ataque acierta
        if (roll <= hitChance) {
            // Calcular daño base según velocidad
            let damage = Math.ceil(this.player.speed * COMBAT.LIGHT_ATTACK.DAMAGE_MULTIPLIER);

            // Verificar si es golpe crítico (si la diferencia de velocidad supera el umbral)
            let isCritical = false;
            if (speedDifference >= COMBAT.LIGHT_ATTACK.CRITICAL_THRESHOLD) {
                damage = Math.ceil(damage * COMBAT.LIGHT_ATTACK.CRITICAL_MULTIPLIER);
                isCritical = true;
            }

            // Aplicar daño
            this.enemyCurrentHealth = Math.max(0, this.enemyCurrentHealth - damage);
            this.updateHealthBar("enemy", this.enemyCurrentHealth, this.enemyMaxHealth);

            // Mostrar mensaje según si fue crítico o no
            if (isCritical) {
                this.addCombatLogMessage(`¡CRÍTICO! Has causado ${damage} puntos de daño al enemigo.`, "critical-hit");
            } else {
                this.addCombatLogMessage(`Has causado ${damage} puntos de daño al enemigo.`, "combat-info");
            }

            // Verificar si el combate ha terminado después de aplicar daño
            const combatEnded = this.checkCombatEnd();

            // Solo continuar con las animaciones si el combate no ha terminado
            if (!combatEnded) {
                // Reproducir animación de golpe recibido
                this.time.delayedCall(300, () => {
                    this.playEnemyAnimation("hit");
                });

                // Esperar a que termine la animación antes de finalizar el turno
                this.time.delayedCall(1000, () => {
                    // Volver a la animación de idle
                    this.playPlayerAnimation("idle");
                    this.playEnemyAnimation("idle");

                    // Finalizar turno después de un momento adicional
                    this.time.delayedCall(500, () => {
                        this.endTurn();
                    });
                });
            }
        } else {
            // El ataque falla
            this.addCombatLogMessage("Tu ataque ha fallado.", "combat-info");

            // Esperar a que termine la animación antes de finalizar el turno
            this.time.delayedCall(1000, () => {
                // Volver a la animación de idle
                this.playPlayerAnimation("idle");

                // Finalizar turno después de un momento adicional
                this.time.delayedCall(500, () => {
                    this.endTurn();
                });
            });
        }
    }

    handleAttackHeavy() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar controles para evitar múltiples acciones
        this.disablePlayerControls();

        // Reproducir animación de ataque pesado
        this.playPlayerAnimation("heavy-attack");

        // Ejecutar ataque pesado
        this.addCombatLogMessage("Has realizado un ataque pesado.", "player-action");

        // Calcular probabilidad de acierto basada en velocidad
        const speedDifference = this.player.speed - this.enemy.speed;
        const hitChance = COMBAT.HEAVY_ATTACK.BASE_HIT_CHANCE + speedDifference * COMBAT.HEAVY_ATTACK.SPEED_HIT_BONUS;
        const roll = Math.random();

        // Verificar si el ataque acierta
        if (roll <= hitChance) {
            // Calcular daño basado en fuerza
            const damage = Math.ceil(this.player.strength * COMBAT.HEAVY_ATTACK.DAMAGE_MULTIPLIER);

            // Aplicar daño
            this.enemyCurrentHealth = Math.max(0, this.enemyCurrentHealth - damage);
            this.updateHealthBar("enemy", this.enemyCurrentHealth, this.enemyMaxHealth);
            this.addCombatLogMessage(`Has causado ${damage} puntos de daño al enemigo.`, "combat-info");

            // Verificar si el combate ha terminado después de aplicar daño
            const combatEnded = this.checkCombatEnd();

            // Solo continuar con las animaciones y el efecto de aturdimiento si el combate no ha terminado
            if (!combatEnded) {
                // Reproducir animación de golpe recibido
                this.time.delayedCall(300, () => {
                    this.playEnemyAnimation("hit");
                });

                // Calcular probabilidad de aturdimiento
                const strengthDifference = this.player.strength - this.enemy.strength;
                const stunChance =
                    COMBAT.HEAVY_ATTACK.BASE_STUN_CHANCE + strengthDifference * COMBAT.HEAVY_ATTACK.STRENGTH_STUN_BONUS;
                const stunRoll = Math.random();

                // Verificar si el enemigo queda aturdido
                if (stunRoll <= stunChance) {
                    // El enemigo queda aturdido
                    this.enemy.stunned = COMBAT.HEAVY_ATTACK.STUN_DURATION; // Duración del aturdimiento en turnos
                    this.addCombatLogMessage(
                        `¡El enemigo ha quedado aturdido durante ${this.enemy.stunned} turno!`,
                        "critical-hit"
                    );
                }

                // Esperar a que termine la animación antes de finalizar el turno
                this.time.delayedCall(1000, () => {
                    // Volver a la animación de idle
                    this.playPlayerAnimation("idle");
                    this.playEnemyAnimation("idle");

                    // Finalizar turno después de un momento adicional
                    this.time.delayedCall(500, () => {
                        this.endTurn();
                    });
                });
            }
        } else {
            // El ataque falla
            this.addCombatLogMessage("Tu ataque pesado ha fallado. Has perdido el turno.", "combat-info");

            // Esperar a que termine la animación antes de finalizar el turno
            this.time.delayedCall(1000, () => {
                // Volver a la animación de idle
                this.playPlayerAnimation("idle");

                // Finalizar turno después de un momento adicional
                this.time.delayedCall(500, () => {
                    this.endTurn();
                });
            });
        }
    }

    handleHeal() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Comprobar si el jugador tiene pociones
        const potionItem = this.player.inventory.getItemData("pocion-salud");
        if (!potionItem || potionItem.quantity <= 0) {
            this.addCombatLogMessage("¡No tienes pociones de salud!", "combat-info");
            return;
        }

        // Verificar si la salud ya está al máximo
        if (this.playerCurrentHealth >= this.playerMaxHealth) {
            // Mostrar mensaje especial
            this.addCombatLogMessage(
                "¡Wow! Has malgastado una poción con la vida al máximo, así no funciona",
                "combat-info"
            );

            // Consumir una poción de todos modos
            this.player.deleteItem("pocion-salud");

            // Actualizar contador de pociones
            this.updatePotionCounter();

            // Finalizar turno después de un momento
            this.time.delayedCall(1000, () => {
                this.endTurn();
            });
            return;
        }

        // Desactivar controles para evitar múltiples acciones
        this.disablePlayerControls();

        // Aplicar la nueva fórmula de curación
        const healAmount = Math.ceil(this.playerMaxHealth * 0.2 + this.player.resistance * 2);

        // Aplicar curación
        this.playerCurrentHealth = Math.min(this.playerMaxHealth, this.playerCurrentHealth + healAmount);
        this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);
        this.addCombatLogMessage(`Has usado una poción y recuperado ${healAmount} puntos de vida.`, "heal-action");

        // Consumir una poción
        this.player.deleteItem("pocion-salud");

        // Actualizar contador de pociones
        this.updatePotionCounter();

        // Finalizar turno después de que termine la animación
        this.time.delayedCall(1000, () => {
            // Volver a la animación de idle
            this.playPlayerAnimation("idle");
            // Finalizar turno después de un momento adicional
            this.time.delayedCall(500, () => {
                this.endTurn();
            });
        });
    }

    // Nuevo método para manejar la acción de bloqueo
    handleBlock() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar controles para evitar múltiples acciones
        this.disablePlayerControls();

        // Activar el estado de bloqueo
        this.playerIsBlocking = true;

        // Mostrar mensaje de que el jugador está bloqueando
        this.addCombatLogMessage("Te preparas para bloquear el próximo ataque del enemigo.", "player-action");

        // Volver a la animación de idle (podría agregarse una animación específica de bloqueo en el futuro)
        this.playPlayerAnimation("idle");

        // Finalizar el turno después de un momento
        this.time.delayedCall(1000, () => {
            this.endTurn();
        });
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

    enemyAction() {
        if (!this.combatActive) return;

        // Añadir retraso para mejorar la legibilidad
        this.time.delayedCall(1000, () => {
            this.addCombatLogMessage("Turno del enemigo...", "enemy-turn");

            // Verificar si el enemigo está aturdido
            if (this.enemy.stunned && this.enemy.stunned > 0) {
                this.addCombatLogMessage(`${this.enemy.name} está aturdido y no puede actuar.`, "enemy-action");
                this.enemy.stunned--; // Reducir duración del aturdimiento

                // Desactivar el estado de bloqueo si estaba activado, ya que no hubo ataque
                if (this.playerIsBlocking) {
                    this.playerIsBlocking = false;
                    this.addCombatLogMessage("Mantienes tu postura de bloqueo, pero no fue necesaria.", "combat-info");
                }

                // Esperar un momento y finalizar el turno
                this.time.delayedCall(1500, () => {
                    this.endTurn();
                });
                return;
            }

            // Añadir un delay adicional para dar tiempo a leer el mensaje antes de realizar la acción
            this.time.delayedCall(1500, () => {
                // El enemigo ataca
                this.addCombatLogMessage(`${this.enemy.name} te ha atacado.`, "enemy-action");

                // Reproducir animación de ataque del enemigo
                this.playEnemyAnimation("attack");

                // Comprobar si el jugador está bloqueando
                if (this.playerIsBlocking) {
                    // Calcular la probabilidad de bloqueo total basada en resistencia
                    const resistance = this.player.resistance;
                    let totalBlockChance =
                        COMBAT.BLOCK.BASE_TOTAL_BLOCK_CHANCE + resistance * COMBAT.BLOCK.RESISTANCE_BLOCK_BONUS;

                    // Limitar la probabilidad máxima de bloqueo total
                    totalBlockChance = Math.min(totalBlockChance, COMBAT.BLOCK.MAX_TOTAL_BLOCK_CHANCE);

                    // Mostrar información sobre la probabilidad de bloqueo
                    const blockPercentage = Math.round(totalBlockChance * 100);
                    this.addCombatLogMessage(`Probabilidad de bloqueo total: ${blockPercentage}%`, "combat-info");

                    // Tirar los dados para ver si el bloqueo es total
                    const roll = Math.random();

                    if (roll <= totalBlockChance) {
                        // ¡Bloqueo total exitoso!
                        this.addCombatLogMessage("¡Has bloqueado completamente el ataque!", "critical-hit");

                        // No reproducir animación de daño para el jugador
                        // En su lugar, preparar el contraataque
                        this.time.delayedCall(500, () => {
                            this.handleCounterAttack();
                        });
                    } else {
                        // Bloqueo parcial - reducir el daño
                        const baseDamage = this.enemy.strength;

                        // Calcular reducción de daño
                        let damageReduction =
                            COMBAT.BLOCK.BASE_DAMAGE_REDUCTION +
                            (this.player.defense || 0) * COMBAT.BLOCK.DEFENSE_REDUCTION_BONUS +
                            this.player.resistance * COMBAT.BLOCK.RESISTANCE_REDUCTION_BONUS;

                        // Limitar la reducción máxima de daño
                        damageReduction = Math.min(damageReduction, COMBAT.BLOCK.MAX_DAMAGE_REDUCTION);

                        // Calcular daño final
                        const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - damageReduction)));

                        // Mostrar animación de daño para el jugador (menos intensa)
                        this.playPlayerAnimation("hit");

                        // Aplicar daño reducido
                        this.playerCurrentHealth = Math.max(0, this.playerCurrentHealth - finalDamage);
                        this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);

                        // Mostrar mensaje de bloqueo parcial
                        const reducedPercent = Math.round(damageReduction * 100);
                        this.addCombatLogMessage(
                            `Has bloqueado parcialmente el ataque, reduciendo el daño en un ${reducedPercent}%.`,
                            "combat-info"
                        );
                        this.addCombatLogMessage(
                            `Has recibido ${finalDamage} puntos de daño (reducido de ${baseDamage}).`,
                            "enemy-action"
                        );

                        // Resetear el estado de bloqueo
                        this.playerIsBlocking = false;

                        // Verificar fin de combate
                        if (!this.checkCombatEnd()) {
                            // Esperar a que termine la animación de daño
                            this.time.delayedCall(1000, () => {
                                // Volver a animación idle
                                this.playPlayerAnimation("idle");
                                this.playEnemyAnimation("idle");
                                // Finalizar turno
                                this.time.delayedCall(500, () => {
                                    this.endTurn();
                                });
                            });
                        }
                    }
                } else {
                    // El jugador no está bloqueando, aplicar daño normal
                    const damage = this.enemy.strength;

                    // Mostrar animación de jugador recibiendo daño
                    this.playPlayerAnimation("hit");

                    // Aplicar daño
                    this.playerCurrentHealth = Math.max(0, this.playerCurrentHealth - damage);
                    this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);
                    this.addCombatLogMessage(`Has recibido ${damage} puntos de daño.`, "enemy-action");

                    // Verificar fin de combate
                    if (!this.checkCombatEnd()) {
                        // Esperar a que termine la animación de daño/ataque
                        this.time.delayedCall(1000, () => {
                            // Volver a la animación de idle para ambos
                            this.playPlayerAnimation("idle");
                            this.playEnemyAnimation("idle");
                            // Finalizar turno del enemigo
                            this.time.delayedCall(500, () => {
                                this.endTurn();
                            });
                        });
                    }
                }
            });
        });
    }

    // Método para manejar el contraataque cuando el bloqueo es total
    handleCounterAttack() {
        // Mostrar mensaje de contraataque
        this.addCombatLogMessage("¡Contraatacas con un movimiento rápido!", "player-action");

        // Reproducir animación de ataque ligero
        this.playPlayerAnimation("light-attack");

        // Calcular daño del contraataque usando la fórmula específica
        const counterDamage = Math.ceil(
            this.player.speed * COMBAT.BLOCK.COUNTER_ATTACK_DAMAGE_SPEED +
                this.player.strength * COMBAT.BLOCK.COUNTER_ATTACK_DAMAGE_STRENGTH
        );

        // Aplicar daño al enemigo
        this.enemyCurrentHealth = Math.max(0, this.enemyCurrentHealth - counterDamage);
        this.updateHealthBar("enemy", this.enemyCurrentHealth, this.enemyMaxHealth);

        // Reproducir animación de golpe recibido por el enemigo
        this.playEnemyAnimation("hit");

        // Mostrar mensaje de daño
        this.addCombatLogMessage(`Tu contraataque ha causado ${counterDamage} puntos de daño.`, "critical-hit");

        // Resetear el estado de bloqueo
        this.playerIsBlocking = false;

        // Verificar si el combate ha terminado después del contraataque
        if (!this.checkCombatEnd()) {
            // Esperar a que termine la animación
            this.time.delayedCall(1000, () => {
                // Volver a animaciones idle
                this.playPlayerAnimation("idle");
                this.playEnemyAnimation("idle");

                // Finalizar turno
                this.time.delayedCall(500, () => {
                    this.endTurn();
                });
            });
        }
    }

    endTurn() {
        this.isPlayerTurn = !this.isPlayerTurn;

        // Verificar si el combate ha terminado antes de continuar
        if (this.checkCombatEnd()) {
            return;
        }

        // Continuar con el siguiente turno
        if (this.isPlayerTurn) {
            this.enablePlayerControls();
            this.addCombatLogMessage("Tu turno, elige una acción.", "player-turn");
        } else {
            this.enemyAction();
        }
    }

    checkCombatEnd() {
        // Verificar si el jugador ha muerto
        if (this.playerCurrentHealth <= 0) {
            // Reproducir animación de muerte
            this.playPlayerAnimation("death");
            this.addCombatLogMessage("¡Has sido derrotado!", "enemy-action");

            // Tiempo antes de cerrar escena
            this.time.delayedCall(2500, () => {
                this.exitCombat();
            });

            return true; // El combate ha terminado
        }

        // Verificar si el enemigo ha muerto
        if (this.enemyCurrentHealth <= 0) {
            // Reproducir animación de muerte para el enemigo
            this.playEnemyAnimation("death");
            this.addCombatLogMessage(`¡Has derrotado a ${this.enemy.name}!`, "player-action");

            // Otorgar almas al jugador
            this.player.souls += this.enemy.souls;

            // Actualizar el HUD de almas
            const soulsAmount = document.getElementById("souls-amount");
            if (soulsAmount) {
                soulsAmount.textContent = this.player.souls;
            }

            // Mostrar mensaje de recompensa en amarillo
            this.addCombatLogMessage(`¡Has obtenido ${this.enemy.souls} almas!`, "souls-reward");

            // Tiempo antes de cerrar escena
            this.time.delayedCall(3000, () => {
                this.enemy.kill();
                this.exitCombat();
            });

            return true; // El combate ha terminado
        }

        return false; // El combate continúa
    }

    exitCombat() {
        // Finalizar el combate activo
        this.combatActive = false;

        // Limpiar eventos y restablecer variables
        this.cleanupListeners();

        // Resetear variables de estado
        this.isPlayerTurn = true;

        // Asegurarse de que la vida actual del jugador esté actualizada en el objeto del jugador
        if (this.player) {
            this.player.health = this.playerCurrentHealth;

            // Actualizar el HUD con la vida actual del jugador
            const healthAmount = document.getElementById("health-amount");
            if (healthAmount) {
                healthAmount.textContent = this.playerCurrentHealth;
            }

            // Actualizar la barra de progreso del HUD
            const hudProgressBar = document.querySelector(".hud-progress");
            if (hudProgressBar) {
                const healthPercent = Math.max(
                    0,
                    Math.min((this.playerCurrentHealth / this.playerMaxHealth) * 100, 100)
                );
                hudProgressBar.style.width = `${healthPercent}%`;
            }
        }

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
    }

    cleanupListeners() {
        // Eliminar listeners de botones
        const attackLightBtn = document.querySelector(".combat-button.attack-light");
        const attackHeavyBtn = document.querySelector(".combat-button.attack-heavy");
        const healBtn = document.querySelector(".combat-button.heal");
        const dodgeBtn = document.querySelector(".combat-button.dodge");

        // Clonar y reemplazar cada botón para eliminar todos los listeners asociados
        if (attackLightBtn) {
            const newBtn = attackLightBtn.cloneNode(true);
            attackLightBtn.parentNode.replaceChild(newBtn, attackLightBtn);
        }

        if (attackHeavyBtn) {
            const newBtn = attackHeavyBtn.cloneNode(true);
            attackHeavyBtn.parentNode.replaceChild(newBtn, attackHeavyBtn);
        }

        if (healBtn) {
            const newBtn = healBtn.cloneNode(true);
            healBtn.parentNode.replaceChild(newBtn, healBtn);
        }

        if (dodgeBtn) {
            const newBtn = dodgeBtn.cloneNode(true);
            dodgeBtn.parentNode.replaceChild(newBtn, dodgeBtn);
        }

        // Habilitar los botones para el próximo combate
        const buttons = document.querySelectorAll(".combat-button");
        buttons.forEach((button) => {
            button.disabled = false;
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
        });
    }
}
