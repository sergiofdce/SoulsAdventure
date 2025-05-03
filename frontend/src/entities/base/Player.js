import { Entity } from "./Entity.js";
import { STAT_UPGRADE_MULTIPLIERS } from "../../config/constants.js";
import Inventory from "../../data/items/Inventory.js";

export default class Player extends Entity {
    constructor(scene, x, y, texture) {
        // Llamamos al constructor de la clase padre
        super(scene, x, y, texture, "Sergio");

        // Atributos base del jugador
        this.level = 1;
        this.souls = 1000000;

        this.maxHealth = 100;
        this.health = 100;
        this.resistance = 33;
        this.strength = 5;
        this.speed = 7;

        // Atributos equipación
        this.damage = 0;
        this.defense = 0;

        // Crear sprite con Phaser
        this.sprite = scene.physics.add.sprite(x, y, texture);
        // Aplicar scale
        this.setupSprite(this.sprite, 0.5);

        // Ruta imagen y spritesheet
        this.img = "./assets/pruebaimg.png";
        this.spritesheet = "./assets/player/player.png";

        // Animaciones
        this.createAnimations(scene, texture);

        // Inventario - ahora como objeto independiente
        this.inventory = new Inventory();
        // Conectar el inventario con el jugador
        this.inventory.setPlayer(this);

        // Después de crear el inventario, calculamos los stats iniciales basados en equipamiento
        this.inventory.recalculatePlayerStats();
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
        return this.inventory.getItemData(itemId);
    }

    // Inventario - Agregar un ítem
    addItem(itemId, quantity = 1) {
        return this.inventory.addItem(itemId, quantity);
    }

    // Inventario - Eliminar ítem
    deleteItem(itemId) {
        this.inventory.deleteItem(itemId);
    }

    // Métodos para equipar/desequipar ítems
    equipItem(itemId) {
        const result = this.inventory.equipItem(itemId);
        if (result) {
            // Recalcular stats basados en equipamiento
            this.inventory.recalculatePlayerStats();
            console.log(`Ítem equipado: ${itemId}`);
        }
        return result;
    }

    unequipItem(itemId) {
        const result = this.inventory.unequipItem(itemId);
        if (result) {
            // Recalcular stats basados en equipamiento
            this.inventory.recalculatePlayerStats();
            console.log(`Ítem desequipado: ${itemId}`);
        }
        return result;
    }

    // Método para obtener ítems equipados
    getEquippedItems() {
        const equipped = {};
        const inventoryItems = this.inventory.getInventory();

        for (const itemId in inventoryItems) {
            if (inventoryItems[itemId].equipped) {
                equipped[itemId] = this.inventory.getItemData(itemId);
            }
        }

        return equipped;
    }

    // Controles - actualizamos el método para usar Controls
    update(cursors) {
        // Este método ya no maneja directamente los controles
        // Ahora solo recibe información del controlador externo
        // La lógica de movimiento se ha trasladado a la clase Controls
    }

    getPlayerInfo() {
        return {
            level: this.level,
            souls: this.souls,
        };
    }

    applyPlayerStats(statUpgrades, totalLevels) {
        // MaxHealth (en lugar de health) - incremento porcentual
        if (statUpgrades.maxHealth) {
            this.maxHealth += Math.ceil(this.maxHealth * STAT_UPGRADE_MULTIPLIERS.maxHealth * statUpgrades.maxHealth);
            // Opcionalmente, podemos también actualizar health para que se refleje la mejora
            this.health = this.maxHealth;
        }
        // Para estadísticas con incremento fijo (resistance, strength, speed)
        if (statUpgrades.resistance) {
            this.resistance += STAT_UPGRADE_MULTIPLIERS.resistance * statUpgrades.resistance;
        }
        if (statUpgrades.strength) {
            this.strength += STAT_UPGRADE_MULTIPLIERS.strength * statUpgrades.strength;
        }
        if (statUpgrades.speed) {
            this.speed += STAT_UPGRADE_MULTIPLIERS.speed * statUpgrades.speed;
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

    // Método para guardar el estado del jugador (incluyendo inventario)
    savePlayerData() {
        const playerData = {
            level: this.level,
            souls: this.souls,
            health: this.health,
            maxHealth: this.maxHealth,
            resistance: this.resistance,
            strength: this.strength,
            speed: this.speed,
            inventoryData: this.inventory.data, // Guardamos el objeto data directamente
        };

        return JSON.stringify(playerData);
    }

    // Método para cargar el estado del jugador
    loadPlayerData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Cargar atributos base
            this.level = data.level || this.level;
            this.souls = data.souls || this.souls;
            this.health = data.health || this.health;
            this.maxHealth = data.maxHealth || this.maxHealth;
            this.resistance = data.resistance || this.resistance;
            this.strength = data.strength || this.strength;
            this.speed = data.speed || this.speed;

            // Cargar inventario si existe
            if (data.inventoryData) {
                this.inventory.importFromJSON(data.inventoryData);
            }

            // Reconectar el inventario con el jugador después de cargar
            this.inventory.setPlayer(this);
            // Recalcular stats basados en equipamiento
            this.inventory.recalculatePlayerStats();

            return true;
        } catch (error) {
            console.error("Error al cargar los datos del jugador:", error);
            return false;
        }
    }
}
