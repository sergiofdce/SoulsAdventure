import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class FuegoGato extends Enemy {
    constructor(scene, x, y, texture = "enemy-FuegoGato") {
        const enemyData = ENEMIES.FuegoGato;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "FuegoGato";

        // Iniciar con la animación idle
        this.sprite.play("FuegoGato-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-FuegoGato.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "FuegoGato-idle",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoGato", { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1,
        });

        scene.anims.create({
            key: "FuegoGato-walk",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoGato", { start: 0, end: 5 }),
            frameRate: 15,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 8, repeat: -1 },
            walk: { start: 6, end: 11, frameRate: 15, repeat: -1 },
            hit: { start: 18, end: 23, frameRate: 10, repeat: 0 },
            attack: { start: 12, end: 17, frameRate: 16, repeat: 0 },
            death: { start: 24, end: 29, frameRate: 8, repeat: 0 },
        };
    }

    kill() {
        console.log("FuegoGato killed");
        super.kill();
    }
}
