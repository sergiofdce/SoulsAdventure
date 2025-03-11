export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "InventoryScene" });
    }

    create() {
        // Mostrar el inventario en HTML
        const inventoryDiv = document.getElementById("inventory");
        inventoryDiv.style.display = "flex";

        // Detectar la tecla ESC para cerrar el inventario
        this.input.keyboard.on("keydown-I", () => {
            this.scene.resume("GameScene");
            this.scene.stop("InventoryScene");
        });
    }
}
