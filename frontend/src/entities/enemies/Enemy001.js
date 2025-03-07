import { Enemy } from "../base/Entity.js";

export class Enemy001 extends Enemy {
    constructor(
        scene,
        x,
        y,
        texture = "enemy001",
        interactionRadius = 150,
        followSpeed = 180
    ) {
        super(scene, x, y, texture, "Enemy001");

        this.interactionRadius = interactionRadius;
        this.followSpeed = followSpeed;

        // Apply specific collision adjustments if needed
        const scale = 0.5; // Assuming same scale as parent class

        // Cambiar color
        this.sprite.setTint(0xff9999);

        // Enable physics body
        this.sprite.body.setEnable(true);

        // Create animations
        this.createAnimations();
    }

    createAnimations() {
        if (!this.scene.anims.exists("enemy001-walk")) {
            this.scene.anims.create({
                key: "enemy001-walk",
                frames: this.scene.anims.generateFrameNumbers("enemy001", {
                    start: 0,
                    end: 5,
                }),
                frameRate: 10,
                repeat: -1,
            });

            this.scene.anims.create({
                key: "enemy001-idle",
                frames: this.scene.anims.generateFrameNumbers("enemy001", {
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
        if (
            this.sprite.body.velocity.x !== 0 ||
            this.sprite.body.velocity.y !== 0
        ) {
            this.sprite.anims.play("enemy001-walk", true);
        } else {
            this.sprite.anims.play("enemy001-idle", true);
        }
    }

    kill() {
        console.log("Enemy001 killed");
        super.kill();
    }
}
