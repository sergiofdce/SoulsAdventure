import { NPC } from "./Npc.js";

// NPC para subir de nivel
export class Trainer extends NPC {
    constructor(scene, x, y, texture) {
        // Dialogos
        const trainerDialogues = ["Hola!", "¿Quieres entrenar para subir de nivel?"];

        super(scene, x, y, texture, "Entrenador", trainerDialogues);

        // Respuestas
        this.setDialogChoices(["Sí", "No"], 1);
    }

    // Método que será llamado por DialogManager cuando se seleccione una opción
    onChoiceSelected(choice, player) {
        if (choice === "Sí") {
            // Iniciar entrenamiento
            this.dialogManager.dialogueText.textContent = `${this.name}: ¡Comencemos el entrenamiento!`;

            // Cerrar diálogo después de un breve retraso y lanzar la escena de entrenamiento
            setTimeout(() => {
                this.dialogManager.closeDialog();
                this.scene.scene.pause("GameScene");
                this.scene.scene.launch("TrainingScene", { player: player });
            }, 2000);
        } else {
            // Rechazar entrenamiento
            this.dialogManager.dialogueText.textContent = `${this.name}: Entiendo. Vuelve cuando quieras entrenar.`;
        }
    }
}
