import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class FuegoWither extends Enemy {
    constructor(scene, x, y, texture = "enemy-FuegoWither") {
        const enemyData = ENEMIES.FuegoWither;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "FuegoWither";

        // Iniciar con la animación idle
        this.sprite.play("FuegoWither-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-FuegoWither.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "FuegoWither-idle",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoWither", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1,
        });

        scene.anims.create({
            key: "FuegoWither-walk",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoWither", { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 5, repeat: -1 },
            walk: { start: 0, end: 5, frameRate: 10, repeat: -1 },
            hit: { start: 18, end: 23, frameRate: 9, repeat: 0 },
            attack: { start: 12, end: 17, frameRate: 11, repeat: 0 },
            death: { start: 24, end: 29, frameRate: 6, repeat: 0 },
        };
    }

    kill() {
        console.log("FuegoWither killed");
        super.kill();
    }
}
