import { DialogManager } from "../../managers/DialogManager.js";

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
    constructor(scene, x, y, texture, name, options = {}) {
        super(scene, x, y, texture, name);

        // Opciones de configuración con valores por defecto
        this.hitboxConfig = {
            widthRatio: options.hitboxWidthRatio || 0.4, // Proporción del ancho del sprite
            heightRatio: options.hitboxHeightRatio || 0.25, // Proporción del alto del sprite
            offsetYRatio: options.hitboxOffsetYRatio || 0.75, // Posición vertical del hitbox
            scale: options.scale || 0.5,
        };

        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setOrigin(0.5, 0.5); // Asegurar que el origen está en el centro

        // Primero configuramos el físico antes de ajustar el hitbox
        this.sprite.body.setCollideWorldBounds(true);

        // Aplicar escalado
        this.sprite.setScale(this.hitboxConfig.scale);

        // Configurar el hitbox específico para este enemigo
        this.setupEnemyHitbox();

        // Movimiento
        this.interactionRadius = options.interactionRadius || 100;
        this.followSpeed = options.followSpeed || 100;

        // Flags
        this.isDestroyed = false;
        this.gracePeriodActive = false; // Nuevo flag para período de gracia

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

                    // Solo iniciar combate si no hay período de gracia activo
                    if (distance < 30 && !this.gracePeriodActive) {
                        // Pausar la escena actual
                        this.scene.scene.pause("GameScene");

                        // Lanzar la escena de combate y pasar los datos necesarios
                        this.scene.scene.launch("CombatScene", {
                            player: this.scene.player,
                            enemy: this,
                        });
                    }
                }
            }
        };
        this.scene.events.on("update", this.updateEnemy);
    }

    // Método centralizado para configurar el hitbox del enemigo
    setupEnemyHitbox() {
        const scaledWidth = this.sprite.displayWidth;
        const scaledHeight = this.sprite.displayHeight;

        // Usar la configuración proporcionada para calcular dimensiones
        const bodyWidth = scaledWidth * this.hitboxConfig.widthRatio;
        const bodyHeight = scaledHeight * this.hitboxConfig.heightRatio;

        // Calcular offsets
        const offsetX = (scaledWidth - bodyWidth) / 2;
        const offsetY = scaledHeight * this.hitboxConfig.offsetYRatio;

        // Aplicar el hitbox, considerando la escala
        this.sprite.body.setSize(bodyWidth / this.hitboxConfig.scale, bodyHeight / this.hitboxConfig.scale);
        this.sprite.body.setOffset(offsetX / this.hitboxConfig.scale, offsetY / this.hitboxConfig.scale);

        return this.sprite;
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
    constructor(scene, x, y, texture, name, dialogue = []) {
        super(scene, x, y, texture, name);
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setImmovable(true);
        this.setupSprite(this.sprite);
        this.interactionRadius = 50;

        // Estructura de diálogos mejorada
        this.dialogConfig = {
            dialogue: dialogue,
            currentIndex: 0,
            hasChoices: false,
            choices: [],
            choiceIndex: -1,
        };

        // Instancia del DialogManager
        this.dialogManager = DialogManager.getInstance();
    }

    // Método para configurar opciones de diálogo
    setDialogChoices(choices, choiceIndex) {
        this.dialogConfig.hasChoices = choices.length > 0;
        this.dialogConfig.choices = choices;
        this.dialogConfig.choiceIndex = choiceIndex;
        return this; // Para permitir encadenamiento
    }

    // Método para obtener el diálogo actual
    getCurrentDialogue() {
        return this.dialogConfig.dialogue[this.dialogConfig.currentIndex] || "";
    }

    // Método que maneja la interacción con el NPC y el sistema de diálogos
    interact(player) {
        if (!this.dialogManager) {
            console.warn("DialogManager no disponible para interactuar");
            return;
        }

        // Si el diálogo está visible, avanzar al siguiente solo si no se muestran opciones
        if (this.dialogManager.isDialogOpen()) {
            // No avanzar si se están mostrando opciones
            if (!this.dialogManager.isShowingChoices()) {
                this.dialogManager.nextDialog();
            }
        } else {
            // Si el diálogo no está visible, iniciar una nueva conversación
            this.dialogManager.startDialog(this, player);
        }
    }

    // Método por defecto para manejar elecciones, puede ser sobrescrito por subclases
    onChoiceSelected(choice, player) {
        console.log(`${this.name} recibió la elección: ${choice}`);
    }

    // Getter para acceder a las propiedades del diálogo desde el DialogManager
    get dialogue() {
        return this.dialogConfig.dialogue;
    }
    get currentDialogueIndex() {
        return this.dialogConfig.currentIndex;
    }
    set currentDialogueIndex(index) {
        this.dialogConfig.currentIndex = index;
    }
    get hasChoices() {
        return this.dialogConfig.hasChoices;
    }
    get choices() {
        return this.dialogConfig.choices;
    }
    get choiceIndex() {
        return this.dialogConfig.choiceIndex;
    }

    // Colisiones
    setupCollision(player) {
        this.scene.physics.add.collider(this.sprite, player.sprite);
    }
}
