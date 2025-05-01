import itemsData from "../../items/data/itemsData.js";
import {
    UPGRADE_COST_MULTIPLIER,
    LEVEL_COST_MULTIPLIER,
    BASE_SOULS_REQUIREMENT,
    STAT_UPGRADE_MULTIPLIERS,
    TRAINING_CONFIG,
    BASE_UPGRADE_COST,
    LEVEL_UPGRADE_COST_MULTIPLIER,
} from "../../config/constants.js";

export default class Player {
    constructor(scene, x, y, texture) {
        // Configuración Phaser
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture);

        // Opciones del jugador en un único objeto
        const playerOptions = {
            // Propiedades visuales y físicas
            scale: 0.5,
            hitboxWidthRatio: 0.5,
            hitboxHeightRatio: 0.3,
            hitboxOffsetYRatio: 0.7,

            // Atributos base del jugador
            name: "Sergio",
            level: 1,
            souls: 0,
            armor: 0,
            maxHealth: 100,
            health: 100,
            resistance: 10,
            strength: 10,
            speed: 15,

            // Ruta imagen y spritesheet
            img: "./assets/pruebaimg.png",
            spritesheet: "./assets/player/player.png",
        };

        this.sprite.setScale(playerOptions.scale);
        this.sprite.setCollideWorldBounds(true);

        // Configure hitbox a la escala
        const scale = this.sprite.scale;
        const scaledWidth = this.sprite.displayWidth;
        const scaledHeight = this.sprite.displayHeight;

        // Hitbox en los pies del asset
        const bodyWidth = scaledWidth * playerOptions.hitboxWidthRatio;
        const bodyHeight = scaledHeight * playerOptions.hitboxHeightRatio;

        // Offset
        const offsetX = (scaledWidth - bodyWidth) / 2;
        const offsetY = scaledHeight * playerOptions.hitboxOffsetYRatio; // Zona inferior

        this.sprite.body.setSize(bodyWidth / scale, bodyHeight / scale);
        this.sprite.body.setOffset(offsetX / scale, offsetY / scale);

        // Definir todas las animaciones disponibles
        this.animationDefinitions = {
            idle: {
                key: "player-idle",
                frames: { start: 0, end: 5 },
                frameRate: 10,
                repeat: -1,
                repeatDelay: 5000,
            },
            walk: {
                key: "player-walk",
                frames: { start: 6, end: 11 },
                frameRate: 10,
                repeat: -1,
            },
            turn: {
                key: "player-turn",
                frames: [{ key: texture, frame: 0 }],
                frameRate: 20,
                repeat: 0,
            },
            hit: {
                key: "player-hit",
                frames: { start: 48, end: 53 },
                frameRate: 8,
                repeat: 0,
            },
            "light-attack": {
                key: "player-light-attack",
                frames: { start: 18, end: 23 },
                frameRate: 8,
                repeat: 0,
            },
            "heavy-attack": {
                key: "player-heavy-attack",
                frames: { start: 12, end: 17 },
                frameRate: 8,
                repeat: 0,
            },
            death: {
                key: "player-death",
                frames: { start: 48, end: 59 },
                frameRate: 5,
                repeat: 0,
            },
            dash: {
                key: "player-dash",
                frames: { start: 60, end: 63 },
                frameRate: 8,
                repeat: 0,
            },
        };

        // Asignar valores de opciones a propiedades
        this.name = playerOptions.name;
        this.level = playerOptions.level;
        this.souls = playerOptions.souls;
        this.armor = playerOptions.armor;
        this.maxHealth = playerOptions.maxHealth;
        this.health = playerOptions.health;
        this.resistance = playerOptions.resistance;
        this.strength = playerOptions.strength;
        this.speed = playerOptions.speed;
        this.img = playerOptions.img;
        this.spritesheet = playerOptions.spritesheet;

        this.reqSouls = this.calculateRequiredSouls(this.level);

        this.createAnimations(scene, texture);

        // Inventario
        this.inventory = {
            items: {
                "espada-oscura": {
                    quantity: 1,
                    twoHanded: false,
                    equipped: false,
                },
                "escudo-anillos-cristal": {
                    quantity: 2,
                    equipped: false,
                },
                "casco-metal": {
                    quantity: 1,
                    equipped: true,
                },
                "pechera-hierro": {
                    quantity: 1,
                    equipped: true,
                },
                "guantes-magicos": {
                    quantity: 1,
                    twoHanded: false,
                    equipped: true,
                },
                "zapatos-montana": {
                    quantity: 1,
                    equipped: true,
                },
                "espada-muy-larga": {
                    quantity: 1,
                    twoHanded: false,
                    equipped: true,
                },
                "escudo-metal": {
                    quantity: 1,
                    equipped: true,
                },
                "anillo-oro": {
                    quantity: 1,
                    accessory1: false,
                    accessory2: true,
                    equipped: true,
                },
                "anillo-legendario": {
                    quantity: 1,
                    accessory1: true,
                    accessory2: false,
                    equipped: true,
                },
                "anillo-mitico": {
                    quantity: 1,
                    accessory1: false,
                    accessory2: false,
                    equipped: false,
                },
                "anillo-ceremonial": {
                    quantity: 1,
                    accessory1: false,
                    accessory2: false,
                    equipped: false,
                },
            },
        };

        // Seguimiento temporal de mejoras
        this.pendingUpgrades = {
            health: 0,
            resistance: 0,
            strength: 0,
            speed: 0,
        };

        // Inicializar costos de mejora - ahora todos son iguales
        this.upgradeCost = BASE_UPGRADE_COST;

        // Calcular costo de mejora basado en nivel
        this.updateUpgradeCost();
    }

    // Método para crear las animaciones del jugador
    createAnimations(scene, texture) {
        // Crear animaciones principales para el juego
        const animsToCreate = ["idle", "walk", "turn"];

        animsToCreate.forEach((animName) => {
            const animDef = this.animationDefinitions[animName];

            if (!scene.anims.exists(animDef.key)) {
                if (animName === "turn") {
                    scene.anims.create({
                        key: animDef.key,
                        frames: animDef.frames,
                        frameRate: animDef.frameRate,
                        repeat: animDef.repeat,
                    });
                } else {
                    scene.anims.create({
                        key: animDef.key,
                        frames: scene.anims.generateFrameNumbers(texture, {
                            start: animDef.frames.start,
                            end: animDef.frames.end,
                        }),
                        frameRate: animDef.frameRate,
                        repeat: animDef.repeat,
                        repeatDelay: animDef.repeatDelay || undefined,
                    });
                }
            }
        });
    }

    // Método para crear animaciones de combate (usado por CombatScene)
    createCombatAnimations(scene, combatTexture) {
        // Crear todas las animaciones para combate
        Object.keys(this.animationDefinitions).forEach((animName) => {
            const animDef = this.animationDefinitions[animName];
            const combatKey = animDef.key.replace("player-", ""); // Convertir "player-idle" a "idle" para combate

            if (!scene.anims.exists(combatKey)) {
                if (animName === "turn") {
                    scene.anims.create({
                        key: combatKey,
                        frames: [{ key: combatTexture, frame: 0 }],
                        frameRate: animDef.frameRate,
                        repeat: animDef.repeat,
                    });
                } else {
                    scene.anims.create({
                        key: combatKey,
                        frames: scene.anims.generateFrameNumbers(combatTexture, {
                            start: animDef.frames.start,
                            end: animDef.frames.end,
                        }),
                        frameRate: animDef.frameRate,
                        repeat: animDef.repeat,
                        repeatDelay: animDef.repeatDelay || undefined,
                    });
                }
            }
        });
    }

    // Método para reproducir animaciones del jugador
    playAnimation(animName) {
        const animDef = this.animationDefinitions[animName];
        if (animDef) {
            this.sprite.anims.play(animDef.key, true);
        }
    }

    // Método para obtener información completa de un item
    getItemData(itemId) {
        if (!this.inventory.items[itemId]) {
            return null;
        }

        // Combinamos los datos del JSON con los datos específicos del jugador
        return {
            ...itemsData[itemId], // Datos generales del JSON (nombre, descripción, etc.)
            ...this.inventory.items[itemId], // Datos específicos del jugador (cantidad, equipado)
        };
    }

    // Inventario - Agregar un ítem
    addItem(itemId, quantity = 1) {
        if (itemsData[itemId]) {
            if (this.inventory.items[itemId]) {
                this.inventory.items[itemId].quantity += quantity;
            } else {
                this.inventory.items[itemId] = {
                    quantity: quantity,
                    equipped: false,
                    twoHanded: itemsData[itemId].category === "weapon" ? false : undefined,
                };
            }
            return true;
        }
        return false;
    }

    // Inventario - Eliminar ítem
    deleteItem(itemId) {
        if (this.inventory.items[itemId]) {
            this.inventory.items[itemId].quantity -= 1;

            // Si la cantidad llega a 0 y está equipado, lo desequipamos
            if (this.inventory.items[itemId].quantity >= 0 && this.inventory.items[itemId].equipped) {
                this.inventory.items[itemId].equipped = false;
            }
        }
    }

    // Controles
    update(cursors) {
        let isMoving = false;

        if (cursors.left.isDown) {
            this.sprite.setVelocityX(-160);
            this.sprite.setFlipX(true);
            isMoving = true;
        } else if (cursors.right.isDown) {
            this.sprite.setVelocityX(160);
            this.sprite.setFlipX(false);
            isMoving = true;
        } else {
            this.sprite.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            this.sprite.setVelocityY(-160);
            isMoving = true;
        } else if (cursors.down.isDown) {
            this.sprite.setVelocityY(160);
            isMoving = true;
        } else {
            this.sprite.setVelocityY(0);
        }

        if (isMoving) {
            this.playAnimation("walk");
        } else {
            this.playAnimation("idle");
        }
    }

    // Métodos de mejora de estadísticas
    canUpgradeStat(stat) {
        return this.souls >= this.upgradeCost;
    }

    getStatUpgradeCost(stat) {
        return this.upgradeCost;
    }

    prepareUpgradeStat(stat) {
        if (this.canUpgradeStat(stat)) {
            this.pendingUpgrades[stat]++;
            this.souls -= this.upgradeCost;

            // Actualizar el costo basado en el nuevo nivel potencial
            this.updateUpgradeCost(true);

            return true;
        }
        return false;
    }

    confirmUpgrades() {
        // Calcular la cantidad total de mejoras realizadas
        const totalUpgrades = Object.values(this.pendingUpgrades).reduce((sum, val) => sum + val, 0);

        // Incrementar el nivel según el total de mejoras si está configurado así
        if (totalUpgrades > 0 && TRAINING_CONFIG.levelUpPerStat) {
            this.level += totalUpgrades;
            this.reqSouls = this.calculateRequiredSouls(this.level);
            this.updateUpgradeCost();
        }

        // Aplicar las mejoras con sus multiplicadores correspondientes
        this.health += Math.ceil(this.health * STAT_UPGRADE_MULTIPLIERS.health * this.pendingUpgrades.health);
        this.resistance += Math.ceil(
            this.resistance * STAT_UPGRADE_MULTIPLIERS.resistance * this.pendingUpgrades.resistance
        );
        this.strength += Math.ceil(this.strength * STAT_UPGRADE_MULTIPLIERS.strength * this.pendingUpgrades.strength);
        this.speed += Math.ceil(this.speed * STAT_UPGRADE_MULTIPLIERS.speed * this.pendingUpgrades.speed);

        // Reiniciar mejoras pendientes
        this.pendingUpgrades = {
            health: 0,
            resistance: 0,
            strength: 0,
            speed: 0,
        };
    }

    cancelUpgrades() {
        // Reembolsar almas por mejoras pendientes
        let refundSouls = 0;

        // Necesitamos calcular cuánto costó cada mejora individualmente
        let currentLevel = this.level;
        for (let i = 0; i < Object.values(this.pendingUpgrades).reduce((sum, val) => sum + val, 0); i++) {
            // Calcular el costo para este nivel específico
            const costForLevel = Math.ceil(
                BASE_UPGRADE_COST * (1 + (currentLevel - 1) * LEVEL_UPGRADE_COST_MULTIPLIER)
            );
            refundSouls += costForLevel;
            currentLevel++; // Incrementar el nivel para la siguiente mejora
        }

        this.souls += refundSouls;

        // Reiniciar mejoras pendientes
        this.pendingUpgrades = {
            health: 0,
            resistance: 0,
            strength: 0,
            speed: 0,
        };

        // Restablecer el costo de mejora al nivel actual
        this.updateUpgradeCost(false);
    }

    // Cálculo de almas necesarias para subir de nivel
    calculateRequiredSouls(currentLevel) {
        // Fórmula: BASE * (1 + MULTIPLIER)^(level)
        // Para nivel 1: BASE
        // Para nivel 2: BASE * (1 + MULTIPLIER)
        // Para nivel 3: BASE * (1 + MULTIPLIER)^2, etc.
        return Math.ceil(BASE_SOULS_REQUIREMENT * Math.pow(1 + LEVEL_COST_MULTIPLIER, currentLevel - 1));
    }

    // Obtener valor ajustado de una estadística con las mejoras pendientes
    getAdjustedStatValue(stat) {
        const pendingBonus = Math.ceil(this[stat] * STAT_UPGRADE_MULTIPLIERS[stat] * this.pendingUpgrades[stat]);
        return this[stat] + pendingBonus;
    }

    // Método para subir de nivel
    levelUp() {
        if (this.souls >= this.reqSouls) {
            this.souls -= this.reqSouls;
            this.level += 1;
            this.reqSouls = this.calculateRequiredSouls(this.level);
            return true;
        }
        return false;
    }

    // Método para obtener información de nivel
    getLevelInfo() {
        // Calcular nivel potencial basado en mejoras pendientes
        const totalPendingUpgrades = Object.values(this.pendingUpgrades).reduce((sum, val) => sum + val, 0);
        const potentialLevel = this.level + totalPendingUpgrades;

        // Calcular almas requeridas para el nivel potencial actual (no el siguiente)
        // Esto es más coherente con lo que se muestra en la interfaz
        const potentialRequiredSouls = this.calculateRequiredSouls(potentialLevel);

        return {
            level: this.level,
            potentialLevel: potentialLevel,
            souls: this.souls,
            requiredSouls: this.reqSouls,
            potentialRequiredSouls: potentialRequiredSouls,
        };
    }

    // Actualizar el costo de mejora basado en el nivel actual o potencial
    updateUpgradeCost(usePotentialLevel = false) {
        let levelToUse = this.level;

        // Si se solicita usar el nivel potencial, calcular la suma de nivel actual + mejoras pendientes
        if (usePotentialLevel) {
            const totalPendingUpgrades = Object.values(this.pendingUpgrades).reduce((sum, val) => sum + val, 0);
            levelToUse = this.level + totalPendingUpgrades;
        }

        // Fórmula: BASE_COST * (1 + (nivel-1) * MULTIPLIER)
        this.upgradeCost = Math.ceil(BASE_UPGRADE_COST * (1 + (levelToUse - 1) * LEVEL_UPGRADE_COST_MULTIPLIER));
    }

    // Método para establecer la posición del jugador
    setPosition(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;

        return this;
    }
}
