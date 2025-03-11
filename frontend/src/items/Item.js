export default class Item extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture, name, description) {
      super(scene, x, y, texture);
      scene.add.existing(this);
  
      this.name = name;
      this.description = description;
    }

    use() {
      console.log(`Using item: ${this.name}`);
    }
}