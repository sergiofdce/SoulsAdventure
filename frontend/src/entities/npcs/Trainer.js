import { NPC } from "./Npc.js";

// NPC para subir de nivel
export class Trainer extends NPC {
    constructor(scene, x, y, texture) {
        // Diálogos para primera interacción
        const initialDialogues = [
            "¡Saludos, viajero! Veo que por fin has despertado!",
            "Déjame pedirte un favor, esas criaturas han vuelto a invadir nuestra región, todo el pueblo está refugiado en sus casas ",
            "Parece que una maldición ha cubierto estas tierras...",
            "Cuando derrotes enemigos, obtendrás sus almas, si necesitas fortalecer tus habilidades, te puedo enseñar a cambio de las almas que recojas.",
            "Pero ten cuidado, ya son varios los guerreros que lo han intentado y no han vuelto con noticias...",
            "Quizás encuentres partes de su equipamiento repartido por el suelo, búscalo, te vendrá bien.",
            "Recuerda volver a encender las diferentes hogueras que hay dispersas. Te permitirá descansar de los combates.",
            "Primero, enciende la hoguera que hay en la plaza del pueblo.",
            "Cuando tengas suficientes almas, podré enseñarte técnicas que aumentarán tu nivel de poder.",
            "¿Quieres entrenar ahora para subir de nivel?",
        ];

        // Diálogos normales (después de la primera vez)
        const regularDialogues = ["Hola!", "¿Quieres entrenar para subir de nivel?"];

        // Usar diálogos iniciales por defecto
        super(scene, x, y, texture, "Entrenador", initialDialogues);

        // Variable para rastrear si es la primera interacción
        this.firstInteraction = true;

        // Guardar ambos conjuntos de diálogos
        this.initialDialogues = initialDialogues;
        this.regularDialogues = regularDialogues;

        // Configurar opciones de diálogo
        this.setDialogChoices(["Sí", "No"], 5); // Para diálogos iniciales, el índice es 5
    }

    // Sobrescribir el método interact para controlar qué diálogos mostrar
    interact(player) {
        if (this.firstInteraction) {
            // Primera interacción: usar diálogos iniciales (ya están configurados en el constructor)
            this.dialogue = this.initialDialogues;
            this.setDialogChoices(["Sí", "No"], 9);
        } else {
            // Interacciones posteriores: cambiar a diálogos regulares
            this.dialogue = this.regularDialogues;
            this.setDialogChoices(["Sí", "No"], 1);
        }

        // Continuar con la interacción normal
        super.interact(player);
    }

    // Método que será llamado por DialogManager cuando se seleccione una opción
    onChoiceSelected(choice, player) {
        // Marcar que ya no es la primera interacción
        if (this.firstInteraction) {
            this.firstInteraction = false;
        }

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
