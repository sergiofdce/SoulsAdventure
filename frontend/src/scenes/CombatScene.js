export default class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: "CombatScene" });

        // Objetos Player y Enemy
        this.player = null;
        this.enemy = null;

        // Variables combate
        this.isPlayerTurn = true;
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

        // Añadir animaciones de Player
        this.setupPlayerAnimations();

        // Añadir animaciones del enemigo
        this.setupEnemyAnimations();
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
                    this.load.spritesheet("player-combat", "./assets/player/player.png", {
                        frameWidth: 96,
                        frameHeight: 96,
                    });
                },
                create: function () {
                    // Referencia a la escena principal (para acceder desde métodos)
                    this.mainScene = this.game.mainScene;

                    // Definir todas las animaciones disponibles

                    this.anims.create({
                        key: "idle",
                        frames: this.anims.generateFrameNumbers("player-combat", { start: 0, end: 5 }),
                        frameRate: 8,
                        repeat: -1,
                        repeatDelay: 3000,
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

                    this.anims.create({
                        key: "dash",
                        frames: this.anims.generateFrameNumbers("player-combat", { start: 60, end: 63 }),
                        frameRate: 8,
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

                    // Definir todas las animaciones disponibles
                    this.anims.create({
                        key: "idle",
                        frames: this.anims.generateFrameNumbers("enemy-combat", { start: 0, end: 5 }),
                        frameRate: 8,
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

                    this.anims.create({
                        key: "dash",
                        frames: this.anims.generateFrameNumbers("enemy-combat", { start: 6, end: 11 }),
                        frameRate: 8,
                        repeat: 0,
                    });

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
            type === "player";
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
                    //this.handleHeal();
                }
            });
        }

        // Huir
        const dodgeBtn = document.querySelector(".combat-button.dodge");
        if (dodgeBtn) {
        }
    }

    handleAttackLight() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar controles para evitar múltiples acciones
        this.disablePlayerControls();

        // Reproducir animación de ataque ligero
        this.playPlayerAnimation("light-attack");

        // Ejecutar ataque ligero
        this.addCombatLogMessage("Has realizado un ataque ligero.", "player-action");
        // Calcular y aplicar daño
        const damage = Math.ceil(8 * (1 + Math.max(0, (this.player.strength - 10) * 0.1)));
        this.enemyCurrentHealth = Math.max(0, this.enemyCurrentHealth - damage);
        this.updateHealthBar("enemy", this.enemyCurrentHealth, this.enemyMaxHealth);
        this.addCombatLogMessage(`Has causado ${damage} puntos de daño al enemigo.`, "combat-info");

        // Verificar fin de combate antes de programar la animación de hit
        if (!this.checkCombatEnd()) {
            // Reproducir animación de golpe recibido solo si el enemigo sigue vivo
            this.time.delayedCall(300, () => {
                if (!this.checkCombatEnd()) {
                    this.playEnemyAnimation("hit");
                }
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
    }

    handleAttackHeavy() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar controles para evitar múltiples acciones
        this.disablePlayerControls();

        // Reproducir animación de ataque pesado
        this.playPlayerAnimation("heavy-attack");

        // Ejecutar ataque pesado
        this.addCombatLogMessage("Has realizado un ataque pesado.", "player-action");
        // Calcular y aplicar daño (más alto que el ataque ligero)
        const damage = Math.ceil(15 * (1 + Math.max(0, (this.player.strength - 10) * 0.1)));
        this.enemyCurrentHealth = Math.max(0, this.enemyCurrentHealth - damage);
        this.updateHealthBar("enemy", this.enemyCurrentHealth, this.enemyMaxHealth);
        this.addCombatLogMessage(`Has causado ${damage} puntos de daño al enemigo.`, "combat-info");

        // Verificar fin de combate antes de programar la animación de hit
        if (!this.checkCombatEnd()) {
            // Reproducir animación de golpe recibido solo si el enemigo sigue vivo
            this.time.delayedCall(300, () => {
                if (!this.checkCombatEnd()) {
                    this.playEnemyAnimation("hit");
                }
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
    }

    handleHeal() {
        if (!this.isPlayerTurn || !this.combatActive) return;

        // Desactivar controles para evitar múltiples acciones
        this.disablePlayerControls();

        // Reproducir una animación apropiada para curación (podemos usar dash como aproximación)
        this.playPlayerAnimation("dash");

        // Calcular curación basada en resistencia
        const healPercent = 0.1 + this.player.resistance * 0.005;
        const healAmount = Math.ceil(this.playerMaxHealth * healPercent);

        // Aplicar curación
        this.playerCurrentHealth = Math.min(this.playerMaxHealth, this.playerCurrentHealth + healAmount);
        this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);
        this.addCombatLogMessage(`Te has curado ${healAmount} puntos de vida.`, "heal-action");

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

            // Añadir un delay adicional para dar tiempo a leer el mensaje antes de realizar la acción
            this.time.delayedCall(1500, () => {
                // El enemigo solo puede elegir entre ataque ligero y pesado
                const action = Math.random() < 0.5 ? "light" : "heavy";

                if (action === "light") {
                    // Ataque ligero del enemigo
                    this.addCombatLogMessage(`${this.enemy.name} ha realizado un ataque ligero.`, "enemy-action");
                    // Reproducir animación de ataque ligero
                    this.playEnemyAnimation("light-attack");
                    // Calcular daño
                    const baseDamage = 6;
                    const enemyStrengthMultiplier = 1 + Math.max(0, (this.enemy.strength - 3) * 0.1);
                    const resistanceMultiplier = Math.max(0.5, 1 - Math.max(0, (this.player.resistance - 10) * 0.05));
                    const damage = Math.ceil(baseDamage * enemyStrengthMultiplier * resistanceMultiplier);
                    // Mostrar animación de jugador recibiendo daño
                    this.playPlayerAnimation("hit");
                    // Aplicar daño
                    this.playerCurrentHealth = Math.max(0, this.playerCurrentHealth - damage);
                    this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);
                    this.addCombatLogMessage(`Has recibido ${damage} puntos de daño.`, "enemy-action");
                } else {
                    // Ataque pesado del enemigo
                    this.addCombatLogMessage(`${this.enemy.name} ha realizado un ataque pesado.`, "enemy-action");
                    // Reproducir animación de ataque pesado
                    this.playEnemyAnimation("heavy-attack");
                    // Calcular daño (mayor al ataque ligero)
                    const baseDamage = 12;
                    const enemyStrengthMultiplier = 1 + Math.max(0, (this.enemy.strength - 3) * 0.1);
                    const resistanceMultiplier = Math.max(0.5, 1 - Math.max(0, (this.player.resistance - 10) * 0.05));
                    const damage = Math.ceil(baseDamage * enemyStrengthMultiplier * resistanceMultiplier);

                    // Mostrar animación de jugador recibiendo daño
                    this.playPlayerAnimation("hit");

                    // Aplicar daño
                    this.playerCurrentHealth = Math.max(0, this.playerCurrentHealth - damage);
                    this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);
                    this.addCombatLogMessage(`Has recibido ${damage} puntos de daño.`, "enemy-action");
                }

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
            });
        });
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

            // Recompensa de almas por victoria
            const soulsReward = 50;
            this.player.souls += soulsReward;
            // Actualizar el texto de almas en el HUD
            document.getElementById("souls-amount").textContent = this.player.souls;

            // Tiempo antes de cerrar escena
            this.time.delayedCall(2500, () => {
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
}
