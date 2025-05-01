export default class TeleportScene extends Phaser.Scene {
    constructor() {
        super("TeleportScene");
        this.selectedFireplace = null;
    }

    init(data) {
        // Almacenar referencias al jugador y a la escena del juego para posible uso futuro
        this.player = data.player;
        this.gameScene = this.scene.get("GameScene");
    }

    create() {
        // Ocultar HUD
        document.getElementById("hud-container").classList.add("hidden");

        // Mostrar la interfaz de teletransporte en HTML y pausar la escena del juego
        document.getElementById("teleport-container").classList.remove("hidden");
        this.populateFireplacesList();
        this.setupEventHandlers();
    }

    teleportPlayer(fireplace) {
        if (!fireplace) {
            console.error("No se proporcionó una hoguera para el teletransporte");
            return;
        }

        // Obtener las coordenadas del sprite de la hoguera
        const targetX = fireplace.sprite ? fireplace.sprite.x : undefined;
        const targetY = fireplace.sprite ? fireplace.sprite.y : undefined;

        // Comprobar si las coordenadas son válidas
        if (targetX === undefined || targetY === undefined) {
            console.error("Coordenadas de hoguera no válidas:", targetX, targetY);
            return;
        }

        console.log("Teletransportando al jugador a:", fireplace.fireplaceName, targetX, targetY);

        // Obtener una referencia directa a GameScene
        const gameScene = this.scene.get("GameScene");

        // Actualizar la posición del jugador directamente en GameScene
        if (gameScene && gameScene.player) {
            // Mover el sprite del jugador directamente a las coordenadas de la hoguera
            gameScene.player.sprite.setPosition(targetX, targetY);

            // Actualizar cualquier seguimiento interno de posición en la clase Player
            if (typeof gameScene.player.setPosition === "function") {
                gameScene.player.setPosition(targetX, targetY);
            }

            // Asegurar que la cámara se actualiza para seguir al jugador en su nueva posición
            if (gameScene.camera && gameScene.camera.follow) {
                gameScene.camera.follow(gameScene.player.sprite);
            }

            console.log("Jugador teletransportado con éxito a", targetX, targetY);
        } else {
            console.error("No se puede acceder a GameScene o al jugador");
        }

        // Ocultar la interfaz de teletransporte
        const container = document.getElementById("teleport-container");
        if (container) {
            container.classList.add("hidden");
        }

        // Primero reanudar GameScene para asegurar que está activa
        this.scene.resume("GameScene");

        // Luego detener esta escena
        this.scene.stop();

        // Añadir efecto visual para el teletransporte en GameScene
        // Necesitamos hacer esto después de reanudar la escena para asegurar que la cámara está activa
        if (gameScene && gameScene.cameras && gameScene.cameras.main) {
            gameScene.cameras.main.flash(500, 255, 255, 255);
        }

        console.log("Teletransporte completado");
    }

    populateFireplacesList() {
        // Obtener la lista de hogueras descubiertas de la escena del juego
        const allFireplaces = this.gameScene.fireplaces || [];
        console.log("Todas las hogueras:", allFireplaces);

        // Filtrar para incluir solo hogueras descubiertas
        const fireplaces = allFireplaces.filter((fireplace) => fireplace.discovered === true);
        console.log("Hogueras descubiertas:", fireplaces);

        const fireplaceList = document.getElementById("fireplace-list");
        const noFireplacesMessage = document.getElementById("no-fireplaces-message");
        const travelButton = document.getElementById("teleport-travel");

        // Verificar que los elementos DOM existen
        if (!fireplaceList) {
            console.error("Elemento #fireplace-list no encontrado");
            return;
        }

        // Desactivar el botón de viaje inicialmente (ya que no hay hoguera seleccionada)
        if (travelButton) {
            travelButton.disabled = true;
        }

        // Limpiar entradas anteriores y restablecer selección
        fireplaceList.innerHTML = "";
        this.selectedFireplace = null;

        // Comprobar si tenemos alguna hoguera descubierta
        if (!fireplaces || fireplaces.length === 0) {
            if (noFireplacesMessage) {
                noFireplacesMessage.classList.remove("hidden");
            }
            return;
        }

        if (noFireplacesMessage) {
            noFireplacesMessage.classList.add("hidden");
        }

        // Añadir cada hoguera descubierta a la lista
        fireplaces.forEach((fireplace, index) => {
            const fireplaceItem = document.createElement("div");
            fireplaceItem.className = "fireplace-item";
            fireplaceItem.textContent = fireplace.fireplaceName || "Hoguera sin nombre";
            fireplaceItem.dataset.index = index;

            fireplaceItem.addEventListener("click", () => {
                // Eliminar la clase seleccionada de todos los elementos
                document.querySelectorAll(".fireplace-item").forEach((item) => {
                    item.classList.remove("selected");
                });

                // Añadir la clase seleccionada a este elemento
                fireplaceItem.classList.add("selected");

                // Guardar la hoguera seleccionada
                this.selectedFireplace = fireplace;

                // Habilitar el botón de viaje
                if (travelButton) {
                    travelButton.disabled = false;
                }
            });

            fireplaceList.appendChild(fireplaceItem);
        });
    }

    setupEventHandlers() {
        // Manejador del botón de salida
        const exitButton = document.getElementById("teleport-exit");
        if (exitButton) {
            exitButton.onclick = () => {
                const container = document.getElementById("teleport-container");
                if (container) {
                    container.classList.add("hidden");
                }
                // Ocultar HUD
                document.getElementById("hud-container").classList.remove("hidden");

                this.scene.resume("GameScene");
            };
        }

        // Manejador del botón de viaje
        const travelButton = document.getElementById("teleport-travel");
        if (travelButton) {
            travelButton.onclick = () => {
                if (this.selectedFireplace) {
                    this.teleportPlayer(this.selectedFireplace);
                }
            };
        }

        // Manejador del botón de cancelar (para compatibilidad con versiones anteriores)
        const cancelButton = document.getElementById("teleport-cancel");
        if (cancelButton) {
            cancelButton.onclick = () => {
                const container = document.getElementById("teleport-container");
                if (container) {
                    container.classList.add("hidden");
                }
                this.scene.resume("GameScene");
            };
        }
    }
}
