import { Boss } from "./Boss.js";

export class Lobo extends Boss {
    constructor(scene, x, y, texture = "boss-Lobo", name = "Lobo") {
        // Asignar tamaño del sprite
        const scale = 1.2;
        super(scene, x, y, texture, name, scale);

        // Atributos específicos
        this.health = 50;
        this.strength = 10;
        this.speed = 5;

        // Ruta del spritesheet
        this.spritesheet = "./assets/bosses/boss-Lobo.png";

        // Crear animaciones
        this.createAnimations();
    }

    createAnimations() {
        this.scene.anims.create({
            key: "lobo-walk",
            frames: this.scene.anims.generateFrameNumbers("boss-Lobo", {
                start: 6,
                end: 11,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "lobo-idle",
            frames: this.scene.anims.generateFrameNumbers("boss-Lobo", {
                start: 0,
                end: 5,
            }),
            frameRate: 5,
            repeat: -1,
        });
    }

    // Override the follow method to include animation
    follow(player) {
        super.follow(player);

        // Add animation based on movement
        if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
            this.sprite.anims.play("lobo-walk", true);
        } else {
            this.sprite.anims.play("lobo-idle", true);
        }
    }

    kill() {
        super.kill();
    }
}
