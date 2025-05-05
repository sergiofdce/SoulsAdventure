import { Enemy } from "./Enemy.js";
import { ENEMIES } from "../../config/constants.js";

export class EnanoObservador extends Enemy {
    constructor(scene, x, y, texture = "enemy-EnanoObservador") {
        const enemyData = ENEMIES.EnanoObservador;
        super(scene, x, y, texture, enemyData.name, enemyData.scale);

        // Atributos específicos
        this.health = enemyData.health;
        this.strength = enemyData.strength;
        this.speed = enemyData.speed;
        this.souls = enemyData.souls;

        // Animaciones
        this.createAnimations(scene);

        // Atributo para definir animaciones {this.type}-idle
        this.type = "EnanoObservador";

        // Iniciar con la animación idle
        this.sprite.play("EnanoObservador-idle");

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-EnanoObservador.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "EnanoObservador-idle",
            frames: scene.anims.generateFrameNumbers("enemy-EnanoObservador", { start: 0, end: 5 }),
            frameRate: 3, // Más lento en sus movimientos
            repeat: -1,
        });

        scene.anims.create({
            key: "EnanoObservador-walk",
            frames: scene.anims.generateFrameNumbers("enemy-EnanoObservador", { start: 6, end: 11 }),
            frameRate: 6,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 3, repeat: -1 },
            walk: { start: 6, end: 11, frameRate: 6, repeat: -1 },
            hit: { start: 18, end: 23, frameRate: 7, repeat: 0 },
            attack: { start: 12, end: 17, frameRate: 7, repeat: 0 },
            death: { start: 24, end: 29, frameRate: 4, repeat: 0 },
        };
    }

    kill() {
        console.log("EnanoObservador killed");
        super.kill();
    }
}
