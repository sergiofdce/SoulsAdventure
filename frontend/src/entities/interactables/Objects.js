import { Entity } from "../base/Entity.js";
import { DialogManager } from "../../managers/Dialog.js";
import ItemsDatabase from "../../data/items/ItemsDatabase.js";

export class InteractableObject extends Entity {
    constructor(scene, x, y, itemId, texture = null) {
        super(scene, x, y, texture, `Objeto: ${ItemsDatabase.getAllItems()[itemId]?.name || itemId}`);

        this.itemId = itemId;
        this.interactionRadius = 30; // Radio de interacción más amplio para objetos
        this.collected = false;
        this.dialogManager = DialogManager.getInstance();

        // Obtener datos del objeto desde la base de datos
        const itemData = ItemsDatabase.getAllItems()[this.itemId];

        if (!itemData) {
            console.error(`Error: No se encontró el ítem ${itemId} en la base de datos.`);
            return;
        }

        this.itemName = itemData.name;
        this.itemDescription = itemData.description;

        // Crear el sprite del objeto
        this.createSprite(scene, x, y, texture, itemData);

        // Configurar detección de tecla "E" para interacción
        this.setupInteraction();
    }

    createSprite(scene, x, y, texture, itemData) {
        // Usar la textura correctamente - verificar que existe en el cache de texturas
        let textureKey = texture;

        // Si no se proporciona textura o no existe, mostrar advertencia y no crear sprite
        if (!texture || !scene.textures.exists(texture)) {
            console.warn(`Textura '${texture}' no encontrada para ${this.itemId}. No se creará sprite.`);
            return;
        }

        // Crear el sprite con la textura correcta
        this.sprite = scene.physics.add.sprite(x, y, textureKey);

        // Ajustar tamaño según el tipo de objeto
        let scale = 0.5;

        // Escalar el sprite
        this.setupSprite(this.sprite, scale);

        // Añadir efecto de brillo para que se vea como un objeto recogible
        this.sprite.setAlpha(0.9);

        // Añadir animación de flotación
        this.addFloatingAnimation(scene);
    }

    addFloatingAnimation(scene) {
        // Animación para que el objeto flote ligeramente
        scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 10,
            duration: 1500,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });
    }

    setupInteraction() {
        // Agregamos el evento de tecla "E" para interactuar
        this.keyE = this.scene.input.keyboard.addKey("E");

        // Añadimos el listener al evento update
        this.updateEventCallback = this.update.bind(this);
        this.scene.events.on("update", this.updateEventCallback);
    }

    update() {
        if (this.collected) return;

        const player = this.scene.player;

        // Verificar si el jugador está cerca y presiona E
        if (player && this.isInRange(player) && Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.interact(player);
        }
    }

    interact(player) {
        if (this.collected) return;

        // Mostrar diálogo de recolección
        this.showCollectionDialog(player);
    }

    showCollectionDialog(player) {
        // Crear diálogo temporal para esta interacción
        const tempEntity = {
            name: "Objeto encontrado",
            dialogue: [`${this.itemName}`],
            hasChoices: true,
            choiceIndex: 0,
            choices: ["Recoger"],
            onChoiceSelected: (choice, player) => {
                this.collectItem(player);
                this.dialogManager.closeDialog();
            },
            // Agregar isInRange para que DialogManager pueda verificar la distancia
            isInRange: (player) => {
                return this.isInRange(player);
            },
        };

        // Mostrar el diálogo
        this.dialogManager.startDialog(tempEntity, player);
    }

    collectItem(player) {
        if (this.collected) return;

        // Añadir el item al inventario del jugador
        if (player.addItem(this.itemId, 1)) {
            // Si es poción de salud, incrementar maxQuantity
            if (this.itemId === "pocion-salud") {
                // Obtener el objeto de la poción
                const pocionData = player.inventory.getItemData(this.itemId);

                if (pocionData) {
                    // Incrementar el máximo de pociones que puede llevar
                    const currentMax = pocionData.maxQuantity || 3;
                    const newMax = currentMax + 1;

                    // Actualizar la información en la base de datos
                    const allItems = ItemsDatabase.getAllItems();
                    if (allItems[this.itemId]) {
                        allItems[this.itemId].maxQuantity = newMax;
                        console.log(`Capacidad máxima de pociones aumentada a: ${newMax}`);
                    }

                    // Mostrar mensaje especial indicando el aumento de capacidad
                    this.showFloatingText(`+1 ${this.itemName}\n¡Capacidad máxima aumentada!`);
                }
            } else {
                // Mensaje flotante normal para otros objetos
                this.showFloatingText(`+1 ${this.itemName}`);
            }

            // Marcar como recogido
            this.collected = true;

            // Animación de recogida
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                y: this.sprite.y - 50,
                scale: 0.1,
                duration: 500,
                onComplete: () => {
                    // Remover el evento update
                    this.scene.events.off("update", this.updateEventCallback);
                    // Destruir el sprite
                    this.sprite.destroy();
                },
            });
        }
    }

    showFloatingText(text) {
        // Crear texto flotante en la posición del objeto
        const floatingText = this.scene.add.text(this.sprite.x, this.sprite.y - 30, text, {
            fontSize: "18px",
            fontFamily: "Arial",
            color: "#FFFFFF",
            stroke: "#000000",
            strokeThickness: 3,
            align: "center",
        });
        floatingText.setOrigin(0.5);

        // Animación de desvanecimiento hacia arriba
        this.scene.tweens.add({
            targets: floatingText,
            y: floatingText.y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                floatingText.destroy();
            },
        });
    }

    destroy() {
        if (this.updateEventCallback) {
            this.scene.events.off("update", this.updateEventCallback);
        }

        if (this.sprite && !this.sprite.destroyed) {
            this.sprite.destroy();
        }
    }
}
