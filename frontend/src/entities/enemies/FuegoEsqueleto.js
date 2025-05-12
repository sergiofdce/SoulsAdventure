import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class FuegoEsqueleto extends Enemy {
    constructor(scene, x, y, texture = "enemy-FuegoEsqueleto") {
        const enemyData = ENEMIES.FuegoEsqueleto;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "FuegoEsqueleto";

        // Iniciar con la animación idle
        this.sprite.play("FuegoEsqueleto-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-FuegoEsqueleto.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "FuegoEsqueleto-idle",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoEsqueleto", { start: 0, end: 5 }),
            frameRate: 7,
            repeat: -1,
        });

        scene.anims.create({
            key: "FuegoEsqueleto-walk",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoEsqueleto", { start: 0, end: 5 }),
            frameRate: 14,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 7, repeat: -1 },
            walk: { start: 6, end: 11, frameRate: 14, repeat: -1 },
            hit: { start: 24, end: 29, frameRate: 10, repeat: 0 },
            attack: { start: 12, end: 17, frameRate: 12, repeat: 0 },
            death: { start: 30, end: 35, frameRate: 6, repeat: 0 },
        };
    }

    kill() {
        console.log("FuegoEsqueleto killed");
        super.kill();
    }
}
