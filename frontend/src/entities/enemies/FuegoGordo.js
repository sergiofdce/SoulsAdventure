import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class FuegoGordo extends Enemy {
    constructor(scene, x, y, texture = "enemy-FuegoGordo") {
        const enemyData = ENEMIES.FuegoGordo;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "FuegoGordo";

        // Iniciar con la animación idle
        this.sprite.play("FuegoGordo-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-FuegoGordo.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "FuegoGordo-idle",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoGordo", { start: 0, end: 5 }),
            frameRate: 3,
            repeat: -1,
        });

        scene.anims.create({
            key: "FuegoGordo-walk",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoGordo", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 3, repeat: -1 },
            walk: { start: 0, end: 5, frameRate: 5, repeat: -1 },
            hit: { start: 24, end: 29, frameRate: 5, repeat: 0 },
            attack: { start: 30, end: 35, frameRate: 7, repeat: 0 },
            death: { start: 36, end: 41, frameRate: 4, repeat: 0 },
        };
    }

    kill() {
        console.log("FuegoGordo killed");
        super.kill();
    }
}
