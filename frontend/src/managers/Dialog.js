export class DialogManager {
    static instance = null;

    constructor() {
        if (DialogManager.instance) {
            return DialogManager.instance;
        }

        DialogManager.instance = this;

        this.dialogueBox = document.getElementById("dialogueBox");
        this.dialogueText = document.getElementById("dialogueText");
        this.choicesContainer = document.getElementById("choicesContainer");

        this.currentEntity = null;
        this.currentPlayer = null;
        this.currentDialogueIndex = 0;
        this.checkDistanceInterval = null;
    }

    static getInstance() {
        if (!DialogManager.instance) {
            DialogManager.instance = new DialogManager();
        }
        return DialogManager.instance;
    }

    startDialog(entity, player) {
        this.currentEntity = entity;
        this.currentPlayer = player;
        this.currentDialogueIndex = 0;

        // Mostrar el primer diálogo
        this.dialogueText.textContent = `${entity.name}: ${entity.dialogue[this.currentDialogueIndex]}`;
        this.dialogueBox.style.display = "block";

        // Ocultar opciones inicialmente
        if (this.choicesContainer) {
            this.choicesContainer.style.display = "none";
        }

        // Si solo hay un diálogo y debe mostrar opciones en el índice 0
        if (entity.dialogue.length === 1 && entity.hasChoices && entity.choiceIndex === 0) {
            this.showChoices();
        }

        // Verificar la distancia periódicamente
        this.startDistanceCheck();
    }

    nextDialog() {
        if (!this.currentEntity) return;

        // Si estamos mostrando opciones actualmente, no avanzar
        if (this.choicesContainer.style.display === "flex") {
            return;
        }

        this.currentDialogueIndex++;

        if (this.currentDialogueIndex < this.currentEntity.dialogue.length) {
            // Mostrar el siguiente diálogo
            this.dialogueText.textContent = `${this.currentEntity.name}: ${
                this.currentEntity.dialogue[this.currentDialogueIndex]
            }`;

            // Si es el diálogo que debe mostrar opciones
            if (this.currentEntity.hasChoices && this.currentDialogueIndex === this.currentEntity.choiceIndex) {
                this.showChoices();
            }
        } else {
            // Cerrar el diálogo cuando se han mostrado todos los mensajes
            this.closeDialog();
        }
    }

    showChoices() {
        this.choicesContainer.innerHTML = "";
        this.choicesContainer.style.display = "flex";

        this.currentEntity.choices.forEach((choice) => {
            const button = document.createElement("button");
            button.textContent = choice;
            button.className = "choice-button";
            button.addEventListener("click", () => this.handleChoice(choice));
            this.choicesContainer.appendChild(button);
        });
    }

    handleChoice(choice) {
        // Ocultar las opciones
        this.choicesContainer.style.display = "none";

        // Delegar el manejo de la elección a la entidad
        if (this.currentEntity && typeof this.currentEntity.onChoiceSelected === "function") {
            this.currentEntity.onChoiceSelected(choice, this.currentPlayer);
        }
    }

    closeDialog() {
        this.dialogueBox.style.display = "none";
        if (this.choicesContainer) {
            this.choicesContainer.style.display = "none";
        }
        this.currentDialogueIndex = 0;
        this.stopDistanceCheck();
        this.currentEntity = null;
        this.currentPlayer = null;
    }

    startDistanceCheck() {
        this.stopDistanceCheck(); // Limpiar intervalo anterior si existe

        this.checkDistanceInterval = setInterval(() => {
            if (!this.currentEntity || !this.currentPlayer) {
                this.stopDistanceCheck();
                return;
            }

            // Verificar si la entidad tiene el método isInRange
            if (typeof this.currentEntity.isInRange === "function") {
                if (!this.currentEntity.isInRange(this.currentPlayer) && this.dialogueBox.style.display === "block") {
                    // El jugador se alejó, cerrar diálogo
                    console.log("Jugador fuera de rango, cerrando diálogo");
                    this.closeDialog();
                }
            } else {
                console.warn("La entidad no tiene un método isInRange válido");
                this.stopDistanceCheck();
            }
        }, 300); // Verificar más frecuentemente (300ms)
    }

    stopDistanceCheck() {
        if (this.checkDistanceInterval) {
            clearInterval(this.checkDistanceInterval);
            this.checkDistanceInterval = null;
        }
    }

    isDialogOpen() {
        return this.dialogueBox.style.display === "block";
    }

    isShowingChoices() {
        return this.choicesContainer && this.choicesContainer.style.display === "flex";
    }
}
