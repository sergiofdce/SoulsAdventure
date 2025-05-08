// Managers
import Player from "../entities/base/Player.js";
import Controls from "../managers/Controls.js";
import Camera from "../managers/Camera.js";
import Map from "../managers/Map.js";
import { DialogManager } from "../managers/Dialog.js";

// Enemigos Pueblo
import { EnanoFuego } from "../entities/enemies/EnanoFuego.js";
import { EnanoEscudo } from "../entities/enemies/EnanoEscudo.js";
import { EnanoMayor } from "../entities/enemies/EnanoMayor.js";
import { EnanoObservador } from "../entities/enemies/EnanoObservador.js";

// Enemigos Pantano
import { SlimeFuego } from "../entities/enemies/SlimeFuego.js";
import { SlimeHumano } from "../entities/enemies/SlimeHumano.js";
import { SlimeNormal } from "../entities/enemies/SlimeNormal.js";
import { SlimePinchos } from "../entities/enemies/SlimePinchos.js";

// Bosses
import { Toro } from "../entities/bosses/Toro.js";
import { Nasus } from "../entities/bosses/Nasus.js";

// Entidades
import { Trainer } from "../entities/npcs/Trainer.js";
import { Fireplace } from "../entities/npcs/Fireplace.js";
import { InteractableObject } from "../entities/interactables/Objects.js";

// Consola
import { setupConsoleCommands } from "../utils/consoleCommands.js";

// MongoDB
import GameStateManager from "../managers/GameState.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.enemies = [];
        this.bosses = [];
        this.fireplaces = [];
        this.interactableObjects = [];
        this.gameState = {};
        this.gameStateManager = new GameStateManager();
    }

    preload() {
        this.loadAssets();
    }

    async create() {
        // Configurar controles de entrada
        this.setupInput();

        // Configurar el mapa y límites del mundo
        this.setupMap();

        // Instanciar el jugador
        this.spawnPlayer();

        // Inicializar el GameStateManager con la escena y el jugador
        this.gameStateManager.initialize(this, this.player);

        // Cargar datos guardados usando el GameStateManager
        await this.loadSavedData();

        // Generar Trainer
        this.spawnTrainer();

        // Generar hogueras
        this.spawnFireplaces();

        // Generar enemigos en el mapa
        this.spawnEnemies();

        // Generar Bosses
        this.spawnBosses();

        // Generar objetos en el mapa
        this.spawnObjects();

        // Dialogo inicial
        this.showFirstDialog();

        // Configurar colisiones entre objetos
        this.setupCollisions();

        // Configurar la cámara para seguir al jugador
        this.setupCamera();

        // Configurar comandos de consola para el inventario
        this.setupConsoleCommands();

        // Activar modo debug
        this.enableDebugMode();
    }

    loadAssets() {
        // Cargar assets Player
        this.load.spritesheet("player", "./assets/player/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        // Cargar assets NPCs
        this.load.spritesheet("trainer", "./assets/player/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        // Cargar assets Enemigos
        this.load.spritesheet("enemy-EnanoFuego", "./assets/enemies/enemy-EnanoFuego.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        this.load.spritesheet("enemy-EnanoEscudo", "./assets/enemies/enemy-EnanoEscudo.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        this.load.spritesheet("enemy-EnanoMayor", "./assets/enemies/enemy-EnanoMayor.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        this.load.spritesheet("enemy-EnanoObservador", "./assets/enemies/enemy-EnanoObservador.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        this.load.spritesheet("enemy-SlimeFuego", "./assets/enemies/enemy-SlimeFuego.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        this.load.spritesheet("enemy-SlimeHumano", "./assets/enemies/enemy-SlimeHumano.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        this.load.spritesheet("enemy-SlimeNormal", "./assets/enemies/enemy-SlimeNormal.png", {
            frameWidth: 96,
            frameHeight: 96,
        });
        this.load.spritesheet("enemy-SlimePinchos", "./assets/enemies/enemy-SlimePinchos.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        // Cargar assets Bosses
        this.load.spritesheet("boss-Toro", "./assets/bosses/boss-Toro.png", {
            frameWidth: 80,
            frameHeight: 80,
        });
        this.load.spritesheet("boss-Nasus", "./assets/bosses/boss-Nasus.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        // Cargar asset hoguera
        this.load.spritesheet("fireplace", "./assets/player/player.png", {
            frameWidth: 96,
            frameHeight: 96,
        });

        // Cargar assets objetos
        this.load.image("escudo-torre", "./assets/items/shields/escudo-torre.png");
        this.load.image("botas-vigilante", "./assets/items/armor/botas-vigilante.png");
        this.load.image("casco-vigilante", "./assets/items/armor/casco-vigilante.png");

        // Cargar assets Mapa
        this.load.tilemapTiledJSON("map", "assets/maps/Map.json");
        this.load.image("RA_Overworld_Full", "assets/tilesets/Tilesets/RA_Overworld_Full.png");
        this.load.image("RA_Beast", "assets/tilesets/Tilesets/RA_Beast.png");
        this.load.image("RA_Cavern_Full", "assets/tilesets/Tilesets/RA_Cavern_Full.png");
        this.load.image("RA_Hell", "assets/tilesets/Tilesets/RA_Hell.png");
        this.load.image("RA_Jungle", "assets/tilesets/Tilesets/RA_Jungle.png");
        this.load.image("RA_Village", "assets/tilesets/Tilesets/RA_Village.png");
        this.load.image("RA_Wasteland_Water", "assets/tilesets/Tilesets/RA_Wasteland_Water.png");
        this.load.image("RA_Animated_Water", "assets/tilesets/Tilesets/RA_Animated_Water.png");
        this.load.image("tree03_s_01_animation", "assets/tilesets/Tilesets/tree03_s_01_animation.png");
        this.load.image("RA_Pyramid", "assets/tilesets/Tilesets/RA_Pyramid.png");
        this.load.image("RA_Ruins", "assets/tilesets/Tilesets/RA_Ruins.png");
        this.load.image("RA_Ship", "assets/tilesets/Tilesets/RA_Ship.png");
        this.load.image("RA_Hell_Animations", "assets/tilesets/Tilesets/RA_Hell_Animations.png");
    }

    setupInput() {
        // Mostrar Inventario
        this.input.keyboard.on("keydown-I", () => {
            this.scene.pause();
            this.scene.launch("InventoryScene", { player: this.player });
        });

        // Interactuar
        this.input.keyboard.on("keydown-E", () => {
            // Trainer
            if (this.trainer.isInRange(this.player)) {
                this.trainer.interact(this.player);
            }

            // Hogueras
            this.fireplaces.forEach((fireplace) => {
                if (fireplace.isInRange(this.player)) {
                    fireplace.interact(this.player);
                }
            });
        });
    }

    setupMap() {
        // Instanciar mapa con los tilesets necesarios
        this.mapManager = new Map(this, "map", [
            { key: "RA_Overworld_Full", path: "assets/tilesets/Tilesets/RA_Overworld_Full.png" },
            { key: "RA_Beast", path: "assets/tilesets/Tilesets/RA_Beast.png" },
            { key: "RA_Cavern_Full", path: "assets/tilesets/Tilesets/RA_Cavern_Full.png" },
            { key: "RA_Hell", path: "assets/tilesets/Tilesets/RA_Hell.png" },
            { key: "RA_Jungle", path: "assets/tilesets/Tilesets/RA_Jungle.png" },
            { key: "RA_Village", path: "assets/tilesets/Tilesets/RA_Village.png" },
            { key: "RA_Wasteland_Water", path: "assets/tilesets/Tilesets/RA_Wasteland_Water.png" },
            { key: "RA_Animated_Water", path: "assets/tilesets/Tilesets/RA_Animated_Water.png" },
            { key: "tree03_s_01_animation", path: "assets/tilesets/Tilesets/tree03_s_01_animation.png" },
            { key: "RA_Pyramid", path: "assets/tilesets/Tilesets/RA_Pyramid.png" },
            { key: "RA_Ruins", path: "assets/tilesets/Tilesets/RA_Ruins.png" },
            { key: "RA_Ship", path: "assets/tilesets/Tilesets/RA_Ship.png" },
            { key: "RA_Hell_Animations", path: "assets/tilesets/Tilesets/RA_Hell_Animations.png" },
        ]);

        // Configurar límites del mundo
        this.physics.world.setBounds(0, 0, this.mapManager.map.widthInPixels, this.mapManager.map.heightInPixels);
    }

    spawnPlayer() {
        // Intentar obtener el nombre del jugador del localStorage si existe
        let playerName = "";

        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (userData && userData.playerName) {
                playerName = userData.playerName;
            }
        } catch (error) {
            console.error("Error al obtener el nombre del jugador:", error);
        }

        this.player = new Player(this, 306, 454, "player", playerName);

        // Usamos el inventario del jugador para el gameState
        this.gameState.inventory = this.player.inventory;
    }

    async loadSavedData() {
        try {
            // Usar el GameStateManager para cargar los datos
            const success = await this.gameStateManager.loadGame();

            if (success) {
                // Actualizar la interfaz de usuario con los nuevos valores
                this.updateHUD();

                // Efecto visual en el elemento de vida para indicar actualización
                const healthElement = document.getElementById("health-amount");
                healthElement.classList.add("value-changed");
                setTimeout(() => {
                    healthElement.classList.remove("value-changed");
                }, 1000);

                return true;
            } else {
                console.warn("No se pudieron cargar datos de partida. Usando valores por defecto.");
                return false;
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            return false;
        }
    }

    updateHUD() {
        // Actualizar vida en el HUD
        const healthElement = document.getElementById("health-amount");
        if (healthElement) {
            // Mostrar la vida actual, no la máxima
            healthElement.textContent = this.player.health;

            // Actualizar barra de progreso de vida
            const healthBar = document.querySelector(".hud-progress");
            if (healthBar) {
                // Calcular porcentaje de vida actual respecto al máximo
                const healthPercentage = Math.max(0, Math.min((this.player.health / this.player.maxHealth) * 100, 100));
                healthBar.style.width = `${healthPercentage}%`;

                // Cambiar color según el porcentaje de vida
                if (healthPercentage > 60) {
                    healthBar.style.backgroundColor = "#4ade80"; // Verde
                } else if (healthPercentage > 30) {
                    healthBar.style.backgroundColor = "#facc15"; // Amarillo
                } else {
                    healthBar.style.backgroundColor = "#ef4444"; // Rojo
                }
            }
        }

        // Actualizar almas en el HUD
        const soulsElement = document.getElementById("souls-amount");
        if (soulsElement) {
            soulsElement.textContent = this.player.souls;

            // Efecto visual de actualización
            soulsElement.classList.add("value-changed");
            setTimeout(() => {
                soulsElement.classList.remove("value-changed");
            }, 1000);
        }

        // Actualizar nombre del jugador en el HUD
        const nameElement = document.getElementById("hud-player-name");
        if (nameElement && this.player.name) {
            nameElement.textContent = this.player.name;
        }
    }

    spawnTrainer() {
        this.trainer = new Trainer(this, 659, 519, "trainer");

        // Girar el sprite del trainer horizontalmente (efecto espejo)
        this.trainer.sprite.flipX = true;

        // Verificar si el NPC ya ha sido descubierto usando GameStateManager
        if (this.gameStateManager.isNPCDiscovered(this.trainer.name)) {
            this.trainer.firstInteraction = false;
            console.log(`Trainer "${this.trainer.name}" ya descubierto según GameStateManager`);
        }
        // Mantener la verificación anterior por compatibilidad
        else if (this.trainer.checkDiscoveredStatus) {
            this.trainer.checkDiscoveredStatus(this.player);
        }
    }

    spawnFireplaces() {
        const fireplaceConfigs = [
            { x: 630, y: 630, name: "Plaza del Pueblo" },
            { x: 1146, y: 2710, name: "Ruinas de Nuevo Londo" },
            { x: 3291, y: 4276, name: "Izalith perdida" },
        ];

        fireplaceConfigs.forEach((config) => {
            const fireplace = new Fireplace(this, config.x, config.y, "fireplace");
            fireplace.fireplaceName = config.name;
            fireplace.sprite.setTint(0xff6b6b);

            // Verificar si esta hoguera ya está descubierta
            if (this.gameStateManager.isFireplaceDiscovered(fireplace.fireplaceName)) {
                fireplace.discovered = true;
                console.log(`Hoguera ${fireplace.fireplaceName} ya descubierta anteriormente`);
            }

            this.fireplaces.push(fireplace);
        });
    }

    spawnEnemies() {
        // Destruir enemigos existentes y limpiar eventos
        this.enemies.forEach((enemy) => {
            if (enemy.sprite) {
                // Eliminar eventos de actualización antes de destruir
                this.events.off("update", enemy.updateEntity);
                enemy.sprite.destroy();
            }
        });

        // Limpiar el array de enemigos
        this.enemies = [];

        // Definir zonas con sus enemigos específicos
        const enemyZones = [
            {
                name: "Pueblo",
                enemies: [
                    { type: EnanoFuego, x: 678, y: 1058 },
                    { type: EnanoEscudo, x: 755, y: 1135 },
                    { type: EnanoMayor, x: 711, y: 1233 },
                    { type: EnanoObservador, x: 661, y: 1348 },
                    { type: EnanoFuego, x: 756, y: 1465 },
                    { type: EnanoEscudo, x: 1008, y: 1371 },
                    { type: EnanoMayor, x: 1218, y: 1290 },
                    { type: EnanoObservador, x: 1441, y: 1195 },
                    { type: EnanoFuego, x: 1551, y: 1291 },
                    { type: EnanoEscudo, x: 1648, y: 1211 },
                    { type: EnanoMayor, x: 1758, y: 1309 },
                    { type: EnanoObservador, x: 1896, y: 1401 },
                    { type: EnanoFuego, x: 1868, y: 1875 },
                    { type: EnanoEscudo, x: 1696, y: 1935 },
                    { type: EnanoMayor, x: 1471, y: 1985 },
                    { type: EnanoObservador, x: 1246, y: 2042 },
                ],
            },
            {
                name: "Pantano",
                enemies: [
                    { type: SlimeFuego, x: 1473, y: 2708 },
                    { type: SlimeHumano, x: 1759, y: 2710 },
                    { type: SlimeNormal, x: 1674, y: 2865 },
                    { type: SlimePinchos, x: 1863, y: 2955 },
                    { type: SlimeFuego, x: 1913, y: 3096 },
                    { type: SlimeHumano, x: 1436, y: 3152 },
                    { type: SlimeNormal, x: 1436, y: 3312 },
                    { type: SlimePinchos, x: 1487, y: 3500 },
                    { type: SlimeFuego, x: 1912, y: 3433 },
                    { type: SlimeHumano, x: 1670, y: 3666 },
                    { type: SlimeNormal, x: 1670, y: 3822 },
                    { type: SlimePinchos, x: 1889, y: 3832 },
                    { type: SlimeFuego, x: 2024, y: 3939 },
                    { type: SlimeHumano, x: 2024, y: 4083 },
                ],
            },
            // Puedes añadir más zonas aquí siguiendo el mismo patrón
        ];

        // Generar todos los enemigos de todas las zonas
        enemyZones.forEach((zone) => {
            console.log(`Generando ${zone.enemies.length} enemigos en la zona: ${zone.name}`);

            zone.enemies.forEach((enemyConfig) => {
                const enemy = new enemyConfig.type(this, enemyConfig.x, enemyConfig.y);
                this.enemies.push(enemy);
            });
        });

        // Configurar colisiones con el mapa
        this.setupEnemyMapCollisions();

        // Configurar colisiones con el jugador
        this.enemies.forEach((enemy) => enemy.setupCollision(this.player));
    }

    // Nuevo método para configurar colisiones de enemigos con todas las capas de colisión del mapa
    setupEnemyMapCollisions() {
        if (!this.mapManager) return;
        const collisionLayers = [
            this.mapManager.collisionLayer,
            this.mapManager.collisionLayer1,
            this.mapManager.collisionLayer2,
            this.mapManager.collisionLayer3,
            this.mapManager.perspectiveLayer,
        ].filter(Boolean);

        this.enemies.forEach((enemy) => {
            if (enemy.sprite) {
                collisionLayers.forEach((layer) => {
                    this.physics.add.collider(enemy.sprite, layer);
                });
                console.log(`Configuradas colisiones con mapa para ${enemy.name}`);
            }
        });
    }

    spawnBosses() {
        const bossConfigs = [
            { type: Toro, name: "Toro", x: 1100, y: 2307 },
            { type: Nasus, name: "Nasus", x: 2028, y: 4356 },
        ];

        bossConfigs.forEach((config) => {
            // Verificar si el boss ya ha sido derrotado usando GameStateManager
            if (this.gameStateManager.shouldSpawnBoss(config.name)) {
                const boss = new config.type(this, config.x, config.y, undefined, config.name);
                this.bosses.push(boss);
            } else {
                console.log(`Boss ${config.name} already defeated, not spawning`);
            }
        });
    }

    spawnObjects() {
        // Limpiar objetos existentes si los hay
        this.interactableObjects.forEach((obj) => {
            if (obj.sprite) obj.destroy();
        });
        this.interactableObjects = [];

        // Definir objetos en el mapa
        const objectsToSpawn = [
            { itemId: "escudo-torre", x: 257, y: 650, texture: "escudo-torre" },
            { itemId: "botas-vigilante", x: 695, y: 281, texture: "botas-vigilante" },
            { itemId: "casco-vigilante", x: 1057, y: 852, texture: "casco-vigilante" },
        ];

        // Filtrar objetos que ya han sido recogidos usando GameStateManager
        const filteredObjects = objectsToSpawn.filter((objConfig) =>
            this.gameStateManager.shouldSpawnItem(objConfig.itemId)
        );

        // Crear los objetos interactuables que no han sido recogidos
        filteredObjects.forEach((objConfig) => {
            const obj = new InteractableObject(this, objConfig.x, objConfig.y, objConfig.itemId, objConfig.texture);
            this.interactableObjects.push(obj);
        });

        console.log(
            `Creados ${this.interactableObjects.length} items recolectables (${
                objectsToSpawn.length - filteredObjects.length
            } ya fue descubierto)`
        );
    }

    setupCollisions() {
        // Colisiones con las capas de colisión del mapa
        [
            this.mapManager.collisionLayer1,
            this.mapManager.collisionLayer2,
            this.mapManager.collisionLayer3,
            this.mapManager.perspectiveLayer,
        ].forEach((layer) => {
            if (layer) {
                // Colisión para el jugador
                this.physics.add.collider(this.player.sprite, layer);

                // Colisión para enemigos y bosses
                [...this.enemies, ...this.bosses].forEach((entity) => {
                    this.physics.add.collider(entity.sprite, layer);
                });
            }
        });

        // Colisiones con NPC
        if (this.trainer) {
            this.trainer.setupCollision(this.player);
        }

        // Colisiones con enemigos
        this.enemies.forEach((enemy) => enemy.setupCollision(this.player));

        // Colisiones con bosses
        this.bosses.forEach((boss) => boss.setupCollision(this.player));

        // Colisiones para todas las hogueras
        this.fireplaces.forEach((fireplace) => {
            fireplace.setupCollision(this.player);
        });
    }

    setupCamera() {
        this.controls = new Controls(this);
        this.camera = new Camera(this, this.player, this.mapManager);
    }

    setupConsoleCommands() {
        // Aseguramos que estamos usando el inventario del jugador
        this.gameState.inventory = this.player.inventory;

        // ñadir una referencia al player con acceso al gameStateManager
        this.gameState.player = {
            ...this.player,
            scene: {
                ...this.player.scene,
                gameStateManager: this.gameStateManager,
            },
        };

        // Configuramos los comandos de consola
        setupConsoleCommands(this.gameState);

        // Mensaje informativo en consola
        console.log("💡 Comandos disponibles en consola: saveGame()");
    }

    enableDebugMode() {
        // Crear gráficos de debug directamente sin comprobar la configuración
        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = true;

        // Mostrar colisiones de cuerpos físicos con un color más visible
        this.physics.world.debugBodyColor = 0xff00ff;

        // Hacer que los bordes sean más visibles
        this.physics.world.debugGraphic.lineStyle(2, 0xff00ff, 1);

        // Mostrar información de debug para enemigos
        this.enemies.forEach((enemy) => {
            // Establecer colores específicos para los hitboxes de los enemigos
            if (enemy.sprite && enemy.sprite.body) {
                enemy.sprite.body.debugBodyColor = 0xff0000;
            }
        });
    }

    showFirstDialog() {
        // Verificar si el diálogo ya ha sido completado
        if (this.gameStateManager.hasCompletedIntroDialog()) {
            console.log("Diálogo de introducción ya completado anteriormente");
            return;
        }

        // Crear un objeto para el narrador
        const narrator = {
            name: this.player.name,
            dialogue: [
                "¿Cuánto tiempo estuve dormido...? El sol ya casi se está escondiendo.",
                "Me despertaron unos gritos... vienen del vecindario. Algo no va bien.",
                "Tengo un mal presentimiento.",
                "Quizá algún vecino haya visto algo. Necesito respuestas.",
            ],
            hasChoices: false,
            isInRange: () => true, // El narrador siempre está en rango
        };

        // Inicializar el gestor de diálogos si no existe
        const dialogManager = DialogManager.getInstance();

        // Mostrar diálogo
        dialogManager.startDialog(narrator, this.player);

        // Mostrar ayuda
        this.showHelpMessages();

        // Agregar evento de tecla para avanzar el diálogo con la tecla "e"
        const handleDialogKeyPress = (e) => {
            if (e.key === "e" && dialogManager.isDialogOpen()) {
                dialogManager.nextDialog();
            } else if (!dialogManager.isDialogOpen()) {
                // Cuando se cierra el diálogo, marcar como completado y guardar
                this.gameStateManager.setCompletedIntroDialog();
                this.gameStateManager.saveGame();

                // Eliminar el evento una vez completado
                document.removeEventListener("keydown", handleDialogKeyPress);
            }
        };

        document.addEventListener("keydown", handleDialogKeyPress);
    }

    // Método para mostrar mensajes de ayuda secuenciales
    showHelpMessages() {
        const messages = [
            "Usa las teclas WASD para moverte",
            "Para interactuar o recoger objetos, usa la tecla E",
            "Abre tu inventario con la tecla I, equipate con lo necesario!",
        ];

        const infoText = document.getElementById("infoText");
        const infoBox = document.getElementById("infoBox");

        if (infoText && infoBox) {
            setTimeout(() => {
                infoText.textContent = messages[0];
                infoBox.classList.add("visible");
                // Mostrar los mensajes restantes con retraso de 5 segundos
                for (let i = 1; i < messages.length; i++) {
                    setTimeout(() => {
                        infoText.textContent = messages[i];
                    }, i * 5000);
                }
                // Ocultar después de mostrar el último mensaje (+ 5 segundos)
                setTimeout(() => {
                    infoBox.classList.remove("visible");
                }, messages.length * 5000);
            }, 10000);
        }
    }

    update() {
        // Verificar que los controles y el jugador estén inicializados
        if (this.controls && this.player) {
            this.controls.update(this.player);

            // Solo actualizar el jugador si los controles están disponibles
            if (this.controls.getCursors) {
                this.player.update(this.controls.getCursors());
            }
        }

        // // Mantiene solo los enemigos que no han sido destruidos
        // this.enemies = this.enemies.filter((enemy) => !enemy.isDestroyed);

        // Profundidad Trainer
        if (this.trainer) {
            this.player.sprite.depth = this.player.sprite.y;
            this.trainer.sprite.depth = this.trainer.sprite.y;
        }

        // Profundidad hogueras
        this.fireplaces.forEach((fireplace) => {
            if (fireplace.sprite) {
                fireplace.sprite.depth = fireplace.sprite.y;
            }
        });

        // Profundidad de objetos interactuables
        this.interactableObjects.forEach((obj) => {
            if (obj.sprite && !obj.collected) {
                obj.sprite.depth = obj.sprite.y;
            }
        });
    }
}
