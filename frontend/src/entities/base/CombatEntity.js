import { Entity } from "./Entity.js";

export class CombatEntity extends Entity {
    constructor(scene, x, y, texture, name, options = {}) {
        super(scene, x, y, texture, name);

        // Opciones de configuración con valores por defecto (simplificadas)
        this.hitboxConfig = {
            widthRatio: options.hitboxWidthRatio,
            heightRatio: options.hitboxHeightRatio,
            offsetYRatio: options.hitboxOffsetYRatio,
            scale: options.scale,
        };

        // Movimiento
        this.interactionRadius = options.interactionRadius;
        this.followSpeed = options.followSpeed;

        // Propiedades para el movimiento libre
        this.initialPosition = { x, y };
        this.wanderingRadius = options.wanderingRadius || 100; // Radio predeterminado
        this.wanderingSpeed = 25;
        this.isWandering = false;
        this.wanderingTargetPosition = null;
        this.wanderingCooldown = options.wanderingCooldown || 3000; // 3 segundos por defecto
        this.lastWanderingChange = 0;

        // Sprite
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.setScale(this.hitboxConfig.scale);

        // Configurar el hitbox
        this.setupCombatHitbox();

        // Flags
        this.isDestroyed = false;
        this.gracePeriodActive = false;

        // Asegurarnos de que type esté definido por defecto (se puede sobrescribir en subclases)
        this.type = texture;

        // Update function - reconfigurada para dar más contexto en logs
        this.updateEntity = () => {
            if (!this.sprite || !this.scene) {
                console.log(`${this.name} - No puede actualizarse: sprite o escena no disponible`);
                return;
            }

            if (this.isDestroyed) {
                console.log(`${this.name} - No puede actualizarse: entidad destruida`);
                return;
            }

            if (!this.scene.player) {
                console.log(`${this.name} - No puede actualizarse: jugador no disponible en la escena`);
                return;
            }

            // Intentar seguir al jugador
            // this.follow(this.scene.player);

            // Comprobar distancia para iniciar combate
            if (this.playerRef && !this.isDestroyed) {
                const distance = Phaser.Math.Distance.Between(
                    this.playerRef.sprite.x,
                    this.playerRef.sprite.y,
                    this.sprite.x,
                    this.sprite.y
                );

                if (distance < 30 && !this.gracePeriodActive) {
                    console.log(`${this.name} - Iniciando combate, distancia: ${distance}`);
                    this.scene.scene.pause("GameScene");
                    this.startCombat();
                }
            }
        };

        // Configurar el evento update inmediatamente si la escena ya está lista
        if (scene.events) {
            // Si la escena está en el evento create o después
            if (scene.sys.settings.status >= Phaser.Scenes.CREATING) {
                scene.events.on("update", this.updateEntity);
            } else {
                // Si la escena aún no está lista, esperar al evento create
                scene.events.once("create", () => {
                    scene.events.on("update", this.updateEntity);
                });
            }
        } else {
            console.error(`${this.name} - No se pudo configurar el evento update: scene.events no disponible`);
        }
    }

    // Método centralizado para configurar el hitbox
    setupCombatHitbox() {
        const scaledWidth = this.sprite.displayWidth;
        const scaledHeight = this.sprite.displayHeight;

        const bodyWidth = scaledWidth * this.hitboxConfig.widthRatio;
        const bodyHeight = scaledHeight * this.hitboxConfig.heightRatio;

        const offsetX = (scaledWidth - bodyWidth) / 2;
        const offsetY = scaledHeight * this.hitboxConfig.offsetYRatio;

        this.sprite.body.setSize(bodyWidth / this.hitboxConfig.scale, bodyHeight / this.hitboxConfig.scale);
        this.sprite.body.setOffset(offsetX / this.hitboxConfig.scale, offsetY / this.hitboxConfig.scale);

        return this.sprite;
    }

    // Seguir a player
    follow(player) {
        if (!this.sprite || !this.sprite.body || this.isDestroyed) {
            return;
        }

        const now = Date.now();

        // Si está en rango del jugador, seguirlo
        if (this.isInRange(player)) {
            this.isWandering = false; // Dejar de vagar si está siguiendo al jugador

            // Calcular dirección
            const directionX = player.sprite.x - this.sprite.x;
            const directionY = player.sprite.y - this.sprite.y;
            const length = Math.sqrt(directionX * directionX + directionY * directionY);

            if (length > 0) {
                // Velocidad
                this.sprite.setVelocityX((directionX / length) * this.followSpeed);
                this.sprite.setVelocityY((directionY / length) * this.followSpeed);

                // Sentido
                this.sprite.setFlipX(directionX < 0);

                // Animación caminar
                if (this.sprite.anims.currentAnim?.key !== `${this.type}-walk`) {
                    this.sprite.play(`${this.type}-walk`);
                }
            }
        } else {
            // Si no está en rango del jugador, vagar aleatoriamente
            this.wander(now);
        }
    }

    // Método para gestionar el movimiento aleatorio
    wander(now) {
        // Verificar si es tiempo de cambiar la dirección o si aún no se ha establecido un objetivo
        if (!this.wanderingTargetPosition || now - this.lastWanderingChange > this.wanderingCooldown) {
            // Generar un punto aleatorio dentro del radio de vagabundeo
            this.generateWanderingTarget();
            this.lastWanderingChange = now;
        }

        // Si tenemos un objetivo, movernos hacia él
        if (this.wanderingTargetPosition) {
            const dirX = this.wanderingTargetPosition.x - this.sprite.x;
            const dirY = this.wanderingTargetPosition.y - this.sprite.y;
            const dist = Math.sqrt(dirX * dirX + dirY * dirY);

            // Si estamos cerca del objetivo, generar uno nuevo
            if (dist < 5) {
                this.generateWanderingTarget();
            } else {
                // Moverse hacia el objetivo
                this.sprite.setVelocityX((dirX / dist) * this.wanderingSpeed);
                this.sprite.setVelocityY((dirY / dist) * this.wanderingSpeed);

                // Sentido
                this.sprite.setFlipX(dirX < 0);

                // Animación caminar
                if (this.sprite.anims.currentAnim?.key !== `${this.type}-walk`) {
                    this.sprite.play(`${this.type}-walk`);
                }

                this.isWandering = true;
            }
        } else {
            // Si no hay objetivo, quedarse quieto
            this.sprite.setVelocity(0);

            // Animación idle
            if (this.sprite.anims.currentAnim?.key !== `${this.type}-idle`) {
                this.sprite.play(`${this.type}-idle`);
            }

            this.isWandering = false;
        }
    }

    // Método para generar una posición objetivo aleatoria
    generateWanderingTarget() {
        // Calcular distancia actual desde la posición inicial
        const dx = this.sprite.x - this.initialPosition.x;
        const dy = this.sprite.y - this.initialPosition.y;
        const distanceFromStart = Math.sqrt(dx * dx + dy * dy);

        // Si está demasiado lejos de la posición inicial, regresar hacia ella
        if (distanceFromStart > this.wanderingRadius * 0.8) {
            this.wanderingTargetPosition = {
                x: this.initialPosition.x + (Math.random() * 0.4 - 0.2) * this.wanderingRadius,
                y: this.initialPosition.y + (Math.random() * 0.4 - 0.2) * this.wanderingRadius,
            };
        } else {
            // Generar un punto aleatorio dentro del radio
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.wanderingRadius;
            this.wanderingTargetPosition = {
                x: this.initialPosition.x + Math.cos(angle) * distance,
                y: this.initialPosition.y + Math.sin(angle) * distance,
            };
        }
    }

    // Detectar si el jugador está en el rango de interacción
    isInRange(entity) {
        if (!entity || !entity.sprite || !this.sprite) {
            console.log(`${this.name} - Error: Entidad o sprite no encontrado`);
            return false;
        }

        const distance = Phaser.Math.Distance.Between(entity.sprite.x, entity.sprite.y, this.sprite.x, this.sprite.y);

        return distance <= this.interactionRadius;
    }

    // Colisiones
    setupCollision(player) {
        this.playerRef = player;
    }

    // Método a implementar por las subclases
    startCombat() {}

    kill() {
        if (this.isDestroyed) return;

        this.isDestroyed = true;

        if (this.scene) {
            this.scene.events.off("update", this.updateEntity);
        }

        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }

        console.log(`La entidad ${this.name} ha sido eliminada`);
    }
}
