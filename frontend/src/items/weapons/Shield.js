import { Item } from "../base/Item.js";

export default class Shield extends Item {
    constructor(scene, x, y, texture, name, description, defense) {
        super(scene, x, y, texture, name, description);
        this.defense = defense;
    }
}
