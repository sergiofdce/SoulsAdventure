/**
 * Clase para actualizar el HUD con efectos visuales
 */
export default class HudUpdater {
    constructor() {
        this.previousHealth = 100;
        this.previousSouls = 0;

        // Referencias del DOM
        this.healthElement = document.getElementById("health-amount");
        this.soulsElement = document.getElementById("souls-amount");
        this.healthProgress = document.querySelector(".hud-progress");
        this.playerNameElement = document.getElementById("hud-player-name");
        this.playerIconImg = document.querySelector(".hud-player-icon img");
    }

    /**
     * Actualiza la información del jugador en el HUD
     */
    updatePlayerInfo(player) {
        if (!player) return;

        // Actualizar nombre e icono del jugador
        if (player.name && this.playerNameElement) {
            this.playerNameElement.textContent = player.name;
        }

        if (player.img && this.playerIconImg) {
            this.playerIconImg.src = player.img;
        }

        // Actualizar salud con efecto visual si cambió
        if (player.health !== this.previousHealth) {
            this.updateHealth(player.health, player.maxHealth || 100);
        }

        // Actualizar almas con efecto visual si cambió
        if (player.souls !== this.previousSouls) {
            this.updateSouls(player.souls);
        }
    }

    /**
     * Actualiza el valor de salud con animación
     */
    updateHealth(health, maxHealth) {
        if (!this.healthElement) return;

        // Guardar valor anterior
        this.previousHealth = health;

        // Actualizar texto con animación
        this.healthElement.textContent = health;
        this.animateValueChange(this.healthElement);

        // Actualizar barra de progreso
        if (this.healthProgress) {
            const percentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
            this.healthProgress.style.width = `${percentage}%`;

            // Cambiar color según el nivel de salud
            if (percentage < 20) {
                this.healthProgress.style.background = "var(--color-danger)";
            } else if (percentage < 50) {
                this.healthProgress.style.background = "#FFA500"; // Naranja
            } else {
                this.healthProgress.style.background = "var(--color-success)";
            }
        }
    }

    /**
     * Actualiza el valor de almas con animación
     */
    updateSouls(souls) {
        if (!this.soulsElement) return;

        // Guardar valor anterior
        this.previousSouls = souls;

        // Actualizar texto con animación
        this.soulsElement.textContent = souls;
        this.animateValueChange(this.soulsElement);

        // Efecto de brillo si se ganan almas
        if (souls > this.previousSouls) {
            const soulsGlow = document.querySelector(".hud-souls-glow");
            if (soulsGlow) {
                soulsGlow.style.opacity = "0.8";
                setTimeout(() => {
                    soulsGlow.style.opacity = "0";
                }, 800);
            }
        }
    }

    /**
     * Anima un cambio de valor con un efecto de escala
     */
    animateValueChange(element) {
        // Remover clase anterior por si hay una animación en curso
        element.classList.remove("value-changed");

        // Forzar un reflow para reiniciar la animación
        void element.offsetWidth;

        // Aplicar la animación
        element.classList.add("value-changed");
    }
}
