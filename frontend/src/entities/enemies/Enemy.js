import { CombatEntity } from "../base/CombatEntity.js";

export class Enemy extends CombatEntity {
    constructor(scene, x, y, texture, name, scale) {
        // Configuración de hitbox específica para enemigos
        const enemyOptions = {
            scale: scale,
            interactionRadius: 60,
            followSpeed: 180,
            hitboxWidthRatio: 0.4,
            hitboxHeightRatio: 0.2,
            hitboxOffsetYRatio: 0.8,
        };

        super(scene, x, y, texture, name, enemyOptions);

    }

    // Sobrescribir setupCollision para añadir más logs
    setupCollision(player) {
        console.log(`${this.name} - Configurando colisión con jugador:`, player?.name || "jugador");
        super.setupCollision(player);
    }

    // Lanzar Escena
    startCombat() {
        console.log(`${this.name} iniciando combate`);
        console.log("Estado del jugador:", this.scene.player);
        console.log("Estado del enemigo:", this);

        this.scene.scene.launch("CombatScene", {
            player: this.scene.player,
            enemy: this,
        });
    }
}
