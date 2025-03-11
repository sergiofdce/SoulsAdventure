import Item from "../base/Item.js";

export default class Sword extends Item {
    constructor(scene, x, y, texture, name, description, damage) {
        super(scene, x, y, texture, name, description);
        this.damage = damage;
    }
}
