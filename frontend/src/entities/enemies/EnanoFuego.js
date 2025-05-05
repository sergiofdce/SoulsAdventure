import { Enemy } from "./Enemy.js";

export class EnanoFuego extends Enemy {
    constructor(scene, x, y, texture = "enemy-EnanoFuego", name = "Enano de fuego") {
        // Asignar tamaño del sprite
        const scale = 0.5;
        super(scene, x, y, texture, name, scale);

        // Atributos específicos
        this.health = 10;
        this.strength = 3;
        this.speed = 5;

        this.souls = 20;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "EnanoFuego";

        // Iniciar con la animación idle
        this.sprite.play("EnanoFuego-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-EnanoFuego.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "EnanoFuego-idle",
            frames: scene.anims.generateFrameNumbers("enemy-EnanoFuego", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1,
        });

        scene.anims.create({
            key: "EnanoFuego-walk",
            frames: scene.anims.generateFrameNumbers("enemy-EnanoFuego", { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 5, repeat: -1 },
            walk: { start: 0, end: 5, frameRate: 10, repeat: -1 },
            hit: { start: 18, end: 23, frameRate: 8, repeat: 0 },
            attack: { start: 12, end: 17, frameRate: 8, repeat: 0 },
            death: { start: 24, end: 29, frameRate: 5, repeat: 0 },
        };
    }

    kill() {
        console.log("EnanoFuego killed");
        super.kill();
    }
}
