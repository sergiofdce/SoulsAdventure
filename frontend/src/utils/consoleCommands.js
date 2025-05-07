/**
 * Este archivo configura comandos para la consola del navegador
 * que permiten manipular el inventario y otros aspectos del juego.
 */

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

    // Comando para mostrar la posición del jugador
    window.getPlayerPosition = function () {
        if (!gameState.player?.sprite) {
            console.error("❌ No se puede obtener la posición: El jugador no está disponible.");
            return false;
        }

        const x = Math.round(gameState.player.sprite.x);
        const y = Math.round(gameState.player.sprite.y);

        console.log(`📍 Posición actual: x=${x}, y=${y}`);
        return { x, y };
    };
}
