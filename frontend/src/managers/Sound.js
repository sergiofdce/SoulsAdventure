export default class Sound {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
    }

    loadSound(key, fileName) {
        this.scene.load.audio(key, `./assets/audio/${fileName}`);
    }

    playSound(key, config = {}) {
        if (!this.sounds[key]) {
            this.sounds[key] = this.scene.sound.add(key);
        }
        this.sounds[key].play(config);
    }

    stopSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].stop();
        }
    }

    loadSounds(soundList) {
        soundList.forEach(({ key, fileName }) => this.loadSound(key, fileName));
    }
}