import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class FuegoSeta extends Enemy {
    constructor(scene, x, y, texture = "enemy-FuegoSeta") {
        const enemyData = ENEMIES.FuegoSeta;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "FuegoSeta";

        // Iniciar con la animación idle
        this.sprite.play("FuegoSeta-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-FuegoSeta.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "FuegoSeta-idle",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoSeta", { start: 0, end: 5 }),
            frameRate: 4,
            repeat: -1,
        });

        scene.anims.create({
            key: "FuegoSeta-walk",
            frames: scene.anims.generateFrameNumbers("enemy-FuegoSeta", { start: 0, end: 5 }),
            frameRate: 7,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 4, repeat: -1 },
            walk: { start: 0, end: 5, frameRate: 7, repeat: -1 },
            hit: { start: 18, end: 23, frameRate: 7, repeat: 0 },
            attack: { start: 12, end: 17, frameRate: 9, repeat: 0 },
            death: { start: 24, end: 29, frameRate: 5, repeat: 0 },
        };
    }

    kill() {
        console.log("FuegoSeta killed");
        super.kill();
    }
}
