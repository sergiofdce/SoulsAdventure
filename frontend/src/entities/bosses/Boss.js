import { CombatEntity } from "../base/CombatEntity.js";

export class Boss extends CombatEntity {
    constructor(scene, x, y, texture, name, scale) {
        // Configuración de hitbox específica para bosses
        const bossOptions = {
            scale: scale,
            interactionRadius: 150,
            followSpeed: 180,
            hitboxWidthRatio: 0.6,
            hitboxHeightRatio: 0.3,
            hitboxOffsetYRatio: 0.7,
        };

        super(scene, x, y, texture, name, bossOptions);
    }

    // Lanzar Escena de Combate
    startCombat() {
        this.scene.scene.launch("CombatScene", {
            player: this.scene.player,
            enemy: this,
        });
    }
}
