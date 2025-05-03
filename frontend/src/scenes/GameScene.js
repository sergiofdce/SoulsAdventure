// Managers
import Player from "../entities/base/Player.js";
import Controls from "../managers/Controls.js";
import Camera from "../managers/Camera.js";
import Map from "../managers/Map.js";
import { setupConsoleCommands } from "../utils/consoleCommands.js";

// Enemigos
import { EnanoFuego } from "../entities/enemies/EnanoFuego.js";
// Bosses
import { Lobo } from "../entities/bosses/Lobo.js";

// Otros
import { Trainer } from "../entities/npcs/Trainer.js";
import { Fireplace } from "../entities/npcs/Fireplace.js";
import { InteractableObject } from "../entities/interactables/Objects.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.enemies = [];
        this.bosses = [];
        this.fireplaces = [];
        this.interactableObjects = []; // Nueva array para objetos interactuables
        this.gameState = {};
    }

    preload() {
        this.loadAssets();
    }

    create() {
        // Configurar controles de entrada
        this.setupInput();

        // Configurar el mapa y límites del mundo
        this.setupMap();

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

        // Instanciar el jugador
        this.spawnPlayer();

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
        this.load.spritesheet("enemy-enanoFuego", "./assets/enemies/enemy-EnanoFuego.png", {
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

        // Cargar sprite genérico para objetos
        this.load.image("object-sprite", "./assets/items/object-sprite.png");

        // Cargar assets específicos para los objetos interactuables
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

    spawnTrainer() {
        this.trainer = new Trainer(this, 700, 700, "trainer");
    }

    spawnFireplaces() {
        // Hoguera principal
        const fireplace1 = new Fireplace(this, 600, 670, "fireplace");
        fireplace1.fireplaceName = "01 Hoguera del Entrenador";
        fireplace1.sprite.setTint(0xff6b6b);
        this.fireplaces.push(fireplace1);

        // Otras hogueras
        const fireplace2 = new Fireplace(this, 700, 350, "fireplace");
        fireplace2.fireplaceName = "02 Hoguera del Bosque";
        fireplace2.sprite.setTint(0xff6b6b);
        this.fireplaces.push(fireplace2);

        const fireplace3 = new Fireplace(this, 200, 500, "fireplace");
        fireplace3.fireplaceName = "03 Hoguera del Lago";
        fireplace3.sprite.setTint(0xff6b6b);
        this.fireplaces.push(fireplace3);
    }

    spawnEnemies() {
        console.log("Limpiando enemigos existentes:", this.enemies.length);

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

        const enemyConfigs = [{ type: EnanoFuego, x: 400, y: 600 }];

        enemyConfigs.forEach(({ type, x, y }) => {
            const enemy = new type(this, x, y);
            this.enemies.push(enemy);
            console.log(`Enemigo creado: ${enemy.name}`, enemy);
        });

        console.log("Nuevos enemigos creados:", this.enemies.length);

        // Configurar colisiones y eventos para los nuevos enemigos
        this.setupEnemyMapCollisions();

        // Configurar colisiones con el jugador si ya existe
        if (this.player) {
            this.enemies.forEach((enemy) => {
                enemy.setupCollision(this.player);
                console.log(`Configuradas colisiones con jugador para ${enemy.name}`);

                // Asegurarnos de que el evento update está configurado
                if (enemy.updateEntity) {
                    // Primero, eliminar el evento si ya existía para evitar duplicados
                    this.events.off("update", enemy.updateEntity);
                    // Luego, añadir el nuevo evento
                    this.events.on("update", enemy.updateEntity);
                    console.log(`Configurado evento update para ${enemy.name}`);
                }
            });
        }
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
        const bossConfigs = [{ type: Lobo, x: 800, y: 600 }];

        bossConfigs.forEach(({ type, x, y }) => {
            const boss = new type(this, x, y);
            this.bosses.push(boss);
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
            // Aquí usamos el mismo ID como textura ya que coincide con el nombre del asset cargado
            { itemId: "escudo-dragon", x: 540, y: 550, texture: "escudo-dragon" },
            { itemId: "espada-larga", x: 700, y: 600, texture: "espada-larga" },
            { itemId: "pocion-salud", x: 650, y: 500, texture: "pocion-salud" },
        ];

        // Crear los objetos interactuables
        objectsToSpawn.forEach((objConfig) => {
            const obj = new InteractableObject(
                this,
                objConfig.x,
                objConfig.y,
                objConfig.itemId,
                objConfig.texture // Pasar la textura específica
            );
            this.interactableObjects.push(obj);

            // Añadir colisión física con el jugador (opcional)
            if (this.player && obj.sprite) {
                this.physics.add.collider(this.player.sprite, obj.sprite);
            }
        });

        console.log(`Spawned ${this.interactableObjects.length} interactable objects`);
    }

    spawnPlayer() {
        this.player = new Player(this, 630, 630, "player");

        // Usamos el inventario del jugador para el gameState
        this.gameState.inventory = this.player.inventory;
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

        // Configuramos los comandos de consola
        setupConsoleCommands(this.gameState);

        // Mensaje informativo en consola
        console.log(
            "💡 Comandos disponibles en consola: addItem(), listItems(), showInventory(), equipItem(), itemDetails()"
        );
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
        // Actualizar controles del jugador a través del objeto Controls
        if (this.controls && this.player) {
            this.controls.update(this.player);
        }

        // Controles
        this.player.update(this.controls.getCursors());

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
