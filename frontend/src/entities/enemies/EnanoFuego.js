import { Enemy } from "../base/Entity.js";

export class EnanoFuego extends Enemy {
    constructor(scene, x, y, texture = "enemy-enanoFuego", name = "Enano de fuego") {
        // Configurar todas las opciones del enemigo en un único objeto
        const enemyOptions = {
            // Propiedades de movimiento
            interactionRadius: 150,
            followSpeed: 180,

            // Propiedades de hitbox
            hitboxWidthRatio: 0.4,
            hitboxHeightRatio: 0.2,
            hitboxOffsetYRatio: 0.8,
            scale: 0.5,

            // Atributos de combate
            health: 20,
            strength: 3,
            speed: 2,

            // Propiedades visuales
            tint: 0xff9999,
            spritesheet: "./assets/enemies/enemy-EnanoFuego.png",
        };

        super(scene, x, y, texture, name, enemyOptions);

        // Asignar valores de opciones a propiedades
        this.health = enemyOptions.health;
        this.strength = enemyOptions.strength;
        this.speed = enemyOptions.speed;
        this.spritesheet = enemyOptions.spritesheet;

        // Aplicar tinte si está definido
        if (enemyOptions.tint) {
            this.sprite.setTint(enemyOptions.tint);
        }

        // Activar física
        this.sprite.body.setEnable(true);

        // Crear animaciones
        this.createAnimations();
    }

    createAnimations() {
        if (!this.scene.anims.exists("enanoFuego-walk")) {
            this.scene.anims.create({
                key: "enanoFuego-walk",
                frames: this.scene.anims.generateFrameNumbers("enemy-enanoFuego", {
                    start: 0,
                    end: 5,
                }),
                frameRate: 10,
                repeat: -1,
            });

            this.scene.anims.create({
                key: "enanoFuego-idle",
                frames: this.scene.anims.generateFrameNumbers("enemy-enanoFuego", {
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
            this.sprite.anims.play("enanoFuego-walk", true);
        } else {
            this.sprite.anims.play("enanoFuego-idle", true);
        }
    }

    kill() {
        console.log("EnanoFuego killed");
        super.kill();
    }
}
