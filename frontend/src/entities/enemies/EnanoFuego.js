import { Enemy } from "./Enemy.js";

export class EnanoFuego extends Enemy {
    constructor(scene, x, y, texture = "enemy-enanoFuego", name = "Enano de fuego") {
        // Asignar tamaño del sprite
        const scale = 0.5;
        super(scene, x, y, texture, name, scale);

        // Atributos específicos
        this.health = 10;
        this.strength = 3;
        this.speed = 5;

        // Animaciones
        this.createAnimations(scene);

        // Tipo de entidad para animaciones
        this.type = "enanoFuego";

        // Iniciar con la animación idle
        this.sprite.play("enanoFuego-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-EnanoFuego.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "enanoFuego-idle",
            frames: scene.anims.generateFrameNumbers("enemy-enanoFuego", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1,
        });

        scene.anims.create({
            key: "enanoFuego-walk",
            frames: scene.anims.generateFrameNumbers("enemy-enanoFuego", { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 5, repeat: -1 },
            walk: { start: 0, end: 5, frameRate: 10, repeat: -1 },
            hit: { start: 18, end: 23, frameRate: 8, repeat: 0 },
            "light-attack": { start: 12, end: 17, frameRate: 8, repeat: 0 },
            "heavy-attack": { start: 12, end: 17, frameRate: 8, repeat: 0 },
            death: { start: 24, end: 29, frameRate: 5, repeat: 0 },
        };
    }

    kill() {
        console.log("EnanoFuego killed");
        super.kill();
    }
}
