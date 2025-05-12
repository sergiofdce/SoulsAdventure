import { NPC } from "./Npc.js";

export class Fireplace extends NPC {
    constructor(scene, x, y, texture) {
        // Diálogos definidos directamente
        const initialDialogues = ["Has encontrado una hoguera.", "¿Quieres descansar en la hoguera?"];

        super(scene, x, y, texture, "Hoguera", initialDialogues);
        
        // Frame inicial para hoguera no descubierta
        this.sprite.setFrame(30);
        this.sprite.setScale(2);
        
        this.setDialogChoices(["Sí", "No"], 1);
        this.discovered = false;
        this.discoveredDialogue = ["¿Quieres descansar en la hoguera?"];
        this.initialDialogue = initialDialogues;
        this.player = null;

        // Crear animación para hogueras descubiertas si no existe ya
        if (!scene.anims.exists('fireplace-active')) {
            scene.anims.create({
                key: 'fireplace-active',
                frames: scene.anims.generateFrameNumbers(texture, { start: 10, end: 13 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Si la hoguera ya está descubierta, reproducir la animación
        if (this.discovered) {
            this.sprite.play('fireplace-active');
        }

        // Textos específicos para respuestas y acciones
        this.enemiesResetText = "Los enemigos han reaparecido y tus pociones han sido restablecidas.";
        this.preparingTeleportText = "Preparando teletransporte...";
        this.goodbyeText = "Las llamas seguirán ardiendo para cuando las necesites.";
        this.travelQuestionText = "¿Deseas viajar a otro lugar?";

        // Diálogos especiales para la hoguera "Nueva Era"
        this.finalFireplaceDialogues = [
            "Esta no es una hoguera común...",
            "La llama primordial que dio forma a este mundo se encuentra aquí.",
            "Has demostrado ser digno al llegar hasta este punto.",
            "Ante ti se presenta una decisión que cambiará el destino de este mundo.",
            "Vincular la llama para salvar al pueblo ...",
            "... o abandonar la llama para reiniciar el ciclo",
        ];

        // Opciones para la decisión final
        this.finalChoiceQuestion = "¿Qué deseas hacer con la llama primordial?";
        this.finalChoices = ["Vincular la llama", "Abandonar la llama"];
    }

    interact(player) {
        this.player = player;

        // Comprobar si es la hoguera final "Nueva Era"
        if (this.fireplaceName === "Nueva Era") {
            this.handleFinalFireplace();
            return;
        }

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

    handleFinalFireplace() {
        // Siempre mostrar la secuencia completa de diálogos
        this.dialogue = [...this.finalFireplaceDialogues, this.finalChoiceQuestion];
        // Configurar para mostrar opciones después del último diálogo
        this.setDialogChoices(this.finalChoices, this.dialogue.length - 1);

        // Registrar la hoguera como descubierta si es la primera vez
        if (!this.discovered) {
            this.registerFireplace();
        }

        super.interact(this.player);
    }

    registerFireplace() {
        if (!this.scene.fireplaces.includes(this)) {
            this.scene.fireplaces.push(this);
        }

        this.discovered = true;
        
        // Iniciar la animación cuando la hoguera se descubre
        this.sprite.play('fireplace-active');

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

        // Comprobar si estamos en la hoguera final y procesando elecciones específicas
        if (this.fireplaceName === "Nueva Era" && (choice === "Vincular la llama" || choice === "Abandonar la llama")) {
            this.handleFinalChoice(choice);
            return;
        }

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

    handleFinalChoice(choice) {
        if (choice === "Vincular la llama") {
            // Diálogo para vincular la llama
            this.dialogManager.dialogueText.textContent = `${this.name}: Has elegido mantener viva la Edad del Fuego. Tu sacrificio no será olvidado.`;

            // Crear efecto visual antes de cambiar de escena
            this.createBrightLightEffect();

            // Cambiar a la escena final después de un tiempo
            setTimeout(() => {
                this.dialogManager.closeDialog();

                // Redirigir directamente a endgame.html en lugar de lanzar la escena EndGame
                window.location.href = "/endgame.html?ending=light";
            }, 3000);
        } else {
            // Diálogo para abandonar la llama
            this.dialogManager.dialogueText.textContent = `${this.name}: Has elegido dejar morir la llama y abrazar la oscuridad. Un nuevo ciclo comienza.`;

            // Crear efecto visual de oscuridad
            this.createDarkEffect();

            // Reiniciar el juego con dificultad aumentada
            setTimeout(() => {
                this.dialogManager.closeDialog();

                // Incrementar la dificultad y reiniciar
                if (this.scene.gameStateManager) {
                    this.scene.gameStateManager.increaseDifficulty(1.5);
                    this.scene.gameStateManager.resetGameButKeepDifficulty();

                    // Guardar la partida antes de reiniciar
                    this.scene.gameStateManager.saveGame().then(() => {
                        console.log("Partida guardada antes de reiniciar el ciclo");

                        // Reiniciar la escena después de guardar
                        this.scene.scene.restart();
                    });
                }
            }, 3000);
        }
    }

    createBrightLightEffect() {
        const light = this.scene.add.graphics();
        light.fillStyle(0xffffff, 0);
        light.fillRect(0, 0, this.scene.sys.game.config.width, this.scene.sys.game.config.height);
        light.setScrollFactor(0);
        light.setDepth(999);

        this.scene.tweens.add({
            targets: light,
            fillAlpha: 1,
            duration: 3000,
            ease: "Linear",
        });
    }

    createDarkEffect() {
        const darkness = this.scene.add.graphics();
        darkness.fillStyle(0x000000, 0);
        darkness.fillRect(0, 0, this.scene.sys.game.config.width, this.scene.sys.game.config.height);
        darkness.setScrollFactor(0);
        darkness.setDepth(999);

        this.scene.tweens.add({
            targets: darkness,
            fillAlpha: 1,
            duration: 3000,
            ease: "Linear",
        });
    }

    handleRestChoice() {
        // SONIDO DE DESCANSAR
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound("recovery-sound", { volume: 0.5 });
        }

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
