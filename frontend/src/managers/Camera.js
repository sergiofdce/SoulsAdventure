export default class Camera {
    constructor(scene, player, map) {
        this.scene = scene;
        this.player = player;
        this.map = map;

        // Configurar cámara
        this.scene.cameras.main.setBounds(
            0,
            0,
            this.map.map.widthInPixels,
            this.map.map.heightInPixels
        );
        this.scene.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09);
        this.scene.cameras.main.roundPixels = true;
        this.scene.cameras.main.setZoom(1.5);
    }

    getCamera() {
        return this.scene.cameras.main;
    }
}
