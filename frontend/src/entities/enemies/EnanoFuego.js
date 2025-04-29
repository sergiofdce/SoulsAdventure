import { Enemy } from "../base/Entity.js";

export class EnanoFuego extends Enemy {
    constructor(
        scene,
        x,
        y,
        texture = "asset-EnanoFuego",
        interactionRadius = 150,
        followSpeed = 180,
        name = "Enano de fuego"
    ) {
        super(scene, x, y, texture, name);

        this.interactionRadius = interactionRadius;
        this.followSpeed = followSpeed;

        // Atributos
        this.health = 20;
        this.strength = 3;
        this.speed = 2;

        // Sprite
        this.spritesheet = "./assets/enemy-EnanoFuego.png";

        // Escala
        const scale = 0.5;

        // Cambiar color
        this.sprite.setTint(0xff9999);

        // Enable physics body
        this.sprite.body.setEnable(true);

        // Create animations
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
                    end: 0,
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
