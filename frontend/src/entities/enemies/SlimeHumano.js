import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class SlimeHumano extends Enemy {
    constructor(scene, x, y, texture = "enemy-SlimeHumano") {
        const enemyData = ENEMIES.SlimeHumano;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "SlimeHumano";

        // Iniciar con la animación idle
        this.sprite.play("SlimeHumano-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-SlimeHumano.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "SlimeHumano-idle",
            frames: scene.anims.generateFrameNumbers("enemy-SlimeHumano", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1,
        });

        scene.anims.create({
            key: "SlimeHumano-walk",
            frames: scene.anims.generateFrameNumbers("enemy-SlimeHumano", { start: 0, end: 5 }),
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
        console.log("SlimeHumano killed");
        super.kill();
    }
}
