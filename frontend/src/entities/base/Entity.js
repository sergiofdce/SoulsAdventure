export class Entity {
    constructor(scene, x, y, texture, name) {
        this.sprite = null;
        this.scene = scene;
        this.name = name;
        this.interactionRadius = 50;
    }

    isInRange(player) {
        const distance = Phaser.Math.Distance.Between(player.sprite.x, player.sprite.y, this.sprite.x, this.sprite.y);

        return distance <= this.interactionRadius;
    }

    setupSprite(sprite, scale = 0.5) {
        sprite.setScale(scale);

        // Configuración mejorada del hitbox con alineación vertical adecuada
        const scaledWidth = sprite.displayWidth;
        const scaledHeight = sprite.displayHeight;

        // Hacer el hitbox más pequeño para una mejor jugabilidad
        const bodyWidth = scaledWidth * 0.5;
        const bodyHeight = scaledHeight * 0.3; // Altura más pequeña

        // Posicionar el hitbox en la parte inferior del sprite (área de los pies)
        const offsetX = (scaledWidth - bodyWidth) / 2;
        const offsetY = scaledHeight * 0.7; // Mover hitbox hacia abajo al área de los pies

        // Aplicar el hitbox, teniendo en cuenta la escala
        sprite.body.setSize(bodyWidth / scale, bodyHeight / scale);
        sprite.body.setOffset(offsetX / scale, offsetY / scale);

        return sprite;
    }
}
