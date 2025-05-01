import { Enemy } from "./Enemy.js";

export class EnanoFuego extends Enemy {
    constructor(scene, x, y, texture = "enemy-enanoFuego", name = "Enano de fuego") {
        // Asignar tamaño del sprite
        const scale = 0.5;
        super(scene, x, y, texture, name, scale);

        // Atributos específicos
        this.health = 50;
        this.strength = 10;
        this.speed = 5;

        // Ruta del spritesheet
        this.spritesheet = "./assets/enemies/enemy-EnanoFuego.png";

        // Definir todas las animaciones disponibles
        this.animationDefinitions = {
            idle: {
                key: "enanoFuego-idle",
                frames: { start: 0, end: 5 },
                frameRate: 5,
                repeat: -1,
            },
            walk: {
                key: "enanoFuego-walk",
                frames: { start: 0, end: 5 },
                frameRate: 10,
                repeat: -1,
            },
            hit: {
                key: "enanoFuego-hit",
                frames: { start: 18, end: 23 },
                frameRate: 8,
                repeat: 0,
            },
            "light-attack": {
                key: "enanoFuego-light-attack",
                frames: { start: 12, end: 17 },
                frameRate: 8,
                repeat: 0,
            },
            "heavy-attack": {
                key: "enanoFuego-heavy-attack",
                frames: { start: 12, end: 17 },
                frameRate: 8,
                repeat: 0,
            },
            death: {
                key: "enanoFuego-death",
                frames: { start: 24, end: 29 },
                frameRate: 5,
                repeat: 0,
            },
            dash: {
                key: "enanoFuego-dash",
                frames: { start: 6, end: 11 },
                frameRate: 8,
                repeat: 0,
            },
        };
        
        // Crear animaciones
        this.createAnimations();
    }

    createAnimations() {
        // Solo crear las animaciones de movimiento necesarias en el mundo
        const animsToCreate = ["idle", "walk"];

        animsToCreate.forEach((animName) => {
            const animDef = this.animationDefinitions[animName];

            if (!this.scene.anims.exists(animDef.key)) {
                this.scene.anims.create({
                    key: animDef.key,
                    frames: this.scene.anims.generateFrameNumbers("enemy-enanoFuego", {
                        start: animDef.frames.start,
                        end: animDef.frames.end,
                    }),
                    frameRate: animDef.frameRate,
                    repeat: animDef.repeat,
                });
            }
        });
    }

    // Método para crear animaciones de combate (usado por CombatScene)
    createCombatAnimations(scene, combatTexture) {
        // Crear todas las animaciones para combate
        Object.keys(this.animationDefinitions).forEach((animName) => {
            const animDef = this.animationDefinitions[animName];
            const combatKey = animName; // Usar el nombre de animación directamente (idle, hit, etc.)

            if (!scene.anims.exists(combatKey)) {
                scene.anims.create({
                    key: combatKey,
                    frames: scene.anims.generateFrameNumbers(combatTexture, {
                        start: animDef.frames.start,
                        end: animDef.frames.end,
                    }),
                    frameRate: animDef.frameRate,
                    repeat: animDef.repeat,
                });
            }
        });
    }

    // Override the follow method to include animation
    follow(player) {
        super.follow(player);

        // Add animation based on movement
        if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
            this.sprite.anims.play(this.animationDefinitions.walk.key, true);
        } else {
            this.sprite.anims.play(this.animationDefinitions.idle.key, true);
        }
    }

    kill() {
        console.log("EnanoFuego killed");
        super.kill();
    }
}
