export default class Player {
    constructor(scene, x, y, texture) {
        // Configuración Phaser
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setScale(0.5);
        this.sprite.setCollideWorldBounds(true);

        // Configure hitbox a la escala
        const scale = this.sprite.scale;
        const scaledWidth = this.sprite.displayWidth;
        const scaledHeight = this.sprite.displayHeight;

        // Hitbox en los pies del asset
        const bodyWidth = scaledWidth * 0.5;
        const bodyHeight = scaledHeight * 0.3;

        // Offset
        const offsetX = (scaledWidth - bodyWidth) / 2;
        const offsetY = scaledHeight * 0.7; // Zona inferior

        this.sprite.body.setSize(bodyWidth / scale, bodyHeight / scale);
        this.sprite.body.setOffset(offsetX / scale, offsetY / scale);

        this.createAnimations(scene);

        // Instanciar habilidades
        this.health = 100;
        this.strength = 20;
        this.energy = 60;
        this.speed = 30;
        this.souls = 0;
    }

    // Animación
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

    // Controles
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
