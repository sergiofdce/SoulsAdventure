import { NPC } from "../base/Entity.js";

export class Fireplace extends NPC {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, "Hoguera", ["Has encontrado una hoguera.", "¿Deseas viajar a otro lugar?"]);
        this.hasChoices = true;
        this.choices = ["Sí", "No"];
        this.choiceIndex = 1; // El segundo diálogo mostrará opciones

        // Nombre único para esta hoguera (se puede personalizar después de la instanciación)
        this.fireplaceName = `Hoguera en (${Math.round(x)}, ${Math.round(y)})`;

        // Flag para indicar si ya ha sido descubierta
        this.discovered = false;

        // Diálogos alternativos para cuando ya ha sido descubierta
        this.discoveredDialogue = ["¿Deseas viajar a otro lugar?"];

        // Diálogo inicial para la primera interacción
        this.initialDialogue = ["Has encontrado una hoguera.", "¿Deseas viajar a otro lugar?"];

        // Configurar diálogos iniciales
        this.dialogue = [...this.initialDialogue];
    }

    registerFireplace() {
        // No need to initialize the array as it should be done in the GameScene constructor

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

    handleChoice(choice, player) {
        const dialogueBox = document.getElementById("dialogueBox");
        const dialogueText = document.getElementById("dialogueText");
        const choicesContainer = document.getElementById("choicesContainer");

        // Ocultar las opciones
        choicesContainer.style.display = "none";

        if (choice === "Sí") {
            // Iniciar teletransporte
            dialogueText.textContent = `${this.name}: Preparando teletransporte...`;

            // Cerrar diálogo después de un breve retraso y lanzar la escena de teletransporte
            setTimeout(() => {
                dialogueBox.style.display = "none";
                this.currentDialogueIndex = 0;
                this.scene.scene.pause("GameScene");
                this.scene.scene.launch("TeleportScene", { player: player });
            }, 1500);
        } else {
            // Rechazar teletransporte
            dialogueText.textContent = `${this.name}: Las llamas seguirán ardiendo para cuando las necesites.`;

            // Cerrar el diálogo después de un breve retraso
            setTimeout(() => {
                dialogueBox.style.display = "none";
                this.currentDialogueIndex = 0;
            }, 2000);
        }
    }

    // Sobreescribir método interact para manejar opciones y registrar el descubrimiento
    interact(player) {
        const dialogueBox = document.getElementById("dialogueBox");
        const dialogueText = document.getElementById("dialogueText");
        const choicesContainer = document.getElementById("choicesContainer");

        // Si el diálogo no está visible y es la primera interacción
        if (dialogueBox.style.display !== "block") {
            // Si ya fue descubierta, usar los diálogos alternativos
            if (this.discovered) {
                this.dialogue = [...this.discoveredDialogue];
                this.choiceIndex = 0;
            } else {
                // Si no ha sido descubierta, usar el diálogo inicial y registrar la hoguera
                this.dialogue = [...this.initialDialogue];
                this.choiceIndex = 1;
                this.registerFireplace();
            }
        }

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
        else if (this.dialogue.length > 0) {
            this.currentDialogueIndex = 0;
            dialogueText.textContent = `${this.name}: ${this.dialogue[this.currentDialogueIndex]}`;
            dialogueBox.style.display = "block";

            // Ocultar opciones inicialmente
            if (choicesContainer) {
                choicesContainer.style.display = "none";
            }

            // Si ya fue descubierta y solo hay un diálogo, mostrar opciones de inmediato
            if (this.discovered && this.dialogue.length === 1) {
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
        }
    }
}
