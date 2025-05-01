import { Entity } from "./Entity.js";
import itemsData from "../../items/data/itemsData.js";
import { STAT_UPGRADE_MULTIPLIERS } from "../../config/constants.js";

export default class Player extends Entity {
    constructor(scene, x, y, texture) {
        // Llamamos al constructor de la clase padre
        super(scene, x, y, texture, "Sergio");

        // Atributos base del jugador
        this.level = 1;
        this.souls = 1000000;
        this.armor = 0;
        this.maxHealth = 100;
        this.health = 100;
        this.resistance = 10;
        this.strength = 10;
        this.speed = 15;

        // Crear sprite con Phaser
        this.sprite = scene.physics.add.sprite(x, y, texture);
        // Aplicar scale
        this.setupSprite(this.sprite, 0.5);

        // Ruta imagen y spritesheet
        this.img = "./assets/pruebaimg.png";
        this.spritesheet = "./assets/player/player.png";

        // Animaciones
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
    }

    createAnimations(scene, texture) {
        scene.anims.create({
            key: "player-idle",
            frames: scene.anims.generateFrameNumbers(texture, {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
            repeatDelay: 5000,
        });

        scene.anims.create({
            key: "player-walk",
            frames: scene.anims.generateFrameNumbers(texture, {
                start: 6,
                end: 11,
            }),
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: "player-hit",
            frames: scene.anims.generateFrameNumbers(texture, {
                start: 48,
                end: 53,
            }),
            frameRate: 8,
            repeat: 0,
        });

        scene.anims.create({
            key: "player-light-attack",
            frames: scene.anims.generateFrameNumbers(texture, {
                start: 18,
                end: 23,
            }),
            frameRate: 8,
            repeat: 0,
        });

        scene.anims.create({
            key: "player-heavy-attack",
            frames: scene.anims.generateFrameNumbers(texture, {
                start: 12,
                end: 17,
            }),
            frameRate: 8,
            repeat: 0,
        });

        scene.anims.create({
            key: "player-death",
            frames: scene.anims.generateFrameNumbers(texture, {
                start: 48,
                end: 59,
            }),
            frameRate: 5,
            repeat: 0,
        });
    }

    // Método para reproducir animaciones del jugador
    playAnimation(animName) {
        const animKey = `player-${animName}`;
        if (this.sprite.anims.exists(animKey)) {
            this.sprite.anims.play(animKey, true);
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

        // Corregimos la forma de reproducir las animaciones
        if (isMoving) {
            this.sprite.anims.play("player-walk", true);
        } else {
            this.sprite.anims.play("player-idle", true);
        }
    }

    getPlayerInfo() {
        return {
            level: this.level,
            souls: this.souls,
        };
    }

    applyPlayerStats(statUpgrades, totalLevels) {
        // Vida
        if (statUpgrades.health) {
            this.health += Math.ceil(this.health * STAT_UPGRADE_MULTIPLIERS.health * statUpgrades.health);
        }
        // Resistencia
        if (statUpgrades.resistance) {
            this.resistance += Math.ceil(
                this.resistance * STAT_UPGRADE_MULTIPLIERS.resistance * statUpgrades.resistance
            );
        }
        // Fuerza
        if (statUpgrades.strength) {
            this.strength += Math.ceil(this.strength * STAT_UPGRADE_MULTIPLIERS.strength * statUpgrades.strength);
        }
        // Velocidad
        if (statUpgrades.speed) {
            this.speed += Math.ceil(this.speed * STAT_UPGRADE_MULTIPLIERS.speed * statUpgrades.speed);
        }

        // Actualizar nivel
        if (totalLevels > 0) {
            this.level += totalLevels;
        }
    }

    spendSouls(amount) {
        if (this.souls >= amount) {
            this.souls -= amount;
            return true;
        }
        return false;
    }

    addSouls(amount) {
        this.souls += amount;
    }

    setPosition(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;

        return this;
    }
}
