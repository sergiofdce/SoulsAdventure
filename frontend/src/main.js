// Imports
import GameScene from "./scenes/GameScene.js";
import InventoryScene from "./scenes/InventoryScene.js";
import CombatScene from "./scenes/CombatScene.js";
import BossScene from "./scenes/BossScene.js";
import TrainingScene from "./scenes/TrainingScene.js";
import TeleportScene from "./scenes/TeleportScene.js";


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
    scene: [GameScene, CombatScene, BossScene, InventoryScene, TrainingScene, TeleportScene],
};

// Instanciar juego
const game = new Phaser.Game(config);
