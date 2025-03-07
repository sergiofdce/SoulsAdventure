// Imports
import GameScene from "./src/scenes/GameScene.js";
import CombatScene from "./src/scenes/CombatScene.js";
import InventoryScene from "./src/scenes/InventoryScene.js";

// Phaser config
const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 700,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [GameScene, CombatScene, InventoryScene],
};

// Instanciar juego
const game = new Phaser.Game(config);
