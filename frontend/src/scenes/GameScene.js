// Managers
import Player from "../entities/base/Player.js";
import Controls from "../managers/Controls.js";
import Camera from "../managers/Camera.js";
import Map from "../managers/Map.js";

// Enemigos
import { EnanoFuego } from "../entities/enemies/EnanoFuego.js";
// Bosses
import { Lobo } from "../entities/bosses/Lobo.js";

// Entidades
import { Trainer } from "../entities/npcs/Trainer.js";
import { Fireplace } from "../entities/npcs/Fireplace.js";
import { InteractableObject } from "../entities/interactables/Objects.js";

// Consola
import { setupConsoleCommands } from "../utils/consoleCommands.js";

// MongoDB
import GameStateManager from "../managers/GameState.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.enemies = [];
        this.bosses = [];
        this.fireplaces = [];
        this.interactableObjects = [];
        this.gameState = {};
        this.gameStateManager = new GameStateManager();
    }

    preload() {
        this.loadAssets();
    }

    async create() {
        // Configurar controles de entrada
        this.setupInput();

        // Configurar el mapa y límites del mundo
        this.setupMap();

        // Instanciar el jugador
        this.spawnPlayer();

        // Inicializar el GameStateManager con la escena y el jugador
        this.gameStateManager.initialize(this, this.player);

        // Cargar datos guardados usando el GameStateManager
        await this.loadSavedData();

        // Generar Trainer
        this.spawnTrainer();

        // Generar hogueras
        this.spawnFireplaces();

        // Generar enemigos en el mapa
        this.spawnEnemies();

        // Generar Bosses
        this.spawnBosses();

        // Generar objetos en el mapa
        this.spawnObjects();

        // Configurar colisiones entre objetos
        this.setupCollisions();

        // Configurar la cámara para seguir al jugador
        this.setupCamera();

        // Configurar comandos de consola para el inventario
        this.setupConsoleCommands();

        // Activar modo debug
        //this.enableDebugMode();
    }

    loadAssets() {
        // Cargar assets Player
        this.load.spritesheet("player", "./assets/player/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        // Cargar assets NPCs
        this.load.spritesheet("trainer", "./assets/player/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        // Cargar assets Enemigos
        this.load.spritesheet("enemy-EnanoFuego", "./assets/enemies/enemy-EnanoFuego.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        // Cargar assets Bosses
        this.load.spritesheet("boss-Lobo", "./assets/bosses/boss-Lobo.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Cargar asset hoguera
        this.load.spritesheet("fireplace", "./assets/player/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        // Cargar assets objetos
        this.load.image("escudo-dragon", "./assets/items/shields/escudo-dragon.png");
        this.load.image("espada-larga", "./assets/items/weapons/espada-larga.png");
        this.load.image("pocion-salud", "./assets/items/consumables/pocion-salud.png");

        // Cargar assets Mapa
        this.load.tilemapTiledJSON("map", "assets/maps/Map.json");
        this.load.image("RA_Overworld_Full", "assets/tilesets/Tilesets/RA_Overworld_Full.png");
        this.load.image("RA_Beast", "assets/tilesets/Tilesets/RA_Beast.png");
        this.load.image("RA_Cavern_Full", "assets/tilesets/Tilesets/RA_Cavern_Full.png");
        this.load.image("RA_Hell", "assets/tilesets/Tilesets/RA_Hell.png");
        this.load.image("RA_Jungle", "assets/tilesets/Tilesets/RA_Jungle.png");
        this.load.image("RA_Village", "assets/tilesets/Tilesets/RA_Village.png");
        this.load.image("RA_Wasteland_Water", "assets/tilesets/Tilesets/RA_Wasteland_Water.png");
        this.load.image("RA_Animated_Water", "assets/tilesets/Tilesets/RA_Animated_Water.png");
        this.load.image("tree03_s_01_animation", "assets/tilesets/Tilesets/tree03_s_01_animation.png");
        this.load.image("RA_Pyramid", "assets/tilesets/Tilesets/RA_Pyramid.png");
        this.load.image("RA_Ruins", "assets/tilesets/Tilesets/RA_Ruins.png");
        this.load.image("RA_Ship", "assets/tilesets/Tilesets/RA_Ship.png");
        this.load.image("RA_Hell_Animations", "assets/tilesets/Tilesets/RA_Hell_Animations.png");
    }

    setupInput() {
        // Mostrar Inventario
        this.input.keyboard.on("keydown-I", () => {
            this.scene.pause();
            this.scene.launch("InventoryScene", { player: this.player });
        });

        // Interactuar
        this.input.keyboard.on("keydown-E", () => {
            // Trainer
            if (this.trainer.isInRange(this.player)) {
                this.trainer.interact(this.player);
            }

            // Hogueras
            this.fireplaces.forEach((fireplace) => {
                if (fireplace.isInRange(this.player)) {
                    fireplace.interact(this.player);
                }
            });
        });
    }

    setupMap() {
        // Instanciar mapa con los tilesets necesarios
        this.mapManager = new Map(this, "map", [
            { key: "RA_Overworld_Full", path: "assets/tilesets/Tilesets/RA_Overworld_Full.png" },
            { key: "RA_Beast", path: "assets/tilesets/Tilesets/RA_Beast.png" },
            { key: "RA_Cavern_Full", path: "assets/tilesets/Tilesets/RA_Cavern_Full.png" },
            { key: "RA_Hell", path: "assets/tilesets/Tilesets/RA_Hell.png" },
            { key: "RA_Jungle", path: "assets/tilesets/Tilesets/RA_Jungle.png" },
            { key: "RA_Village", path: "assets/tilesets/Tilesets/RA_Village.png" },
            { key: "RA_Wasteland_Water", path: "assets/tilesets/Tilesets/RA_Wasteland_Water.png" },
            { key: "RA_Animated_Water", path: "assets/tilesets/Tilesets/RA_Animated_Water.png" },
            { key: "tree03_s_01_animation", path: "assets/tilesets/Tilesets/tree03_s_01_animation.png" },
            { key: "RA_Pyramid", path: "assets/tilesets/Tilesets/RA_Pyramid.png" },
            { key: "RA_Ruins", path: "assets/tilesets/Tilesets/RA_Ruins.png" },
            { key: "RA_Ship", path: "assets/tilesets/Tilesets/RA_Ship.png" },
            { key: "RA_Hell_Animations", path: "assets/tilesets/Tilesets/RA_Hell_Animations.png" },
        ]);

        // Configurar límites del mundo
        this.physics.world.setBounds(0, 0, this.mapManager.map.widthInPixels, this.mapManager.map.heightInPixels);
    }

    spawnPlayer() {
        // Intentar obtener el nombre del jugador del localStorage si existe
        let playerName = "";

        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (userData && userData.playerName) {
                playerName = userData.playerName;
            }
        } catch (error) {
            console.error("Error al obtener el nombre del jugador:", error);
        }

        this.player = new Player(this, 306, 454, "player", playerName);

        // Usamos el inventario del jugador para el gameState
        this.gameState.inventory = this.player.inventory;
    }

    async loadSavedData() {
        try {
            // Usar el GameStateManager para cargar los datos
            const success = await this.gameStateManager.loadGame();

            if (success) {
                // Actualizar la interfaz de usuario con los nuevos valores
                this.updateHUD();

                // Efecto visual en el elemento de vida para indicar actualización
                const healthElement = document.getElementById("health-amount");
                healthElement.classList.add("value-changed");
                setTimeout(() => {
                    healthElement.classList.remove("value-changed");
                }, 1000);

                return true;
            } else {
                console.warn("No se pudieron cargar datos de partida. Usando valores por defecto.");
                return false;
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            return false;
        }
    }

    updateHUD() {
        // Actualizar vida en el HUD
        const healthElement = document.getElementById("health-amount");
        if (healthElement) {
            // Mostrar la vida actual, no la máxima
            healthElement.textContent = this.player.health;

            // Actualizar barra de progreso de vida
            const healthBar = document.querySelector(".hud-progress");
            if (healthBar) {
                // Calcular porcentaje de vida actual respecto al máximo
                const healthPercentage = Math.max(0, Math.min((this.player.health / this.player.maxHealth) * 100, 100));
                healthBar.style.width = `${healthPercentage}%`;

                // Cambiar color según el porcentaje de vida
                if (healthPercentage > 60) {
                    healthBar.style.backgroundColor = "#4ade80"; // Verde
                } else if (healthPercentage > 30) {
                    healthBar.style.backgroundColor = "#facc15"; // Amarillo
                } else {
                    healthBar.style.backgroundColor = "#ef4444"; // Rojo
                }
            }
        }

        // Actualizar almas en el HUD
        const soulsElement = document.getElementById("souls-amount");
        if (soulsElement) {
            soulsElement.textContent = this.player.souls;

            // Efecto visual de actualización
            soulsElement.classList.add("value-changed");
            setTimeout(() => {
                soulsElement.classList.remove("value-changed");
            }, 1000);
        }

        // Actualizar nombre del jugador en el HUD
        const nameElement = document.getElementById("hud-player-name");
        if (nameElement && this.player.name) {
            nameElement.textContent = this.player.name;
        }
    }

    spawnTrainer() {
        this.trainer = new Trainer(this, 261, 479, "trainer");

        // Verificar si el NPC ya ha sido descubierto usando GameStateManager
        if (this.gameStateManager.isNPCDiscovered(this.trainer.name)) {
            this.trainer.firstInteraction = false;
            console.log(`Trainer "${this.trainer.name}" ya descubierto según GameStateManager`);
        }
        // Mantener la verificación anterior por compatibilidad
        else if (this.trainer.checkDiscoveredStatus) {
            this.trainer.checkDiscoveredStatus(this.player);
        }
    }

    spawnFireplaces() {
        const fireplaceConfigs = [
            { x: 630, y: 630, name: "Plaza del Pueblo" },
            { x: 1146, y: 2710, name: "Ruinas de Nuevo Londo" },
            { x: 3291, y: 4276, name: "Izalith perdida" },
        ];

        fireplaceConfigs.forEach((config) => {
            const fireplace = new Fireplace(this, config.x, config.y, "fireplace");
            fireplace.fireplaceName = config.name;
            fireplace.sprite.setTint(0xff6b6b);

            // Verificar si esta hoguera ya está descubierta
            if (this.gameStateManager.isFireplaceDiscovered(fireplace.fireplaceName)) {
                fireplace.discovered = true;
                console.log(`Hoguera ${fireplace.fireplaceName} ya descubierta anteriormente`);
            }

            this.fireplaces.push(fireplace);
        });
    }

    spawnEnemies() {
        // Destruir enemigos existentes y limpiar eventos
        this.enemies.forEach((enemy) => {
            if (enemy.sprite) {
                // Eliminar eventos de actualización antes de destruir
                this.events.off("update", enemy.updateEntity);
                enemy.sprite.destroy();
            }
        });

        // Limpiar el array de enemigos
        this.enemies = [];

        const enemyConfigs = [{ type: EnanoFuego, x: 692, y: 1000 }];

        enemyConfigs.forEach(({ type, x, y }) => {
            const enemy = new type(this, x, y);
            this.enemies.push(enemy);
        });

        // Configurar colisiones con el mapa
        this.setupEnemyMapCollisions();

        // Configurar colisiones con el jugador
        this.enemies.forEach((enemy) => enemy.setupCollision(this.player));
    }

    // Nuevo método para configurar colisiones de enemigos con todas las capas de colisión del mapa
    setupEnemyMapCollisions() {
        if (!this.mapManager) return;
        const collisionLayers = [
            this.mapManager.collisionLayer,
            this.mapManager.collisionLayer1,
            this.mapManager.collisionLayer2,
            this.mapManager.collisionLayer3,
            this.mapManager.perspectiveLayer,
        ].filter(Boolean);

        this.enemies.forEach((enemy) => {
            if (enemy.sprite) {
                collisionLayers.forEach((layer) => {
                    this.physics.add.collider(enemy.sprite, layer);
                });
                console.log(`Configuradas colisiones con mapa para ${enemy.name}`);
            }
        });
    }

    spawnBosses() {
        //const bossConfigs = [{ type: Lobo, name: "Lobo", x: 800, y: 600 }];

        const bossConfigs = [];

        bossConfigs.forEach((config) => {
            // Verificar si el boss ya ha sido derrotado usando GameStateManager
            if (this.gameStateManager.shouldSpawnBoss(config.name)) {
                const boss = new config.type(this, config.x, config.y, undefined, config.name);
                this.bosses.push(boss);
            } else {
                console.log(`Boss ${config.name} already defeated, not spawning`);
            }
        });
    }

    spawnObjects() {
        // Limpiar objetos existentes si los hay
        this.interactableObjects.forEach((obj) => {
            if (obj.sprite) obj.destroy();
        });
        this.interactableObjects = [];

        // Definir objetos en el mapa
        const objectsToSpawn = [
            { itemId: "escudo-dragon", x: 540, y: 550, texture: "escudo-dragon" },
            { itemId: "espada-larga", x: 700, y: 600, texture: "espada-larga" },
            { itemId: "pocion-salud", x: 650, y: 500, texture: "pocion-salud" },
        ];

        // Filtrar objetos que ya han sido recogidos usando GameStateManager
        const filteredObjects = objectsToSpawn.filter((objConfig) =>
            this.gameStateManager.shouldSpawnItem(objConfig.itemId)
        );

        // Crear los objetos interactuables que no han sido recogidos
        filteredObjects.forEach((objConfig) => {
            const obj = new InteractableObject(this, objConfig.x, objConfig.y, objConfig.itemId, objConfig.texture);
            this.interactableObjects.push(obj);
        });

        console.log(
            `Creados ${this.interactableObjects.length} items recolectables (${
                objectsToSpawn.length - filteredObjects.length
            } ya fue descubierto)`
        );
    }

    setupCollisions() {
        // Colisiones con las capas de colisión del mapa
        [
            this.mapManager.collisionLayer1,
            this.mapManager.collisionLayer2,
            this.mapManager.collisionLayer3,
            this.mapManager.perspectiveLayer,
        ].forEach((layer) => {
            if (layer) {
                // Colisión para el jugador
                this.physics.add.collider(this.player.sprite, layer);

                // Colisión para enemigos y bosses
                [...this.enemies, ...this.bosses].forEach((entity) => {
                    this.physics.add.collider(entity.sprite, layer);
                });
            }
        });

        // Colisiones con NPC
        if (this.trainer) {
            this.trainer.setupCollision(this.player);
        }

        // Colisiones con enemigos
        this.enemies.forEach((enemy) => enemy.setupCollision(this.player));

        // Colisiones con bosses
        this.bosses.forEach((boss) => boss.setupCollision(this.player));

        // Colisiones para todas las hogueras
        this.fireplaces.forEach((fireplace) => {
            fireplace.setupCollision(this.player);
        });
    }

    setupCamera() {
        this.controls = new Controls(this);
        this.camera = new Camera(this, this.player, this.mapManager);
    }

    setupConsoleCommands() {
        // Aseguramos que estamos usando el inventario del jugador
        this.gameState.inventory = this.player.inventory;

        // ñadir una referencia al player con acceso al gameStateManager
        this.gameState.player = {
            ...this.player,
            scene: {
                ...this.player.scene,
                gameStateManager: this.gameStateManager,
            },
        };

        // Configuramos los comandos de consola
        setupConsoleCommands(this.gameState);

        // Mensaje informativo en consola
        console.log("💡 Comandos disponibles en consola: saveGame()");
    }

    enableDebugMode() {
        // Crear gráficos de debug directamente sin comprobar la configuración
        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = true;

        // Mostrar colisiones de cuerpos físicos con un color más visible
        this.physics.world.debugBodyColor = 0xff00ff;

        // Hacer que los bordes sean más visibles
        this.physics.world.debugGraphic.lineStyle(2, 0xff00ff, 1);

        // Mostrar información de debug para enemigos
        this.enemies.forEach((enemy) => {
            // Establecer colores específicos para los hitboxes de los enemigos
            if (enemy.sprite && enemy.sprite.body) {
                enemy.sprite.body.debugBodyColor = 0xff0000;
            }
        });
    }

    update() {
        // Verificar que los controles y el jugador estén inicializados
        if (this.controls && this.player) {
            this.controls.update(this.player);

            // Solo actualizar el jugador si los controles están disponibles
            if (this.controls.getCursors) {
                this.player.update(this.controls.getCursors());
            }
        }

        // // Mantiene solo los enemigos que no han sido destruidos
        // this.enemies = this.enemies.filter((enemy) => !enemy.isDestroyed);

        // Profundidad Trainer
        if (this.trainer) {
            this.player.sprite.depth = this.player.sprite.y;
            this.trainer.sprite.depth = this.trainer.sprite.y;
        }

        // Profundidad hogueras
        this.fireplaces.forEach((fireplace) => {
            if (fireplace.sprite) {
                fireplace.sprite.depth = fireplace.sprite.y;
            }
        });

        // Profundidad de objetos interactuables
        this.interactableObjects.forEach((obj) => {
            if (obj.sprite && !obj.collected) {
                obj.sprite.depth = obj.sprite.y;
            }
        });
    }
}
