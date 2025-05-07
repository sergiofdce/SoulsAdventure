import { NPC } from "./Npc.js";

export class Fireplace extends NPC {
    constructor(scene, x, y, texture) {
        // Diálogos definidos directamente
        const initialDialogues = ["Has encontrado una hoguera.", "¿Deseas viajar a otro lugar?"];

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
        const isDialogOpen = this.dialogManager.isDialogOpen();

        // Configurar diálogos según estado de descubrimiento
        if (!this.discovered) {
            this.registerFireplace();
            this.dialogConfig.dialogue = [...this.initialDialogue];
            this.dialogConfig.choiceIndex = 1;
        } else {
            this.dialogConfig.dialogue = [...this.discoveredDialogue];
            this.dialogConfig.choiceIndex = 0;
        }

        // Llamar al método interact de la clase padre (NPC)
        super.interact(player);

        // Mostrar opciones inmediatamente para hogueras ya descubiertas con un solo diálogo
        if (!isDialogOpen && this.discovered && this.dialogConfig.dialogue.length === 1) {
            this.showChoicesAfterDelay();
        }
    }

    registerFireplace() {
        if (!this.scene.fireplaces.includes(this)) {
            this.scene.fireplaces.push(this);
        }

        this.discovered = true;

        // Añadir al Array de GameState
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
        const dialogText = this.dialogManager.dialogueText.textContent;
        const isYesChoice = choice === "Sí";

        if (this.discovered) {
            if (isYesChoice && dialogText.includes("¿Quieres descansar")) {
                this.handleRestChoice();
            } else if (isYesChoice && dialogText.includes("¿Deseas viajar")) {
                this.handleTravelChoice();
            } else {
                this.handleRejectionChoice();
            }
        } else {
            // Primer encuentro con la hoguera
            if (isYesChoice) {
                this.handleTravelChoice();
            } else {
                this.handleRejectionChoice();
            }
        }
    }

    handleRestChoice() {
        this.dialogManager.dialogueText.textContent = `${this.name}: ${this.enemiesResetText}`;

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
            this.scene.scene.pause("GameScene");
            this.scene.scene.launch("TeleportScene", { player: this.player });
        }, 1500);
    }

    handleRejectionChoice() {
        this.dialogManager.dialogueText.textContent = `${this.name}: ${this.goodbyeText}`;
        this.dialogManager.closeDialog();
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
