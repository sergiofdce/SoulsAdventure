export class Entity {
    constructor(scene, x, y, texture, name) {
        this.sprite = null;
        this.scene = scene;
        this.name = name;
        this.interactionRadius = 50;
    }

    isInRange(player) {
        const distance = Phaser.Math.Distance.Between(player.sprite.x, player.sprite.y, this.sprite.x, this.sprite.y);

        return distance <= this.interactionRadius;
    }

    setupCollision(player) {}

    setupSprite(sprite, scale = 0.5) {
        sprite.setScale(scale);

        // Configuración mejorada del hitbox con alineación vertical adecuada
        const scaledWidth = sprite.displayWidth;
        const scaledHeight = sprite.displayHeight;

        // Hacer el hitbox más pequeño para una mejor jugabilidad
        const bodyWidth = scaledWidth * 0.5;
        const bodyHeight = scaledHeight * 0.3; // Altura más pequeña

        // Posicionar el hitbox en la parte inferior del sprite (área de los pies)
        const offsetX = (scaledWidth - bodyWidth) / 2;
        const offsetY = scaledHeight * 0.7; // Mover hitbox hacia abajo al área de los pies

        // Aplicar el hitbox, teniendo en cuenta la escala
        sprite.body.setSize(bodyWidth / scale, bodyHeight / scale);
        sprite.body.setOffset(offsetX / scale, offsetY / scale);

        return sprite;
    }
}

// Clase para los enemigos
export class Enemy extends Entity {
    constructor(scene, x, y, texture, name) {
        super(scene, x, y, texture, name);
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.setupSprite(this.sprite);

        // Movimiento
        this.interactionRadius = 100;
        this.followSpeed = 100;

        // Flags
        this.isDestroyed = false;

        this.updateEnemy = () => {
            if (this.sprite && this.scene.player) {
                this.follow(this.scene.player);

                if (this.playerRef && !this.isDestroyed) {
                    const distance = Phaser.Math.Distance.Between(
                        this.playerRef.sprite.x,
                        this.playerRef.sprite.y,
                        this.sprite.x,
                        this.sprite.y
                    );

                    if (distance < 30) {
                        this.kill();
                    }
                }
            }
        };
        this.scene.events.on("update", this.updateEnemy);
    }

    // Seguir a player
    follow(player) {
        if (this.isInRange(player)) {
            // Calcular dirección
            const directionX = player.sprite.x - this.sprite.x;
            const directionY = player.sprite.y - this.sprite.y;

            // Crear vector
            const length = Math.sqrt(directionX * directionX + directionY * directionY);

            if (length > 0) {
                // Velocidad
                this.sprite.setVelocityX((directionX / length) * this.followSpeed);
                this.sprite.setVelocityY((directionY / length) * this.followSpeed);

                // Sentido
                if (directionX < 0) {
                    this.sprite.setFlipX(true);
                } else {
                    this.sprite.setFlipX(false);
                }
            }
        } else {
            if (this.sprite) {
                this.sprite.setVelocity(0);
            }
        }
    }

    // Colisiones
    setupCollision(player) {
        this.playerRef = player;
    }

    kill() {
        // Evitar llamadas de updateEnemy
        if (this.isDestroyed) return;

        // Flag para indicar que el enemigo ha sido eliminado
        this.isDestroyed = true;

        // Eliminar el event listener de actualización
        if (this.scene) {
            this.scene.events.off("update", this.updateEnemy);
        }

        // Destruir el sprite si aún existe
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }

        console.log(`La entidad ${this.name} ha sido eliminada`);
    }
}

// Clase para los NPCs
export class NPC extends Entity {
    constructor(scene, x, y, texture, name, dialogue) {
        super(scene, x, y, texture, name);
        this.dialogue = dialogue;
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setImmovable(true);
        this.setupSprite(this.sprite);
        this.currentDialogueIndex = 0;
        this.interactionRadius = 50;
    }

    // Colisiones
    setupCollision(player) {
        this.scene.physics.add.collider(this.sprite, player.sprite);
    }
}
