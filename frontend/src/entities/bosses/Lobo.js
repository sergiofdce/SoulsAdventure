import { Boss } from "./Boss.js";

export class Lobo extends Boss {
    constructor(scene, x, y, texture = "boss-Lobo", name = "Lobo") {
        // Asignar tamaño del sprite
        const scale = 1.2;
        super(scene, x, y, texture, name, scale);

        // Guardar el scale como atributo
        this.scale = scale;

        // Atributos específicos
        this.health = 50;
        this.strength = 10;
        this.speed = 5;

        // Tipo de entidad para animaciones
        this.type = "lobo";

        // Crear animaciones
        this.createAnimations(scene);

        // Ruta del spritesheet
        this.spritesheet = "./assets/bosses/boss-Lobo.png";
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "lobo-idle",
            frames: scene.anims.generateFrameNumbers("boss-Lobo", { start: 0, end: 5 }),
            frameRate: 5,
            repeat: -1,
        });

        scene.anims.create({
            key: "lobo-walk",
            frames: scene.anims.generateFrameNumbers("boss-Lobo", { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    getAnimationConfigs() {
        return {
            idle: { start: 0, end: 5, frameRate: 5, repeat: -1 },
            walk: { start: 0, end: 5, frameRate: 10, repeat: -1 },
            hit: { start: 18, end: 23, frameRate: 8, repeat: 0 },
            "light-attack": { start: 12, end: 17, frameRate: 8, repeat: 0 },
            "heavy-attack": { start: 12, end: 17, frameRate: 8, repeat: 0 },
            death: { start: 24, end: 29, frameRate: 5, repeat: 0 },
        };
    }

    kill() {
        super.kill();
    }
}
