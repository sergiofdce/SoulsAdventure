import { NPC } from "../base/Entity.js";

// NPC para subir de nivel
export class Trainer extends NPC {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, "Entrenador", ["Hola!", "¿Quieres entrenar para subir de nivel?"]);
        this.hasChoices = true;
        this.choices = ["Sí", "No"];
        this.choiceIndex = 1; // El segundo diálogo mostrará opciones
    }

    handleChoice(choice, player) {
        const dialogueBox = document.getElementById("dialogueBox");
        const dialogueText = document.getElementById("dialogueText");
        const choicesContainer = document.getElementById("choicesContainer");

        // Ocultar las opciones
        choicesContainer.style.display = "none";

        if (choice === "Sí") {
            // Iniciar entrenamiento
            dialogueText.textContent = `${this.name}: ¡Comencemos el entrenamiento!`;

            // Cerrar diálogo después de un breve retraso y lanzar la escena de entrenamiento
            setTimeout(() => {
                dialogueBox.style.display = "none";
                this.currentDialogueIndex = 0;
                this.scene.scene.pause("GameScene");
                this.scene.scene.launch("TrainingScene", { player: player });
            }, 1500);
        } else {
            // Rechazar entrenamiento
            dialogueText.textContent = `${this.name}: Entiendo. Vuelve cuando quieras entrenar.`;
        }
    }

    // Sobreescribir método interact para manejar opciones
    interact(player) {
        const dialogueBox = document.getElementById("dialogueBox");
        const dialogueText = document.getElementById("dialogueText");
        const choicesContainer = document.getElementById("choicesContainer");

        // Si el diálogo está visible, avanzar al siguiente
        if (dialogueBox.style.display === "block") {
            this.currentDialogueIndex++;

            if (this.currentDialogueIndex < this.dialogue.length) {
                // Mostrar el siguiente diálogo
                dialogueText.textContent = `${this.name}: ${this.dialogue[this.currentDialogueIndex]}`;

                // Si es el diálogo que debe mostrar opciones
                if (this.hasChoices && this.currentDialogueIndex === this.choiceIndex) {
                    choicesContainer.innerHTML = "";
                    choicesContainer.style.display = "flex";

                    this.choices.forEach((choice) => {
                        const button = document.createElement("button");
                        button.textContent = choice;
                        button.className = "choice-button";
                        button.addEventListener("click", () => this.handleChoice(choice, player));
                        choicesContainer.appendChild(button);
                    });
                }
            } else {
                // Cerrar el diálogo cuando se han mostrado todos los mensajes
                dialogueBox.style.display = "none";
                this.currentDialogueIndex = 0;
            }
        }
        // Si el diálogo no está visible, mostrar el primero
        else if (this.currentDialogueIndex < this.dialogue.length) {
            dialogueText.textContent = `${this.name}: ${this.dialogue[this.currentDialogueIndex]}`;
            dialogueBox.style.display = "block";

            // Ocultar opciones inicialmente
            if (choicesContainer) {
                choicesContainer.style.display = "none";
            }

            // Agregar un event listener que verifique la distancia periódicamente
            this.checkDistanceInterval = setInterval(() => {
                if (!this.isInRange(player) && dialogueBox.style.display === "block") {
                    // El jugador se alejó, cerrar diálogo
                    dialogueBox.style.display = "none";
                    if (choicesContainer) {
                        choicesContainer.style.display = "none";
                    }
                    this.currentDialogueIndex = 0;
                    clearInterval(this.checkDistanceInterval);
                }
            }, 500); // Verificar cada medio segundo
        } else {
            this.currentDialogueIndex = 0;
            dialogueBox.style.display = "none";
        }
    }
}
