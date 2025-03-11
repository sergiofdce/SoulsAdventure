import { Item } from "./Item.js";

export default class Armor extends Item {
    
    constructor(scene, x, y, texture, name, description, defense) {
      super(scene, x, y, texture, name, description, defense);
    }

    equip() {
      console.log(`Equipping armor: ${this.name} with defense: ${this.defense}`);
    }
}