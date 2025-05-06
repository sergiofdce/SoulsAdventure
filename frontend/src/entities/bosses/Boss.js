import { CombatEntity } from "../base/CombatEntity.js";

export class Boss extends CombatEntity {
    constructor(scene, x, y, texture, name, scale) {
        // Configuración de hitbox específica para bosses
        const bossOptions = {
            scale: scale,
            interactionRadius: 150,
            followSpeed: 180,
            hitboxWidthRatio: 1,
            hitboxHeightRatio: 0.65,
            hitboxOffsetYRatio: 0.35,
        };

        super(scene, x, y, texture, name, bossOptions);
    }

    // Lanzar Escena de Combate
    startCombat() {
        this.scene.scene.launch("BossScene", {
            player: this.scene.player,
            enemy: this,
            gameStateManager: this.scene.gameStateManager,
        });
    }
}
