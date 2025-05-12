import { Boss } from "./Boss.js";
import { BOSSES } from "../../config/constants.js";

export class Infernal extends Boss {
    constructor(scene, x, y, texture = "boss-Infernal", name = "Infernal") {
        // Asignar tamaño del sprite
        const scale = BOSSES.Infernal.scale;
        super(scene, x, y, texture, name, scale);

        // Guardar el scale como atributo
        this.scale = scale;

        // Atributos específicos desde constants.js
        this.health = BOSSES.Infernal.health;
        this.strength = BOSSES.Infernal.strength;
        this.speed = BOSSES.Infernal.speed;
        this.souls = BOSSES.Infernal.souls;

        // Patrón de ataque (0 = ataque, 1 = indefenso)
        this.attackPattern = [0, 1, 0, 0, 1];
        this.currentPatternIndex = 0;

        // Intervalo entre ataques (en milisegundos)
        this.attackInterval = 3000;

        // Crear animaciones
        this.createAnimations(scene);

        // Tipo de entidad para animaciones
        this.type = "infernal";

        // Ruta del spritesheet
        this.spritesheet = "./assets/bosses/boss-Infernal.png";
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
            key: "infernal-idle",
            frames: scene.anims.generateFrameNumbers("boss-Infernal", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1,
        });

        scene.anims.create({
            key: "infernal-walk",
            frames: scene.anims.generateFrameNumbers("boss-Infernal", { start: 6, end: 11 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 5, repeat: -1 },
            walk: { start: 6, end: 11, frameRate: 10, repeat: -1 },
            attack: { start: 12, end: 17, frameRate: 8, repeat: 0 },
            hit: { start: 42, end: 48, frameRate: 8, repeat: 0 },
            death: { start: 49, end: 54, frameRate: 5, repeat: 0 },
        };
    }

    kill() {
        super.kill();
    }
}
