import { Entity } from "../base/Entity.js";
import { DialogManager } from "../../managers/Dialog.js";

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
    set dialogue(newDialogue) {
        this.dialogConfig.dialogue = newDialogue;
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
