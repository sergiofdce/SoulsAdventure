import Player from "../entities/characters/Player.js";
import Controls from "../managers/Controls.js";
import Camera from "../managers/Camera.js";
import Map from "../managers/Map.js";
import { Trainer } from "../entities/characters/Trainer.js";
import { Fireplace } from "../entities/characters/Fireplace.js";
import { EnanoFuego } from "../entities/enemies/EnanoFuego.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.enemies = [];
        this.fireplaces = []; // Initialize fireplaces array here
    }

    preload() {
        this.loadAssets();
    }

    create() {
        // Configurar controles de entrada
        this.setupInput();

        // Configurar el mapa y límites del mundo
        this.setupMap();

        // Generar NPCs en el mapa
        this.spawnNPCs();

        // Generar enemigos en el mapa
        this.spawnEnemies();

        // Generar objetos en el mapa
        this.spawnObjects();

        // Instanciar el jugador
        this.spawnPlayer();

        // Configurar colisiones entre objetos
        this.setupCollisions();

        // Configurar la cámara para seguir al jugador
        this.setupCamera();

        // Activar modo debug si está habilitado en la configuración
        //this.enableDebugMode();
    }

    loadAssets() {
        // Cargar assets Player
        this.load.spritesheet("player", "./assets/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        // Cargar assets NPCs
        this.load.spritesheet("trainer", "./assets/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        // Cargar assets Enemigos
        this.load.spritesheet("enemy001", "./assets/enemy-EnanoFuego.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        // Cargar asset hoguera
        this.load.spritesheet("fireplace", "./assets/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        // Cargar assets Mapa
        this.load.tilemapTiledJSON("map", "assets/maps/map.json");
        this.load.image("tiles", "assets/tilesets/Tilesets/RA_Overworld_Full.png");
    }

    setupInput() {
        this.input.keyboard.on("keydown-C", () => {
            this.scene.pause();
            this.scene.launch("CombatScene");
        });

        this.input.keyboard.on("keydown-I", () => {
            this.scene.pause();
            this.scene.launch("InventoryScene", { player: this.player });
        });

        this.input.keyboard.on("keydown-E", () => {
            if (this.trainer.isInRange(this.player)) {
                this.trainer.interact(this.player);
            }

            // Check interaction with all fireplaces
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

    spawnNPCs() {
        this.trainer = new Trainer(this, 350, 200, "trainer");
    }

    spawnEnemies() {
        const enemyPositions = [
            { x: 600, y: 300 },
            { x: 580, y: 250 },
        ];

        enemyPositions.forEach((pos) => {
            const enemy = new EnanoFuego(this, pos.x, pos.y);
            this.enemies.push(enemy);
        });
    }

    spawnObjects() {
        // Hoguera principal cerca del entrenador
        const fireplace1 = new Fireplace(this, 450, 200, "fireplace");
        fireplace1.fireplaceName = "Hoguera del Entrenador";
        fireplace1.sprite.setTint(0xff6b6b);
        this.fireplaces.push(fireplace1);

        // Otras hogueras en diferentes ubicaciones del mapa
        const fireplace2 = new Fireplace(this, 700, 350, "fireplace");
        fireplace2.fireplaceName = "Hoguera del Bosque";
        fireplace2.sprite.setTint(0xff6b6b);
        this.fireplaces.push(fireplace2);

        const fireplace3 = new Fireplace(this, 200, 500, "fireplace");
        fireplace3.fireplaceName = "Hoguera del Lago";
        fireplace3.sprite.setTint(0xff6b6b);
        this.fireplaces.push(fireplace3);
    }

    spawnPlayer() {
        this.player = new Player(this, 400, 300, "player");
    }

    setupCollisions() {
        // Colisiones con el mapa (jugador)
        if (this.mapManager.collisionLayer) {
            this.physics.add.collider(this.player.sprite, this.mapManager.collisionLayer);
        }

        // Colisiones con el mapa (enemigos)
        this.enemies.forEach((enemy) => {
            if (this.mapManager.collisionLayer) {
                this.physics.add.collider(enemy.sprite, this.mapManager.collisionLayer);
            }
        });

        // Colisiones con NPC
        this.trainer.setupCollision(this.player);

        // Colisiones con enemigos
        this.enemies.forEach((enemy) => enemy.setupCollision(this.player));

        // Colisiones para todas las hogueras
        this.fireplaces.forEach((fireplace) => {
            fireplace.setupCollision(this.player);
        });
    }

    setupCamera() {
        this.controls = new Controls(this);
        this.camera = new Camera(this, this.player, this.mapManager);
    }

    enableDebugMode() {
        // Crear gráficos de debug directamente sin comprobar la configuración
        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = true;

        // Mostrar colisiones de cuerpos físicos
        this.physics.world.debugBodyColor = 0xff00ff;
    }

    update() {
        this.player.update(this.controls.getCursors());
        this.enemies = this.enemies.filter((enemy) => !enemy.isDestroyed);

        // Profundidad assets player y NPC
        this.player.sprite.depth = this.player.sprite.y;
        this.trainer.sprite.depth = this.trainer.sprite.y;

        // Profundidad para todas las hogueras
        this.fireplaces.forEach((fireplace) => {
            if (fireplace.sprite) {
                fireplace.sprite.depth = fireplace.sprite.y;
            }
        });
    }
}
