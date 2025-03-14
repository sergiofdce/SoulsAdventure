export default class Item {
    constructor(scene, x, y, texture, name, description) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, texture);
        this.texture = texture;
        this.name = name;
        this.description = description;
    }
}
