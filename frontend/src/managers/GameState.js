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
                completedIntroDialog: false,
                difficultyMultiplier: 1.0, // Multiplicador de dificultad inicial
                cycleCount: 0, // Número de ciclos completados
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
                completedIntroDialog: this.gameState.worldState.completedIntroDialog,
                difficultyMultiplier: this.gameState.worldState.difficultyMultiplier,
                cycleCount: this.gameState.worldState.cycleCount,
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
                this.gameState.lastSaveTime = new Date();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error al guardar partida:", error);
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

            // Actualizar nombre
            if (data.username) {
                this.gameState.player.name = data.username;
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
                this.gameState.worldState.completedIntroDialog = data.progress.completedIntroDialog || false;
                this.gameState.worldState.difficultyMultiplier = data.progress.difficultyMultiplier || 1.0;
                this.gameState.worldState.cycleCount = data.progress.cycleCount || 0;

                // Sincronizar con el jugador
                this.syncToPlayer();
            }

            // Actualizar posición del jugador
            if (data.lastPosition && this.gameState.player.sprite) {
                this.gameState.player.setPosition(data.lastPosition.x, data.lastPosition.y);
            }

            return true;
        } catch (error) {
            console.error("Error al cargar partida:", error);

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
                console.log("✅ Partida guardada.");
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

            if (!result.success) {
                console.error("No se encontraron datos del jugador");
                return null;
            }

            const combinedData = {
                ...result.playerData,
                username: result.username,
            };

            return combinedData;
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

    // Método para verificar si se ha completado el diálogo de introducción
    hasCompletedIntroDialog() {
        return this.gameState.worldState.completedIntroDialog;
    }

    // Método para marcar el diálogo de introducción como completado
    setCompletedIntroDialog() {
        this.gameState.worldState.completedIntroDialog = true;
        // Sincronizar con el jugador para mantener compatibilidad
        this.syncToPlayer();
        return true;
    }

    // Método para obtener el multiplicador de dificultad actual
    getDifficultyMultiplier() {
        return this.gameState.worldState.difficultyMultiplier || 1.0;
    }

    // Método para incrementar la dificultad
    increaseDifficulty(multiplier = 1.5) {
        this.gameState.worldState.difficultyMultiplier =
            (this.gameState.worldState.difficultyMultiplier || 1.0) * multiplier;

        // Incrementar contador de ciclos
        this.gameState.worldState.cycleCount = (this.gameState.worldState.cycleCount || 0) + 1;

        console.log(
            `Dificultad aumentada a x${this.gameState.worldState.difficultyMultiplier.toFixed(2)} (Ciclo ${
                this.gameState.worldState.cycleCount
            })`
        );

        return this.gameState.worldState.difficultyMultiplier;
    }

    // Método para reiniciar el juego pero conservando la dificultad
    resetGameButKeepDifficulty() {
        // Guardar dificultad actual y ciclo
        const currentDifficulty = this.gameState.worldState.difficultyMultiplier;
        const currentCycle = this.gameState.worldState.cycleCount;

        // Reiniciar estado del mundo
        this.gameState.worldState = {
            defeatedBosses: [],
            discoveredFireplaces: [],
            discoveredNPCs: [],
            discoveredItems: [],
            completedIntroDialog: false, // Cambiar a false para que vuelva a aparecer el diálogo de intro
            difficultyMultiplier: currentDifficulty,
            cycleCount: currentCycle,
        };

        // Si hay un jugador, reiniciar su estado pero conservar el nivel y algunos atributos
        if (this.gameState.player) {
            // Guardar el nivel actual y almas
            const playerLevel = this.gameState.player.level;
            const playerSouls = this.gameState.player.souls;

            // Posicionar al jugador en el punto inicial
            this.gameState.player.setPosition(306, 454);

            // Mantener el nivel y las almas
            this.gameState.player.level = playerLevel;
            this.gameState.player.souls = playerSouls;

            // Reiniciar inventario del jugador
            if (this.gameState.inventory) {
                this.gameState.inventory.clearInventory();
                console.log("Inventario del jugador reiniciado");
            }

            // Actualizar las estadísticas para reflejar el nuevo nivel de dificultad
            this.applyDifficultyToEnemies();
        }

        // Sincronizar con el jugador
        this.syncToPlayer();

        console.log(`Juego reiniciado manteniendo dificultad x${currentDifficulty.toFixed(2)} (Ciclo ${currentCycle})`);

        return true;
    }

    // Método para aplicar la dificultad a los enemigos
    applyDifficultyToEnemies() {
        if (!this.scene) return;

        const multiplier = this.getDifficultyMultiplier();

        // Aplicar a todos los enemigos
        this.scene.enemies.forEach((enemy) => {
            // Aumentar estadísticas de enemigos
            enemy.maxHealth *= multiplier;
            enemy.health = enemy.maxHealth;
            enemy.damage *= multiplier;
            enemy.defense *= multiplier;
            enemy.soulsReward = Math.floor(enemy.soulsReward * multiplier);

            // Actualizar barra de vida si existe
            if (enemy.healthBar) {
                enemy.updateHealthBar();
            }
        });

        // Aplicar a todos los jefes
        this.scene.bosses.forEach((boss) => {
            boss.maxHealth *= multiplier;
            boss.health = boss.maxHealth;
            boss.damage *= multiplier;
            boss.defense *= multiplier;
            boss.soulsReward = Math.floor(boss.soulsReward * multiplier);

            if (boss.healthBar) {
                boss.updateHealthBar();
            }
        });

        console.log(`Aplicado multiplicador de dificultad x${multiplier.toFixed(2)} a todos los enemigos`);
    }

    // Añade este método a tu clase GameStateManager
    getDiscoveredFireplaces() {
        // Devuelve la lista de hogueras descubiertas o un array vacío si no hay ninguna
        return this.gameState?.discoveredFireplaces || [];
    }
}
