import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class EnanoEscudo extends Enemy {
    constructor(scene, x, y, texture = "enemy-EnanoEscudo") {
        const enemyData = ENEMIES.EnanoEscudo;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "EnanoEscudo";

        // Iniciar con la animación idle
        this.sprite.play("EnanoEscudo-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-EnanoEscudo.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "EnanoEscudo-idle",
            frames: scene.anims.generateFrameNumbers("enemy-EnanoEscudo", { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1,
        });

        scene.anims.create({
            key: "EnanoEscudo-walk",
            frames: scene.anims.generateFrameNumbers("enemy-EnanoEscudo", { start: 6, end: 11 }),
            frameRate: 12,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 6, repeat: -1 },
            walk: { start: 6, end: 11, frameRate: 12, repeat: -1 },
            hit: { start: 18, end: 23, frameRate: 10, repeat: 0 },
            attack: { start: 12, end: 17, frameRate: 12, repeat: 0 },
            death: { start: 24, end: 29, frameRate: 6, repeat: 0 },
        };
    }

    kill() {
        console.log("EnanoEscudo killed");
        super.kill();
    }
}
