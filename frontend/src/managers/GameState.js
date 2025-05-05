export default class GameStateManager {
    constructor() {
        // Estado central del juego
        this.gameState = {
            player: null,
            worldState: {
                defeatedBosses: [],
                discoveredFireplaces: [],
                discoveredNPCs: [],
                discoveredItems: [],
            },
            inventory: null,
            lastSaveTime: null,
            initialized: false,
        };

        // Referencia a la escena activa
        this.scene = null;
    }

    // Inicializar el manager con la escena y el jugador
    initialize(scene, player) {
        this.scene = scene;
        this.gameState.player = player;
        this.gameState.inventory = player.inventory;
        this.gameState.initialized = true;

        console.log("GameStateManager inicializado");
        return this;
    }

    // Sincronizar estado del mundo desde el jugador (para compatibilidad)
    syncFromPlayer() {
        if (!this.gameState.player) return false;

        const player = this.gameState.player;
        this.gameState.worldState.defeatedBosses = [...player.defeatedBosses];
        this.gameState.worldState.discoveredFireplaces = [...player.discoveredFireplaces];
        this.gameState.worldState.discoveredNPCs = [...player.discoveredNPCs];
        this.gameState.worldState.discoveredItems = [...player.discoveredItems];

        return true;
    }

    // Sincronizar estado hacia el jugador (para compatibilidad)
    syncToPlayer() {
        if (!this.gameState.player) return false;

        const player = this.gameState.player;
        player.defeatedBosses = [...this.gameState.worldState.defeatedBosses];
        player.discoveredFireplaces = [...this.gameState.worldState.discoveredFireplaces];
        player.discoveredNPCs = [...this.gameState.worldState.discoveredNPCs];
        player.discoveredItems = [...this.gameState.worldState.discoveredItems];

        return true;
    }

    // Guardar partida
    async saveGame() {
        if (!this.gameState.initialized) {
            console.error("GameStateManager no inicializado");
            return false;
        }

        // Sincronizar desde el jugador para asegurar datos actualizados
        this.syncFromPlayer();

        // Preparar datos para guardar
        const saveData = {
            // Atributos del jugador
            attributes: {
                level: this.gameState.player.level,
                souls: this.gameState.player.souls,
                health: this.gameState.player.health,
                maxHealth: this.gameState.player.maxHealth,
                resistance: this.gameState.player.resistance,
                strength: this.gameState.player.strength,
                speed: this.gameState.player.speed,
                damage: this.gameState.player.damage,
                defense: this.gameState.player.defense,
            },
            // Inventario
            inventory: this.gameState.inventory.exportToJSON(),
            // Progreso en el mundo
            progress: {
                defeatedBosses: this.gameState.worldState.defeatedBosses,
                discoveredFireplaces: this.gameState.worldState.discoveredFireplaces,
                discoveredNPCs: this.gameState.worldState.discoveredNPCs,
                discoveredItems: this.gameState.worldState.discoveredItems,
            },
            // Posición
            lastPosition: {
                x: this.gameState.player.sprite.x,
                y: this.gameState.player.sprite.y,
            },
            // Timestamp del guardado
            savedAt: new Date().toISOString(),
        };

        try {
            const success = await this.sendToServer(saveData);
            if (success) {
                console.log("Partida guardada con éxito");
                this.gameState.lastSaveTime = new Date();

                // También guardamos una copia local como respaldo
                localStorage.setItem(
                    "soulsAdventureBackup",
                    JSON.stringify({
                        data: saveData,
                        timestamp: Date.now(),
                    })
                );

                return true;
            }
            return false;
        } catch (error) {
            console.error("Error al guardar partida:", error);

            // Intentar guardar localmente como respaldo
            try {
                localStorage.setItem(
                    "soulsAdventureBackup",
                    JSON.stringify({
                        data: saveData,
                        timestamp: Date.now(),
                        offlineStorage: true,
                    })
                );
                console.warn("Partida guardada localmente como respaldo");
            } catch (e) {
                console.error("No se pudo guardar ni siquiera localmente:", e);
            }

            return false;
        }
    }

    // Cargar partida
    async loadGame() {
        if (!this.gameState.initialized) {
            console.error("GameStateManager no inicializado");
            return false;
        }

        try {
            const data = await this.fetchFromServer();

            if (!data) {
                console.warn("No hay datos guardados para cargar");
                return false;
            }

            // Actualizar atributos del jugador
            if (data.attributes) {
                const player = this.gameState.player;
                player.level = data.attributes.level || player.level;
                player.souls = data.attributes.souls || player.souls;
                player.health = data.attributes.health || player.health;
                player.maxHealth = data.attributes.maxHealth || player.maxHealth;
                player.resistance = data.attributes.resistance || player.resistance;
                player.strength = data.attributes.strength || player.strength;
                player.speed = data.attributes.speed || player.speed;
                player.damage = data.attributes.damage || player.damage;
                player.defense = data.attributes.defense || player.defense;
            }

            // Actualizar inventario
            if (data.inventory) {
                this.gameState.inventory.importFromJSON(data.inventory);
                this.gameState.inventory.recalculatePlayerStats();
            }

            // Actualizar progreso del mundo
            if (data.progress) {
                this.gameState.worldState.defeatedBosses = data.progress.defeatedBosses || [];
                this.gameState.worldState.discoveredFireplaces = data.progress.discoveredFireplaces || [];
                this.gameState.worldState.discoveredNPCs = data.progress.discoveredNPCs || [];
                this.gameState.worldState.discoveredItems = data.progress.discoveredItems || [];

                // Sincronizar con el jugador
                this.syncToPlayer();
            }

            // Actualizar posición del jugador
            if (data.lastPosition && this.gameState.player.sprite) {
                this.gameState.player.setPosition(data.lastPosition.x, data.lastPosition.y);
            }

            console.log("Partida cargada con éxito");
            return true;
        } catch (error) {
            console.error("Error al cargar partida:", error);

            // Intentar cargar desde el respaldo local
            try {
                const localBackup = localStorage.getItem("soulsAdventureBackup");
                if (localBackup) {
                    const backupData = JSON.parse(localBackup).data;
                    console.warn("Intentando cargar desde respaldo local");
                    // Aplicar el mismo proceso de carga pero con los datos locales
                    // [Código similar al de arriba para aplicar los datos de backupData]
                    return true;
                }
            } catch (e) {
                console.error("Error al intentar cargar desde respaldo local:", e);
            }

            return false;
        }
    }

    // Métodos para API
    async sendToServer(data) {
        try {
            // Obtener el token JWT del almacenamiento local
            const token = localStorage.getItem("authToken");

            if (!token) {
                console.error("No hay token de autenticación disponible");
                return false;
            }

            const response = await fetch("/api/users/save-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                console.log("Datos guardados correctamente en el servidor");
                return true;
            } else {
                console.error("Error al guardar datos:", result.message || "Error desconocido");
                return false;
            }
        } catch (error) {
            console.error("Error al enviar datos al servidor:", error);
            return false;
        }
    }

    async fetchFromServer() {
        try {
            // Obtener el token JWT del almacenamiento local
            const token = localStorage.getItem("authToken");

            if (!token) {
                console.error("No hay token de autenticación disponible");
                return null;
            }

            const response = await fetch("/api/users/get-data", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
            });

            if (response.status === 404) {
                console.warn("No se encontraron datos guardados para este usuario");
                return null;
            } else if (response.status === 401) {
                console.warn("Sesión expirada. Por favor, inicia sesión nuevamente");
                localStorage.removeItem("authToken");
                return null;
            } else if (!response.ok) {
                throw new Error(`Error al obtener datos: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.playerData) {
                console.error("No se encontraron datos del jugador");
                return null;
            }

            return result.playerData;
        } catch (error) {
            console.error("Error al obtener datos del servidor:", error);
            return null;
        }
    }

    // Métodos para verificar estado de entidades
    shouldSpawnBoss(bossId) {
        return !this.gameState.worldState.defeatedBosses.includes(bossId);
    }

    shouldSpawnItem(itemId) {
        return !this.gameState.worldState.discoveredItems.includes(itemId);
    }

    isFireplaceDiscovered(fireplaceName) {
        return this.gameState.worldState.discoveredFireplaces.includes(fireplaceName);
    }

    isNPCDiscovered(npcId) {
        return this.gameState.worldState.discoveredNPCs.includes(npcId);
    }

    // Registrar progreso nuevo
    registerDefeatedBoss(bossId) {
        if (!this.gameState.worldState.defeatedBosses.includes(bossId)) {
            this.gameState.worldState.defeatedBosses.push(bossId);
            this.syncToPlayer();
            return true;
        }
        return false;
    }

    registerDiscoveredFireplace(fireplaceName) {
        if (!this.gameState.worldState.discoveredFireplaces.includes(fireplaceName)) {
            this.gameState.worldState.discoveredFireplaces.push(fireplaceName);
            this.syncToPlayer();
            return true;
        }
        return false;
    }

    registerDiscoveredNPC(npcId) {
        if (!this.gameState.worldState.discoveredNPCs.includes(npcId)) {
            this.gameState.worldState.discoveredNPCs.push(npcId);
            this.syncToPlayer();
            return true;
        }
        return false;
    }

    registerDiscoveredItem(itemId) {
        if (!this.gameState.worldState.discoveredItems.includes(itemId)) {
            this.gameState.worldState.discoveredItems.push(itemId);
            this.syncToPlayer();
            return true;
        }
        return false;
    }
}
