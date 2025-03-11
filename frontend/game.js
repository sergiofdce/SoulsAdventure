// Imports
import GameScene from "./src/scenes/GameScene.js";
import InventoryScene from "./src/scenes/InventoryScene.js";
import CombatScene from "./src/scenes/CombatScene.js";

// Phaser config
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
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
