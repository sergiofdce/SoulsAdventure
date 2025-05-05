import { NPC } from "./Npc.js";

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
        const regularDialogues = ["Hola!", "¿Quieres entrenar ahora para subir de nivel?"];

        super(scene, x, y, texture, "Entrenador", initialDialogues);

        this.firstInteraction = true;
        this.initialDialogues = initialDialogues;
        this.regularDialogues = regularDialogues;
        this.setDialogChoices(["Sí", "No"], 9);

        // Otras respuestas específicas que necesitamos guardar
        this.trainingStartText = "¡Comencemos el entrenamiento!";
        this.trainingRejectText = "Entiendo. Vuelve cuando quieras entrenar.";
    }

    checkDiscoveredStatus(player) {
        // Usar GameStateManager
        if (player && this.scene.gameStateManager) {
            if (this.scene.gameStateManager.isNPCDiscovered(this.name)) {
                this.firstInteraction = false;
                console.log(`NPC ${this.name} ya ha sido descubierto anteriormente`);
            }
        } else if (player && player.discoveredNPCs && player.discoveredNPCs.includes(this.name)) {
            // Mantener compatibilidad con código anterior
            this.firstInteraction = false;
            console.log(`NPC ${this.name} ya ha sido descubierto anteriormente`);
        }
    }

    interact(player) {
        // Configurar diálogos según estado de interacción
        if (this.firstInteraction) {
            this.dialogue = this.initialDialogues;
            this.setDialogChoices(["Sí", "No"], 9);
        } else {
            this.dialogue = this.regularDialogues;
            this.setDialogChoices(["Sí", "No"], 1);
        }

        // Continuar con la interacción normal
        super.interact(player);
    }

    onChoiceSelected(choice, player) {
        // Registrar primera interacción
        this.registerFirstInteraction(player);

        const isYesChoice = choice === "Sí";

        if (isYesChoice) {
            this.handleTrainingChoice(player);
        } else {
            this.handleRejectionChoice();
        }
    }

    registerFirstInteraction(player) {
        if (this.firstInteraction) {
            this.firstInteraction = false;

            // Usar GameStateManager para registrar el NPC
            if (this.scene.gameStateManager) {
                this.scene.gameStateManager.registerDiscoveredNPC(this.name);
                console.log(`NPC ${this.name} registrado en GameStateManager`);
            } else if (player && player.discoveredNPCs && !player.discoveredNPCs.includes(this.name)) {
                // Mantener compatibilidad con código anterior
                player.discoveredNPCs.push(this.name);
                player.savePlayerData && player.savePlayerData();
            }
        }
    }

    handleTrainingChoice(player) {
        this.dialogManager.dialogueText.textContent = `${this.name}: ${this.trainingStartText}`;

        setTimeout(() => {
            this.dialogManager.closeDialog();
            this.scene.scene.pause("GameScene");
            this.scene.scene.launch("TrainingScene", { player: player });
        }, 2000);
    }

    handleRejectionChoice() {
        this.dialogManager.dialogueText.textContent = `${this.name}: ${this.trainingRejectText}`;
    }
}
