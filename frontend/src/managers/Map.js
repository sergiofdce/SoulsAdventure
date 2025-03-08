export default class Map {
    constructor(scene, mapKey, tilesetKey, tilesetImage) {
        this.scene = scene;

        // Cargar el mapa desde Tiled
        this.map = this.scene.make.tilemap({ key: mapKey });
        this.tileset = this.map.addTilesetImage(tilesetKey, tilesetImage);

        // Crear las capas del mapa
        this.groundLayer = this.map.createLayer("ground", this.tileset, 0, 0);
        this.collisionLayer = this.map.createLayer("collisions", this.tileset, 0, 0);

        if (this.collisionLayer) {
            this.collisionLayer.setCollisionByExclusion([-1]);
            this.collisionLayer.renderDebug(scene.add.graphics(), {
                tileColor: null, // No colorear las tiles normales
                collidingTileColor: new Phaser.Display.Color(255, 0, 0, 128), // Color rojo semitransparente
            });
        }

    }
}
