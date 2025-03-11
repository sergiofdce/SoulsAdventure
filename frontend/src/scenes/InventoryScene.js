export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "InventoryScene" });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const borderRect = 10;

        // Fondo negro que ocupa toda la pantalla
        this.add.rectangle(width / 2, height / 2, width, height + borderRect, 0x000000).setOrigin(0.5);

        // ------------------------------
        // Recuadro 1: Superior Izquierdo (40% del ancho, 50% de la altura)
        const rect1X = 0 + borderRect;
        const rect1Y = 0 + borderRect;
        const rect1Width = (width * 0.40) - borderRect;
        const rect1Height = (height * 0.5) - borderRect;
        this.add.rectangle(rect1X, rect1Y, rect1Width, rect1Height, 0xff0000).setOrigin(0);

        // ------------------------------
        // Recuadro 2: Superior Derecho (60% del ancho, 50% de la altura)
        const rect2X = (width * 0.40) + borderRect;
        const rect2Y = 0 + borderRect;
        const rect2Width = (width * 0.60) - borderRect * 2;
        const rect2Height = (height * 0.5) - borderRect;
        this.add.rectangle(rect2X, rect2Y, rect2Width, rect2Height, 0x00ff00).setOrigin(0);

        // ------------------------------
        // Recuadro 3: Inferior (100% del ancho, 50% de la altura)
        const rect3X = 0 + borderRect;
        const rect3Y = (height * 0.5) + borderRect;
        const rect3Width = width - (borderRect * 2);
        const rect3Height = (height * 0.5) - (borderRect * 2);
        this.add.rectangle(rect3X, rect3Y, rect3Width, rect3Height, 0x0000ff).setOrigin(0);

        // Tecla para cerrar la escena del inventario
        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.resume("GameScene");
            this.scene.stop("InventoryScene");
        });
    }
}





//  // Fondo de la escena
//  this.add.rectangle(
//     this.scale.width / 2,  // Centrar en X
//     this.scale.height / 2, // Centrar en Y
//     this.scale.width,      // Ancho igual al de la pantalla
//     this.scale.height,     // Alto igual al de la pantalla
//     0x333333               // Color gris oscuro
// ).setOrigin(0.5);


// // Contenedor del inventario
// this.inventoryContainer = this.add.container(400, 300);

// // Fondo del inventario
// const inventoryBg = this.add.rectangle(0, 0, 400, 300, 0x222222, 0.8).setOrigin(0.5);

// // Texto del inventario
// const inventoryText = this.add.text(0, -120, "Inventario", {
//     fontSize: "24px",
//     fill: "#fff",
//     align: "center",
// }).setOrigin(0.5);

// // Lista de ítems (ejemplo)
// const items = ["potion", "sword", "shield"];
// this.itemSprites = [];

// items.forEach((item, index) => {
//     const sprite = this.add.sprite(-100 + index * 100, 20, item).setScale(2);
//     this.itemSprites.push(sprite);
//     this.inventoryContainer.add(sprite);
// });

// // Agregar elementos al contenedor
// this.inventoryContainer.add([inventoryBg, inventoryText]);

// // Tecla para cerrar el inventario
// this.input.keyboard.on("keydown-ESC", () => {
//     this.scene.resume("GameScene");
//     this.scene.stop("InventoryScene");
// });