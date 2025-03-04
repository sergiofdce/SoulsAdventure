// src/player.js
export default class Player {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setScale(0.5);
        this.sprite.setCollideWorldBounds(true);
        this.createAnimations(scene);
    }

    createAnimations(scene) {
        scene.anims.create({
            key: "idle",
            frames: scene.anims.generateFrameNumbers("player", {
            start: 0,
            end: 5,
            }),
            frameRate: 10,
            repeat: -1,
            repeatDelay: 5000,
        });

        scene.anims.create({
            key: "walk",
            frames: scene.anims.generateFrameNumbers("player", {
                start: 6,
                end: 11,
            }),
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: "turn",
            frames: [{ key: "player", frame: 0 }],
            frameRate: 20,
        });
    }

    update(cursors) {
        let isMoving = false;

        if (cursors.left.isDown) {
            this.sprite.setVelocityX(-160);
            this.sprite.setFlipX(true);
            isMoving = true;
        } else if (cursors.right.isDown) {
            this.sprite.setVelocityX(160);
            this.sprite.setFlipX(false);
            isMoving = true;
        } else {
            this.sprite.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            this.sprite.setVelocityY(-160);
            isMoving = true;
        } else if (cursors.down.isDown) {
            this.sprite.setVelocityY(160);
            isMoving = true;
        } else {
            this.sprite.setVelocityY(0);
        }

        if (isMoving) {
            this.sprite.anims.play("walk", true);
        } else {
            this.sprite.anims.play("idle", true);
        }
    }
}
