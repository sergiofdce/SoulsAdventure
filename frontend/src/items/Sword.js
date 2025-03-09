import { Item } from "./Item.js";

export default class Sword extends Item {

    constructor(scene, x, y, texture, name, description, damage) {
      super(scene, x, y, texture, name, description, damage);
    }

    swing() {
      console.log(`Swinging the sword: ${this.name} with damage: ${this.damage}`);
    }
  }