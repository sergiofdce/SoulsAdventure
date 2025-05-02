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

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.enemies = [];
        this.bosses = [];
        this.fireplaces = [];
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
        //this.spawnBosses();

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

        // Cargar assets Mapa
        this.load.tilemapTiledJSON("map", "assets/maps/map.json");
        this.load.image("tiles", "assets/tilesets/Tilesets/RA_Overworld_Full.png");
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
        // Instanciar mapa
        this.mapManager = new Map(this, "map", "RA_Overworld_Full", "tiles");
        // Configurar límites del mundo
        this.physics.world.setBounds(0, 0, this.mapManager.map.widthInPixels, this.mapManager.map.heightInPixels);
    }

    spawnTrainer() {
        this.trainer = new Trainer(this, 350, 200, "trainer");
    }

    spawnFireplaces() {
        // Hoguera principal
        const fireplace1 = new Fireplace(this, 450, 200, "fireplace");
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

        const enemyConfigs = [{ type: EnanoFuego, x: 300, y: 100 }];

        enemyConfigs.forEach(({ type, x, y }) => {
            const enemy = new type(this, x, y);
            this.enemies.push(enemy);
            console.log(`Enemigo creado: ${enemy.name}`, enemy);
        });

        console.log("Nuevos enemigos creados:", this.enemies.length);

        // Configurar colisiones y eventos para los nuevos enemigos
        if (this.mapManager && this.mapManager.collisionLayer) {
            this.enemies.forEach((enemy) => {
                if (enemy.sprite && this.mapManager.collisionLayer) {
                    // Configurar colisiones con el mapa
                    this.physics.add.collider(enemy.sprite, this.mapManager.collisionLayer);
                    console.log(`Configuradas colisiones con mapa para ${enemy.name}`);
                }
            });
        }

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

    spawnBosses() {
        const bossConfigs = [{ type: Lobo, x: 200, y: 200 }];

        bossConfigs.forEach(({ type, x, y }) => {
            const boss = new type(this, x, y);
            this.bosses.push(boss);
        });
    }

    spawnObjects() {
        // Aquí habrán armas tiradas en el suelo
    }

    spawnPlayer() {
        this.player = new Player(this, 90, 90, "player");

        // Usamos el inventario del jugador para el gameState
        this.gameState.inventory = this.player.inventory;
    }

    setupCollisions() {
        // Colisiones con el mapa
        if (this.mapManager.collisionLayer) {
            // Colisión para el jugador
            this.physics.add.collider(this.player.sprite, this.mapManager.collisionLayer);

            // Colisión para enemigos y bosses
            [...this.enemies, ...this.bosses].forEach((entity) => {
                this.physics.add.collider(entity.sprite, this.mapManager.collisionLayer);
            });
        }

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
    }
}
