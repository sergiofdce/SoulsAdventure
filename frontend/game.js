// Imports
import GameScene from "./src/scenes/GameScene.js";
import CombatScene from "./src/scenes/CombatScene.js";
import InventoryScene from "./src/scenes/InventoryScene.js";
import GameScenePrueba from "./src/scenes/GameScenePrueba.js";

// Phaser config
const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 900,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [GameScenePrueba, CombatScene, InventoryScene],
};

// Instanciar juego
const game = new Phaser.Game(config);
