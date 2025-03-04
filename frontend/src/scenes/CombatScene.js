export default class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: "CombatScene" });
    }

    create() {
        // Fondo de la escena
        this.add.rectangle(400, 300, 800, 600, 0x000000).setOrigin(0.5);

        // Contenido
        const combatText = this.add
            .text(400, 300, "¡Escena de combate!\nPresiona ESC para volver", {
                fontSize: "32px",
                fill: "#fff",
                align: "center",
            })
            .setOrigin(0.5);

        // Teclas asignadas
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.resume("GameScene");
            this.scene.stop("CombatScene");
        });
    }
}
