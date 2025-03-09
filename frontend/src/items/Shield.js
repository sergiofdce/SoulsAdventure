import { Item } from "./Item.js";

export default class Shield extends Item {
  
    constructor(scene, x, y, texture, name, description, defense) {
      super(scene, x, y, texture, name, description, defense);
    }

    block() {
      console.log(`Blocking with shield: ${this.name} with defense: ${this.defense}`);
    }
}