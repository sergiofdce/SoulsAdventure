export default class Controls {
    constructor(scene) {
        this.scene = scene;
        // Mantenemos cursors por compatibilidad pero añadimos teclas WASD
        this.cursors = scene.input.keyboard.createCursorKeys();

        // Teclas WASD
        this.wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // Inicializa los estados de movimiento
        this.isMoving = false;
        this.direction = { x: 0, y: 0 };

        this.movementSpeed = 100;

        // Mantener referencia de las teclas para ataques
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.heavyAttackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    getCursors() {
        return this.cursors;
    }

    // Método para controlar el movimiento del jugador
    handlePlayerMovement(player) {
        // Resetear las velocidades y el estado de movimiento
        let isMoving = false;

        // Control de movimiento horizontal
        if (this.wasd.left.isDown) {
            player.sprite.setVelocityX(-this.movementSpeed);
            player.sprite.setFlipX(true);
            isMoving = true;
            this.direction.x = -1;
        } else if (this.wasd.right.isDown) {
            player.sprite.setVelocityX(this.movementSpeed);
            player.sprite.setFlipX(false);
            isMoving = true;
            this.direction.x = 1;
        } else {
            player.sprite.setVelocityX(0);
            this.direction.x = 0;
        }

        // Control de movimiento vertical
        if (this.wasd.up.isDown) {
            player.sprite.setVelocityY(-this.movementSpeed);
            isMoving = true;
            this.direction.y = -1;
        } else if (this.wasd.down.isDown) {
            player.sprite.setVelocityY(this.movementSpeed);
            isMoving = true;
            this.direction.y = 1;
        } else {
            player.sprite.setVelocityY(0);
            this.direction.y = 0;
        }

        // Actualizar el estado de movimiento
        this.isMoving = isMoving;

        // Gestionar animaciones según el estado de movimiento
        if (isMoving) {
            player.sprite.anims.play("player-walk", true);
        } else {
            player.sprite.anims.play("player-idle", true);
        }

        // Devolver el estado de movimiento para otros usos
        return {
            isMoving: this.isMoving,
            direction: this.direction,
        };
    }

    // Método para gestionar los ataques del jugador
    handlePlayerAttacks(player) {
        let isAttacking = false;

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            player.sprite.anims.play("player-light-attack", true);
            isAttacking = true;
        } else if (Phaser.Input.Keyboard.JustDown(this.heavyAttackKey)) {
            player.sprite.anims.play("player-heavy-attack", true);
            isAttacking = true;
        }

        return isAttacking;
    }

    // Método general para actualizar el estado del jugador
    update(player) {
        // Si no hay jugador, no hacer nada
        if (!player) return;

        // Gestionar el movimiento del jugador
        const movementState = this.handlePlayerMovement(player);

        // console.log(`Coordenadas del jugador: X=${Math.round(player.sprite.x)}, Y=${Math.round(player.sprite.y)}`);

        // Gestionar los ataques del jugador si no está en movimiento
        if (!movementState.isMoving) {
            this.handlePlayerAttacks(player);
        }
    }
}
