import { Boss } from "./Boss.js";

export class Nasus extends Boss {
    constructor(scene, x, y, texture = "boss-Nasus", name = "Nasus") {
        // Asignar tamaño del sprite
        const scale = 1.2;
        super(scene, x, y, texture, name, scale);

        // Guardar el scale como atributo
        this.scale = scale;

        // Atributos específicos
        this.health = 10;
        this.strength = 10;
        this.speed = 5;

        this.souls= 200;

        // Patrón de ataque (0 = ataque, 1 = indefenso)
        this.attackPattern = [0, 1, 0, 0, 1];
        this.currentPatternIndex = 0;

        // Intervalo entre ataques (en milisegundos)
        this.attackInterval = 2000;

        // Crear animaciones
        this.createAnimations(scene);

        // Tipo de entidad para animaciones
        this.type = "nasus";

        // Ruta del spritesheet
        this.spritesheet = "./assets/bosses/boss-Nasus.png";
    }

    getNextAction() {
        const action = this.attackPattern[this.currentPatternIndex];
        this.currentPatternIndex = (this.currentPatternIndex + 1) % this.attackPattern.length;
        return action;
    }

    getCurrentAction() {
        return this.attackPattern[this.currentPatternIndex];
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "nasus-idle",
            frames: scene.anims.generateFrameNumbers("boss-Nasus", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1,
        });

        scene.anims.create({
            key: "nasus-walk",
            frames: scene.anims.generateFrameNumbers("boss-Nasus", { start: 6, end: 17 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 5, repeat: -1 },
            walk: { start: 6, end: 17, frameRate: 10, repeat: -1 },
            attack: { start: 18, end: 23, frameRate: 8, repeat: 0 },
            hit: { start: 30, end: 35, frameRate: 8, repeat: 0 },
            death: { start: 36, end: 42, frameRate: 5, repeat: 0 },
        };
    }

    kill() {
        super.kill();
    }
}
