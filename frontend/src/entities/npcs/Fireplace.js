import { NPC } from "./Npc.js";

export class Fireplace extends NPC {
    constructor(scene, x, y, texture) {
        // Diálogos iniciales
        const initialDialogues = ["Has encontrado una hoguera.", "¿Deseas viajar a otro lugar?"];

        super(scene, x, y, texture, "Hoguera", initialDialogues);

        // Configurar opciones de diálogo
        this.setDialogChoices(["Sí", "No"], 1);

        // Nombre único para esta hoguera
        this.fireplaceName = `Hoguera en (${Math.round(x)}, ${Math.round(y)})`;

        // Flag para indicar si ya ha sido descubierta
        this.discovered = false;

        // Diálogos alternativos para cuando ya ha sido descubierta
        this.discoveredDialogue = ["¿Quieres descansar en la hoguera?"];

        // Guardar referencia a los diálogos iniciales
        this.initialDialogue = initialDialogues;

        // Referencia al jugador
        this.player = null;
    }

    registerFireplace() {
        // Verify this fireplace exists in the scene's fireplaces array
        const existsInArray = this.scene.fireplaces.includes(this);

        if (!existsInArray) {
            // If somehow this fireplace isn't in the array, add it
            this.scene.fireplaces.push(this);
        }

        // Mark as discovered regardless
        this.discovered = true;

        console.log("Hoguera registrada:", this.fireplaceName);
        console.log(
            "Fireplaces in scene:",
            this.scene.fireplaces.map((f) => f.fireplaceName)
        );
    }

    // Sobrescribir el método interact para manejar el estado de descubrimiento
    interact(player) {
        // Guardar referencia al jugador
        this.player = player;

        // Verificar si ya hay un diálogo abierto
        const isDialogOpen = this.dialogManager.isDialogOpen();

        // Si es la primera interacción, registrar la hoguera
        if (!this.discovered) {
            this.registerFireplace();
            // Usar los diálogos iniciales
            this.dialogConfig.dialogue = [...this.initialDialogue];
            this.dialogConfig.choiceIndex = 1;
        } else {
            // Si ya fue descubierta, usar diálogos alternativos
            this.dialogConfig.dialogue = [...this.discoveredDialogue];
            this.dialogConfig.choiceIndex = 0;
        }

        // Llamar al método interact de la clase padre (NPC)
        super.interact(player);

        // Verificar nuevamente en caso de hogueras ya descubiertas con un solo diálogo
        if (!isDialogOpen && this.discovered && this.dialogConfig.dialogue.length === 1) {
            // Asegurar que se muestren las opciones inmediatamente
            setTimeout(() => {
                if (this.dialogManager.currentEntity === this) {
                    this.dialogManager.showChoices();
                }
            }, 100);
        }
    }

    // Sobrescribir el método onChoiceSelected heredado de NPC
    onChoiceSelected(choice, player) {
        if (this.discovered) {
            if (choice === "Sí" && this.dialogManager.dialogueText.textContent.includes("¿Quieres descansar")) {
                // Descansar en la hoguera
                this.dialogManager.dialogueText.textContent = `${this.name}: Los enemigos han reaparecido y tus pociones han sido restablecidas.`;

                console.log("Iniciando proceso de reaparecer enemigos");
                console.log("Estado de la escena:", this.scene);
                console.log("Método spawnEnemies disponible:", typeof this.scene.spawnEnemies === "function");

                // Crear animación de neblina verde
                this.createMistAnimation();

                // Reaparecer enemigos
                this.scene.spawnEnemies();

                // Reponer pociones de salud hasta su máximo
                this.replenishHealthPotions(player);

                // Guardar datos del jugador
                this.player.savePlayerData();

                console.log("Enemigos reaparecidos, verificando estado:", this.scene.enemies);

                // Después de un breve retraso, mostrar la opción de viajar
                setTimeout(() => {
                    this.dialogManager.dialogueText.textContent = `${this.name}: ¿Deseas viajar a otro lugar?`;

                    // Actualizar las opciones para la nueva pregunta
                    this.setDialogChoices(["Sí", "No"], 0);
                    this.dialogManager.showChoices();
                }, 2000);
            }
            // Respuesta a la pregunta de viajar después de descansar
            else if (choice === "Sí" && this.dialogManager.dialogueText.textContent.includes("¿Deseas viajar")) {
                // Iniciar teletransporte
                this.dialogManager.dialogueText.textContent = `${this.name}: Preparando teletransporte...`;

                // Cerrar diálogo después de un breve retraso y lanzar la escena de teletransporte
                setTimeout(() => {
                    this.dialogManager.closeDialog();
                    this.scene.scene.pause("GameScene");
                    this.scene.scene.launch("TeleportScene", { player: player });
                }, 1500);
            } else {
                // Rechazar descanso o viajar
                this.dialogManager.dialogueText.textContent = `${this.name}: Las llamas seguirán ardiendo para cuando las necesites.`;
                this.dialogManager.closeDialog();
            }
        } else {
            // Primer encuentro con la hoguera (no descubierta)
            if (choice === "Sí") {
                // Iniciar teletransporte
                this.dialogManager.dialogueText.textContent = `${this.name}: Preparando teletransporte...`;

                // Cerrar diálogo después de un breve retraso y lanzar la escena de teletransporte
                setTimeout(() => {
                    this.dialogManager.closeDialog();
                    this.scene.scene.pause("GameScene");
                    this.scene.scene.launch("TeleportScene", { player: player });
                }, 1500);
            } else {
                // Rechazar teletransporte
                this.dialogManager.dialogueText.textContent = `${this.name}: Las llamas seguirán ardiendo para cuando las necesites.`;
                this.dialogManager.closeDialog();
            }
        }
    }

    // Nuevo método para reponer pociones de salud
    replenishHealthPotions(player) {
        if (!player || !player.inventory) return;

        // Buscar la poción de salud en el inventario
        const itemId = "pocion-salud";
        const inventoryData = player.inventory.data.items[itemId];

        if (inventoryData) {
            // Obtener la información completa del ítem para conocer su maxQuantity
            const itemData = player.inventory.getItemData(itemId);

            if (itemData && itemData.maxQuantity) {
                // Reponer hasta el máximo
                inventoryData.quantity = itemData.maxQuantity;
                console.log(`Pociones de salud reabastecidas a ${itemData.maxQuantity}`);
            }
        }
    }

    createMistAnimation() {
        // Crear un gráfico para la neblina
        const mist = this.scene.add.graphics();

        // Configurar el color y la transparencia
        const color = 0x00ff00; // Verde
        const alpha = 0.5;

        // Dibujar un círculo de neblina
        mist.fillStyle(color, alpha);
        mist.fillCircle(this.sprite.x, this.sprite.y, 200);

        // Animación de desvanecimiento
        this.scene.tweens.add({
            targets: mist,
            alpha: 0,
            duration: 2000,
            ease: "Power2",
            onComplete: () => {
                mist.destroy();
            },
        });
    }
}
