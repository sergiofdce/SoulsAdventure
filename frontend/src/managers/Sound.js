export default class Sound {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
    }

    /**
     * Carga un sonido desde la carpeta audio.
     * @param {string} key - Clave para identificar el sonido.
     * @param {string} fileName - Nombre del archivo de audio.
     */
    loadSound(key, fileName) {
        this.scene.load.audio(key, `./assets/audio/${fileName}`);
    }

    /**
     * Reproduce un sonido cargado.
     * @param {string} key - Clave del sonido a reproducir.
     * @param {object} [config] - Configuración opcional (volumen, loop, etc.).
     */
    playSound(key, config = {}) {
        if (!this.sounds[key]) {
            this.sounds[key] = this.scene.sound.add(key);
        }
        this.sounds[key].play(config);
    }

    /**
     * Detiene un sonido en reproducción.
     * @param {string} key - Clave del sonido a detener.
     */
    stopSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].stop();
        }
    }

    /**
     * Carga múltiples sonidos.
     * @param {Array<{ key: string, fileName: string }>} soundList - Lista de sonidos a cargar.
     */
    loadSounds(soundList) {
        soundList.forEach(({ key, fileName }) => this.loadSound(key, fileName));
    }
}