import { Enemy } from "../base/Entity.js";

export class Lobo extends Enemy {
    constructor(scene, x, y, texture = "boss-Lobo", name = "Lobo") {
        // Configurar todas las opciones del boss en un único objeto
        const bossOptions = {
            // Propiedades de movimiento
            interactionRadius: 150,
            followSpeed: 180,

            // Propiedades de hitbox
            hitboxWidthRatio: 0.6, // Hitbox más ancho para el lobo
            hitboxHeightRatio: 0.3, // Un poco más alto que enemigos normales
            hitboxOffsetYRatio: 0.7, // Posicionado en la parte inferior
            scale: 1.2, // Escala más grande para un boss

            // Atributos de combate
            health: 20,
            strength: 3,
            speed: 2,

            // Propiedades visuales
            tint: 0xcccccc, // Tinte grisáceo para el lobo
            spritesheet: "./assets/bosses/boss-Lobo.png",
        };

        super(scene, x, y, texture, name, bossOptions);

        // Asignar valores de opciones a propiedades
        this.health = bossOptions.health;
        this.strength = bossOptions.strength;
        this.speed = bossOptions.speed;
        this.spritesheet = bossOptions.spritesheet;

        // Aplicar tinte si está definido
        if (bossOptions.tint) {
            this.sprite.setTint(bossOptions.tint);
        }

        // Activar física
        this.sprite.body.setEnable(true);

        // Crear animaciones
        this.createAnimations();
    }

    createAnimations() {
        if (!this.scene.anims.exists("lobo-walk")) {
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
        console.log("lobo killed");
        super.kill();
    }
}
