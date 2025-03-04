import Player from "../entities/Player.js";
import Controls from "../managers/Controls.js";
import Camera from "../managers/Camera.js";
import Map from "../managers/Map.js";



export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" }); // Asigna una clave única a la escena
    }

    preload() {
        // Cargar assets Player
        this.load.spritesheet("player", "./assets/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        // Cargar assets Mapa
        this.load.tilemapTiledJSON("map", "assets/maps/map.json");
        this.load.image("tiles", "assets/tilesets/RA_Village.png");
    }

    create() {
        // Instanciar mapa
        this.mapManager = new Map(this, "map", "RA_Village", "tiles");
        
        // Configurar límites del mundo
        this.physics.world.setBounds(0, 0, this.mapManager.map.widthInPixels, this.mapManager.map.heightInPixels);
        
        // Instanciar Player
        this.player = new Player(this, 400, 300, "player");
        // Instanciar controles
        this.controls = new Controls(this);
        // Instanciar camara
        this.camera = new Camera(this, this.player, this.mapManager);

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
    }

    update() {
        this.player.update(this.controls.getCursors());
    }
}
