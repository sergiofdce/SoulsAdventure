export default class Map {
    constructor(scene, mapKey, tilesets) {
        this.scene = scene;

        // Cargar los assets del mapa
        tilesets.forEach(({ key, path }) => {
            if (!this.scene.textures.exists(key)) {
                this.scene.load.image(key, path);
            }
        });

        // Cargar el mapa desde Tiled
        this.scene.load.once('complete', () => {
            this.map = this.scene.make.tilemap({ key: mapKey });

            // Agregar los tilesets al mapa
            this.tilesets = tilesets.map(({ key }) => this.map.addTilesetImage(key));

            // Crear las capas del mapa
            this.groundLayer1 = this.map.createLayer("ground1", this.tilesets, 0, 0);
            this.groundLayer2 = this.map.createLayer("ground2", this.tilesets, 0, 0);
            this.groundLayer3 = this.map.createLayer("ground3", this.tilesets, 0, 0);
            

            // Crear capas de colisión
            this.collisionLayer3 = this.map.createLayer("colision3", this.tilesets, 0, 0);
            this.collisionLayer2 = this.map.createLayer("colision2", this.tilesets, 0, 0);
            this.collisionLayer1 = this.map.createLayer("colision1", this.tilesets, 0, 0);
            this.perspectiveLayer = this.map.createLayer("perspective", this.tilesets, 0, 0);

            // Configurar colisiones para las capas de colisión
            [this.collisionLayer3, this.collisionLayer2, this.collisionLayer1, this.perspectiveLayer].forEach((layer) => {
                if (layer) {
                    layer.setCollisionByExclusion([-1]);
                }
            });

            
            
            this.detailsLayer = this.map.createLayer("details", this.tilesets, 0, 0);
        });

        this.scene.load.start();
    }
}
