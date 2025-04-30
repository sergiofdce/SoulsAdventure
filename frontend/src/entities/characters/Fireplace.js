import { NPC } from "../base/Entity.js";

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
        this.discoveredDialogue = ["¿Deseas viajar a otro lugar?"];

        // Guardar referencia a los diálogos iniciales
        this.initialDialogue = initialDialogues;
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

            // El diálogo se cerrará automáticamente después de un tiempo gracias al DialogManager
        }
    }
}
