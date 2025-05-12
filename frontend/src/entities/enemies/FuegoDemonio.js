import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class FuegoDemonio extends Enemy {
    constructor(scene, x, y, texture = "enemy-FuegoDemonio") {
        const enemyData = ENEMIES.FuegoDemonio;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "FuegoDemonio";

        // Iniciar con la animación idle
        this.sprite.play("FuegoDemonio-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-FuegoDemonio.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "FuegoDemonio-idle",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoDemonio", { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1,
        });

        scene.anims.create({
            key: "FuegoDemonio-walk",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoDemonio", { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 6, repeat: -1 },
            walk: { start: 6, end: 11, frameRate: 10, repeat: -1 },
            hit: { start: 30, end: 35, frameRate: 10, repeat: 0 },
            attack: { start: 24, end: 29, frameRate: 12, repeat: 0 },
            death: { start: 36, end: 41, frameRate: 7, repeat: 0 },
        };
    }

    kill() {
        console.log("FuegoDemonio killed");
        super.kill();
    }
}
