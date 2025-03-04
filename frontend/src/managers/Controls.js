export default class Controls {
    constructor(scene) {
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    getCursors() {
        return this.cursors;
    }
}
