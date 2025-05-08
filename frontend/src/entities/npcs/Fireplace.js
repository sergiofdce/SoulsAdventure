import { NPC } from "./Npc.js";

export class Fireplace extends NPC {
    constructor(scene, x, y, texture) {
        // Diálogos definidos directamente
        const initialDialogues = ["Has encontrado una hoguera.", "¿Quieres descansar en la hoguera?"];

        super(scene, x, y, texture, "Hoguera", initialDialogues);

        this.setDialogChoices(["Sí", "No"], 1);
        this.discovered = false;
        this.discoveredDialogue = ["¿Quieres descansar en la hoguera?"];
        this.initialDialogue = initialDialogues;
        this.player = null;

        // Textos específicos para respuestas y acciones
        this.enemiesResetText = "Los enemigos han reaparecido y tus pociones han sido restablecidas.";
        this.preparingTeleportText = "Preparando teletransporte...";
        this.goodbyeText = "Las llamas seguirán ardiendo para cuando las necesites.";
        this.travelQuestionText = "¿Deseas viajar a otro lugar?";
    }

    interact(player) {
        this.player = player;

        // Configurar diálogos según estado de descubrimiento
        if (!this.discovered) {
            this.dialogue = [...this.initialDialogue];
            this.setDialogChoices(["Sí", "No"], 1);
        } else {
            this.dialogue = [...this.discoveredDialogue];
            this.setDialogChoices(["Sí", "No"], 0);
        }

        // Continuar con la interacción normal
        super.interact(player);
    }

    registerFireplace() {
        if (!this.scene.fireplaces.includes(this)) {
            this.scene.fireplaces.push(this);
        }

        this.discovered = true;

        // Usar GameStateManager para registrar la hoguera
        if (this.scene.gameStateManager) {
            this.scene.gameStateManager.registerDiscoveredFireplace(this.fireplaceName);
            console.log(`Hoguera "${this.fireplaceName}" registrada usando GameStateManager`);
        }

        console.log(`Hoguera "${this.fireplaceName}" registrada y añadida a la lista del jugador`);
    }

    showChoicesAfterDelay(delay = 100) {
        setTimeout(() => {
            if (this.dialogManager.currentEntity === this) {
                this.dialogManager.showChoices();
            }
        }, delay);
    }

    onChoiceSelected(choice, player) {
        const isYesChoice = choice === "Sí";
        const currentDialogText = this.dialogManager.dialogueText.textContent;

        if (!this.discovered) {
            this.registerFireplace();
        }

        if (isYesChoice) {
            // Verificar el texto específico del diálogo actual para determinar la acción correcta
            if (currentDialogText.includes("¿Quieres descansar")) {
                this.handleRestChoice();
            } else if (currentDialogText.includes("¿Deseas viajar")) {
                this.handleTravelChoice();
            }
        } else {
            this.handleRejectionChoice();
        }
    }

    handleRestChoice() {
        // Actualizar el texto inmediatamente para evitar repeticiones
        this.dialogManager.dialogueText.textContent = `${this.name}: ${this.enemiesResetText}`;

        // Ocultar el indicador "Pulsa E" durante la animación
        this.dialogManager.nextIndicator.style.display = "none";

        // Efectos de descansar
        this.createMistAnimation();
        this.scene.spawnEnemies();
        this.replenishHealthPotions(this.player);

        // Guardar partida
        if (this.scene.gameStateManager) {
            this.scene.gameStateManager.saveGame();
        }

        // Mostrar opción de viajar después de descansar
        setTimeout(() => {
            this.dialogManager.dialogueText.textContent = `${this.name}: ${this.travelQuestionText}`;
            this.setDialogChoices(["Sí", "No"], 0);
            this.dialogManager.showChoices();
        }, 2000);
    }

    handleTravelChoice() {
        this.dialogManager.dialogueText.textContent = `${this.name}: ${this.preparingTeleportText}`;

        setTimeout(() => {
            this.dialogManager.closeDialog();

            // Asegurarse de que la escena de teletransporte se lanza correctamente
            if (this.scene && this.scene.scene) {
                this.scene.scene.pause("GameScene");
                this.scene.scene.launch("TeleportScene", { player: this.player });
            } else {
                console.error("No se pudo lanzar la escena de teletransporte. Verifica la configuración de la escena.");
            }
        }, 1500);
    }

    handleRejectionChoice() {
        this.dialogManager.dialogueText.textContent = `${this.name}: ${this.goodbyeText}`;

        // Cerrar el diálogo después de mostrar el mensaje de despedida
        setTimeout(() => {
            this.dialogManager.closeDialog();
        }, 1500);
    }

    replenishHealthPotions(player) {
        if (!player || !player.inventory) return;

        const itemId = "pocion-salud";
        const inventoryData = player.inventory.data.items[itemId];

        if (inventoryData) {
            const itemData = player.inventory.getItemData(itemId);

            if (itemData && itemData.maxQuantity) {
                inventoryData.quantity = itemData.maxQuantity;
                console.log(`Pociones de salud reabastecidas a ${itemData.maxQuantity}`);
            }
        }
    }

    createMistAnimation() {
        const mist = this.scene.add.graphics();
        const color = 0x00ff00; // Verde
        const alpha = 0.5;

        mist.fillStyle(color, alpha);
        mist.fillCircle(this.sprite.x, this.sprite.y, 200);

        this.scene.tweens.add({
            targets: mist,
            alpha: 0,
            duration: 2000,
            ease: "Power2",
            onComplete: () => mist.destroy(),
        });
    }
}
