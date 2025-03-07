import { NPC } from "../base/Entity.js";

// NPC para subir de nivel
export class Trainer extends NPC {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, "Entrenador", ["Hola!", "¿Cómo estás?"]);
    }

    train(player) {
        console.log("Entrenamiento iniciado...");
        player.stats.levelUp();
        console.log("¡Has subido de nivel! 💪");
    }
}
