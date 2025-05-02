export default class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: "BossScene" });

        // Objetos Player y Enemy
        this.player = null;
        this.enemy = null;

        // Variables combate
        this.combatActive = false;
        this.isBlockWindowActive = false; // Cambiado de isDodgeWindowActive
        this.lastAttackTime = 0;

        // Variables para la barra de sincronización
        this.syncBar = null;
        this.syncMarker = null;
        this.syncZone = null;
        this.syncTween = null;
    }

    // Método init que recibe instancia de Player y Enemy
    init(data) {
        // Obtener las instancias de player y enemy
        this.player = data.player;
        this.enemy = data.enemy;

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

        // Crear la barra de sincronización
        this.createSyncBar();

        // Iniciar combate
        this.startCombat();

        // Configurar controles de botones
        this.setupButtonListeners();
    }

    createSyncBar() {
        // Crear contenedor para la barra de sincronización
        const syncBarContainer = document.createElement("div");
        syncBarContainer.id = "sync-bar-container";
        syncBarContainer.style.cssText = `
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 200px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            overflow: hidden;
        `;

        // Crear zona de sincronización perfecta (sin posición fija inicial)
        const syncZone = document.createElement("div");
        syncZone.id = "sync-zone";
        syncZone.style.cssText = `
            position: absolute;
            width: 100%;
            height: 30%;
            background-color: rgba(0, 255, 0, 0.3);
            left: 0;
        `;

        // Crear marcador
        const syncMarker = document.createElement("div");
        syncMarker.id = "sync-marker";
        syncMarker.style.cssText = `
            position: absolute;
            width: 100%;
            height: 10px;
            background-color: white;
            bottom: 0;
            left: 0;
            border-radius: 5px;
        `;

        // Añadir elementos al contenedor
        syncBarContainer.appendChild(syncZone);
        syncBarContainer.appendChild(syncMarker);

        // Añadir el contenedor al DOM
        document.getElementById("combat-container").appendChild(syncBarContainer);

        // Guardar referencias
        this.syncBar = syncBarContainer;
        this.syncMarker = syncMarker;
        this.syncZone = syncZone;

        // Posicionar la zona aleatoriamente para la primera vez
        this.randomizeSyncZone();
    }

    // Nuevo método para posicionar la zona de sincronización aleatoriamente
    randomizeSyncZone() {
        if (!this.syncZone) return;

        // Obtener un valor aleatorio entre 0 y 70 (dejando espacio para que la zona quepa completamente)
        const randomPosition = Math.floor(Math.random() * 70);

        // Establecer la posición aleatoria
        this.syncZone.style.top = `${randomPosition}%`;

        // Añadir una pequeña animación para que el cambio sea visible
        this.syncZone.style.transition = "top 0.3s ease-out";

        // Opcionalmente, cambiamos ligeramente el color para indicar que es una nueva posición
        const greenIntensity = 150 + Math.floor(Math.random() * 105); // Valor entre 150 y 255
        this.syncZone.style.backgroundColor = `rgba(0, ${greenIntensity}, 0, 0.3)`;
    }

    startSyncBarAnimation() {
        // Resetear posición del marcador
        this.syncMarker.style.bottom = "0%";

        // Posicionar la zona de sincronización aleatoriamente cada vez
        this.randomizeSyncZone();

        // Crear animación
        const animation = this.syncMarker.animate([{ bottom: "0%" }, { bottom: "100%" }], {
            duration: this.enemy.attackInterval,
            easing: "linear",
        });

        // Guardar referencia a la animación
        this.syncTween = animation;

        // Añadir evento para cuando termine la animación
        animation.onfinish = () => {
            if (this.combatActive && this.isBlockWindowActive) {
                this.handleBlockWindowEnd();
            }
        };
    }

    handleBlockWindowEnd() {
        this.isBlockWindowActive = false;
        if (this.combatActive) {
            this.addCombatLogMessage("¡No has intentado bloquear! Has recibido daño.", "enemy-action");
            this.applyDamageToPlayer();
        }
    }

    handleBlock() {
        // Si no hay ventana de bloqueo activa, no hacer nada
        if (!this.isBlockWindowActive || !this.combatActive) {
            this.addCombatLogMessage("Has intentado bloquear, pero no había un ataque que bloquear.", "player-action");
            return;
        }

        // Obtener la posición actual del marcador
        const markerRect = this.syncMarker.getBoundingClientRect();
        const zoneRect = this.syncZone.getBoundingClientRect();
        const barRect = this.syncBar.getBoundingClientRect();

        // Calcular la posición relativa del marcador
        const markerPosition = (markerRect.top - barRect.top) / barRect.height;
        const zoneStart = (zoneRect.top - barRect.top) / barRect.height;
        const zoneEnd = (zoneRect.bottom - barRect.top) / barRect.height;

        // Detener la animación actual
        if (this.syncTween) {
            this.syncTween.cancel();
        }

        // Desactivar la ventana de bloqueo para evitar múltiples intentos
        this.isBlockWindowActive = false;

        if (markerPosition >= zoneStart && markerPosition <= zoneEnd) {
            // Bloqueo perfecto - evita completamente el daño
            this.addCombatLogMessage("¡Bloqueo perfecto! Has evitado todo el daño.", "player-action");
            this.playPlayerAnimation("walk");

            // Añadir un efecto visual o sonoro de bloqueo exitoso
            this.time.delayedCall(300, () => {
                this.playPlayerAnimation("idle");
            });
        } else {
            // Bloqueo fallido - recibe el daño completo
            this.addCombatLogMessage("¡Bloqueo fallido! Has recibido el daño completo.", "enemy-action");
            this.applyDamageToPlayer();
        }
    }

    startCombat() {
        this.combatActive = true;
        this.addCombatLogMessage("¡El combate ha comenzado!", "combat-info");
        this.addCombatLogMessage("Observa el patrón de ataque del jefe...", "combat-info");

        // Iniciar el ciclo de ataques
        this.scheduleNextAction();
    }

    scheduleNextAction() {
        if (!this.combatActive) return;

        const nextAction = this.enemy.getNextAction();
        this.time.delayedCall(this.enemy.attackInterval, () => {
            if (nextAction === 0) {
                this.handleBossAttack();
            } else {
                this.handleBossDodge();
            }
        });
    }

    handleBossAttack() {
        if (!this.combatActive) return;

        this.addCombatLogMessage("¡El jefe se prepara para atacar!", "enemy-action");
        this.playEnemyAnimation("light-attack");

        // Activar ventana de bloqueo
        this.isBlockWindowActive = true;
        this.lastAttackTime = this.time.now;

        // Iniciar animación de la barra de sincronización
        this.startSyncBarAnimation();

        // Programar siguiente acción
        this.scheduleNextAction();
    }

    handleBossDodge() {
        if (!this.combatActive) return;

        this.addCombatLogMessage("¡El enemigo se encuentra cansado, ataca ahora!", "enemy-action");
        this.playEnemyAnimation("walk");

        // Programar siguiente acción
        this.scheduleNextAction();
    }

    handleAttack() {
        if (!this.combatActive) return;

        // Verificar si el jefe está en modo esquive
        if (this.enemy.getCurrentAction() === 1) {
            this.addCombatLogMessage("¡Ataque exitoso!", "player-action");
            this.playPlayerAnimation("light-attack");
            this.applyDamageToEnemy();
        } else {
            this.addCombatLogMessage("¡El jefe te ha contraatacado!", "enemy-action");
            this.playEnemyAnimation("heavy-attack");
            this.applyDamageToPlayer();
        }
    }

    applyDamageToPlayer() {
        const damage = Math.ceil(10 * (1 + Math.max(0, (this.enemy.strength - 10) * 0.1)));
        this.playerCurrentHealth = Math.max(0, this.playerCurrentHealth - damage);
        this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);
        this.playPlayerAnimation("hit");
        this.checkCombatEnd();
    }

    applyDamageToEnemy() {
        const damage = Math.ceil(8 * (1 + Math.max(0, (this.player.strength - 10) * 0.1)));
        this.enemyCurrentHealth = Math.max(0, this.enemyCurrentHealth - damage);
        this.updateHealthBar("enemy", this.enemyCurrentHealth, this.enemyMaxHealth);
        this.playEnemyAnimation("hit");
        this.checkCombatEnd();
    }

    setupButtonListeners() {
        // Ataque ligero
        const attackLightBtn = document.querySelector(".combat-button.attack-light");
        if (attackLightBtn) {
            attackLightBtn.addEventListener("click", () => {
                if (this.combatActive) {
                    this.handleAttackLight();
                }
            });
        }

        // Bloqueo
        const blockBtn = document.querySelector(".combat-button.dodge");
        if (blockBtn) {
            blockBtn.addEventListener("click", () => {
                if (this.combatActive) {
                    this.handleBlock();
                }
            });
        }

        // Ataque pesado
        const attackHeavyBtn = document.querySelector(".combat-button.attack-heavy");
        if (attackHeavyBtn) {
            attackHeavyBtn.addEventListener("click", () => {
                if (this.combatActive) {
                    this.handleAttackHeavy();
                }
            });
        }

        // Curación
        const healBtn = document.querySelector(".combat-button.heal");
        if (healBtn) {
            healBtn.addEventListener("click", () => {
                if (this.combatActive) {
                    this.handleHeal();
                }
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
                        frameWidth: 64,
                        frameHeight: 64,
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
                        this.cameras.main.height / 3,
                        "enemy-combat"
                    );

                    // Usar la escala definida en el enemigo
                    this.enemySprite.setScale(this.mainScene.enemy.scale * 3);

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

    handleAttackLight() {
        if (!this.combatActive) return;

        // Verificar si hay una ventana de bloqueo activa
        if (this.isBlockWindowActive) {
            this.addCombatLogMessage("¡El enemigo ha golpeado antes! Debes bloquear primero.", "enemy-action");
            return;
        }

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

            // Esperar a que termine la animación antes de continuar
            this.time.delayedCall(1000, () => {
                // Volver a la animación de idle
                this.playPlayerAnimation("idle");
                this.playEnemyAnimation("idle");
            });
        }
    }

    handleAttackHeavy() {
        if (!this.combatActive) return;

        // Verificar si hay una ventana de bloqueo activa
        if (this.isBlockWindowActive) {
            this.addCombatLogMessage("¡El enemigo ha golpeado antes! Debes bloquear primero.", "enemy-action");
            return;
        }

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

            // Esperar a que termine la animación antes de continuar
            this.time.delayedCall(1000, () => {
                // Volver a la animación de idle
                this.playPlayerAnimation("idle");
                this.playEnemyAnimation("idle");
            });
        }
    }

    handleHeal() {
        if (!this.combatActive) return;

        // Verificar si hay una ventana de bloqueo activa
        if (this.isBlockWindowActive) {
            this.addCombatLogMessage("¡El enemigo ha golpeado antes! Debes bloquear primero.", "enemy-action");
            return;
        }

        // Calcular curación basada en resistencia
        const healPercent = 0.1 + this.player.resistance * 0.005;
        const healAmount = Math.ceil(this.playerMaxHealth * healPercent);

        // Aplicar curación
        this.playerCurrentHealth = Math.min(this.playerMaxHealth, this.playerCurrentHealth + healAmount);
        this.updateHealthBar("player", this.playerCurrentHealth, this.playerMaxHealth);
        this.addCombatLogMessage(`Te has curado ${healAmount} puntos de vida.`, "heal-action");

        // Finalizar la animación después de un tiempo
        this.time.delayedCall(1000, () => {
            // Volver a la animación de idle
            this.playPlayerAnimation("idle");
        });
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
            this.addCombatLogMessage("El enemigo ataca...", "enemy-turn");

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
                    });
                }
            });
        });
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
            // Finalizar el combate activo
            this.combatActive = false;

            // Reproducir animación de muerte para el enemigo
            this.playEnemyAnimation("death");
            this.addCombatLogMessage(`¡Has derrotado a ${this.enemy.name}!`, "player-action");

            // Recompensa de almas por victoria

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

        // Resetear todas las variables de estado
        this.isBlockWindowActive = false;
        this.lastAttackTime = 0;

        // Detener la animación de la barra de sincronización si existe
        if (this.syncTween) {
            this.syncTween.cancel();
            this.syncTween = null;
        }

        // Ocultar el contenedor de combate
        const combatContainer = document.getElementById("combat-container");
        if (combatContainer) {
            combatContainer.classList.add("hidden");

            // Eliminar la barra de sincronización si existe
            const syncBarContainer = document.getElementById("sync-bar-container");
            if (syncBarContainer) {
                syncBarContainer.remove();
            }
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
        const blockBtn = document.querySelector(".combat-button.dodge");

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

        if (blockBtn) {
            const newBtn = blockBtn.cloneNode(true);
            blockBtn.parentNode.replaceChild(newBtn, blockBtn);
        }

        // Habilitar los botones para el próximo combate
        const buttons = document.querySelectorAll(".combat-button");
        buttons.forEach((button) => {
            button.disabled = false;
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
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
}
