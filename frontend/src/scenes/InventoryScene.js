export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "InventoryScene" });
    }

    create() {
        // Fondo de la escena
        this.add.rectangle(400, 300, 800, 600, 0x333333).setOrigin(0.5);

        // Contenido
        const inventoryText = this.add
            .text(400, 300, "Inventario\nPresiona ESC para volver", {
                fontSize: "32px",
                fill: "#fff",
                align: "center",
            })
            .setOrigin(0.5);

        // Teclas asignadas
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.resume("GameScene");
            this.scene.stop("InventoryScene");
        });
    }
}
