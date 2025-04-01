// Imports
import GameScene from "./src/scenes/GameScene.js";
import InventoryScene from "./src/scenes/InventoryScene.js";
import CombatScene from "./src/scenes/CombatScene.js";
import TrainingScene from "./src/scenes/TrainingScene.js";
import TeleportScene from "./src/scenes/TeleportScene.js";

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
    scene: [GameScene, CombatScene, InventoryScene, TrainingScene, TeleportScene],
};

// Instanciar juego
const game = new Phaser.Game(config);
