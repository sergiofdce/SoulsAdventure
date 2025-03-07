import Player from "../entities/characters/Player.js";
import Controls from "../managers/Controls.js";
import Camera from "../managers/Camera.js";
import Map from "../managers/Map.js";
import { Trainer } from "../entities/characters/Trainer.js";
import { Enemy001 } from "../entities/enemies/Enemy001.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.enemies = [];
    }

    preload() {
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
        // Assets Enemigos
        this.load.spritesheet("enemy001", "./assets/Enemy_001_A.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        // Cargar assets Mapa
        this.load.tilemapTiledJSON("map", "assets/maps/map.json");
        this.load.image("tiles", "assets/tilesets/RA_Village.png");
    }

    create() {
        // Escena combate
        this.input.keyboard.on("keydown-C", () => {
            this.scene.pause();
            this.scene.launch("CombatScene");
        });
        // Escena Inventario
        this.input.keyboard.on("keydown-I", () => {
            this.scene.pause();
            this.scene.launch("InventoryScene");
        });

        // Instanciar mapa
        this.mapManager = new Map(this, "map", "RA_Village", "tiles");
        // Configurar límites del mundo
        this.physics.world.setBounds(
            0,
            0,
            this.mapManager.map.widthInPixels,
            this.mapManager.map.heightInPixels
        );

        // Instanciar NPCs
        this.trainer = new Trainer(this, 200, 300, "trainer");

        // Instanciar Enemigos
        this.enemy001 = new Enemy001(this, 600, 300);
        this.enemy002 = new Enemy001(this, 580, 250);
        this.enemies.push(this.enemy001);
        this.enemies.push(this.enemy002);

        // Instanciar Player (siempre último)
        this.player = new Player(this, 400, 300, "player");

        // Colisiones
        this.setupCollisions();

        // Controles y Cámara
        this.controls = new Controls(this);
        this.camera = new Camera(this, this.player, this.mapManager);

        // Modo Debug
        this.physics.world.createDebugGraphic();
    }

    setupCollisions() {
        // Colisiones con el mapa
        if (this.mapManager.collisionLayer) {
            this.physics.add.collider(
                this.player.sprite,
                this.mapManager.collisionLayer
            );
        }

        // Colisiones con NPCs
        this.trainer.setupCollision(this.player);

        // Colisiones con objetos
        this.enemies.forEach((enemy) => {
            enemy.setupCollision(this.player);
        });

        // Interactuar
        this.input.keyboard.on("keydown-E", () => {
            // NPCs
            this.trainer.interact(this.player);
            // Objetos
        });
    }

    update() {
        this.player.update(this.controls.getCursors());

        // Check if any enemies collided with player and need to be removed from array
        this.enemies = this.enemies.filter((enemy) => !enemy.isDestroyed);
    }
}
