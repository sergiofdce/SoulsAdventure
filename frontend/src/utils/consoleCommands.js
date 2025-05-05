/**
 * Este archivo configura comandos para la consola del navegador
 * que permiten manipular el inventario y otros aspectos del juego.
 */

import ItemsDatabase from "../data/items/itemsDatabase.js";

// Esta función debe ser llamada desde el punto de entrada principal de la aplicación
export function setupConsoleCommands(gameState) {


    // Comando para guardar la partida
    window.saveGame = async function () {
        if (!gameState.player?.scene?.gameStateManager) {
            console.error("❌ No se puede guardar: GameStateManager no disponible.");
            return false;
        }

        console.log("💾 Guardando partida...");

        try {
            const gameStateManager = gameState.player.scene.gameStateManager;
            const result = await gameStateManager.saveGame();

        } catch (error) {
            console.error("❌ Error durante el proceso de guardado:", error);
            return false;
        }
    };
}
