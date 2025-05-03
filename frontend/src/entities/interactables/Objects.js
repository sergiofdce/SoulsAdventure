import { Entity } from "../base/Entity.js";
import { DialogManager } from "../../managers/Dialog.js";
import ItemsDatabase from "../../data/items/ItemsDatabase.js";

export class InteractableObject extends Entity {
    constructor(scene, x, y, itemId, texture = null) {
        super(
            scene,
            x,
            y,
            texture || "object-sprite",
            `Objeto: ${ItemsDatabase.getAllItems()[itemId]?.name || itemId}`
        );

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
        this.createSprite(scene, x, y, texture || "object-sprite", itemData);

        // Configurar detección de tecla "E" para interacción
        this.setupInteraction();
    }

    createSprite(scene, x, y, texture, itemData) {
        // Usar la textura correctamente - verificar que existe en el cache de texturas
        let textureKey = texture;

        // Si no se proporciona textura o no existe, usar el sprite genérico
        if (!texture || !scene.textures.exists(texture)) {
            console.warn(`Textura '${texture}' no encontrada, usando textura genérica para ${this.itemId}`);
            textureKey = "object-sprite";
        }

        // Crear el sprite con la textura correcta
        this.sprite = scene.physics.add.sprite(x, y, textureKey);

        // Ajustar tamaño según el tipo de objeto
        let scale = 0.5;
        if (itemData.category === "weapon") scale = 0.6;
        else if (itemData.category === "shield") scale = 0.7;
        else if (itemData.category === "consumable") scale = 0.4;

        // Escalar el sprite
        this.setupSprite(this.sprite, scale);

        // Verificamos si estamos usando la textura genérica para aplicar tints
        if (textureKey === "object-sprite") {
            let tint = 0xffffff; // Blanco por defecto

            // Colorear según tipo
            if (itemData.category === "weapon") tint = 0xff0000; // Rojo para armas
            else if (itemData.category === "shield") tint = 0x0000ff; // Azul para escudos
            else if (itemData.category === "armor") tint = 0x00ff00; // Verde para armadura
            else if (itemData.category === "consumable") tint = 0xffff00; // Amarillo para consumibles

            this.sprite.setTint(tint);
        }

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

            // Mensaje flotante de confirmación
            this.showFloatingText(`+1 ${this.itemName}`);
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
