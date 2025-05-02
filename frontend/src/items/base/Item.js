export class Item {
    constructor(id, name, category, description, image, quantity = 0, equipped = false) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.image = image;
        this.quantity = quantity;
        this.equipped = equipped;
    }
}

export class Accessory extends Item {
    constructor(
        id,
        name,
        description,
        image,
        statBoost = 0,
        quantity = 0,
        equipped = false,
        accessory1 = false,
        accessory2 = false
    ) {
        super(id, name, "accessory", description, image, quantity, equipped);
        this.statBoost = statBoost;
        this.accessory1 = accessory1;
        this.accessory2 = accessory2;
    }
}

export class Edible extends Item {
    constructor(id, name, description, image, effect = "", quantity = 0) {
        super(id, name, "edible", description, image, quantity, false);
        this.effect = effect;
    }
}

export class Shield extends Item {
    constructor(id, name, description, image, defense, blockChance) {
        super(id, name, "shield", description, image);
        this.defense = defense || 0;
        this.blockChance = blockChance || 0;
    }
}

export class Weapon extends Item {
    constructor(id, name, description, image, damage = 0, quantity = 0, equipped = false) {
        super(id, name, "weapon", description, image, quantity, equipped);
        this.damage = damage;
    }
}

export class Armor extends Item {
    constructor(id, name, category, description, image, defense = 0, quantity = 0, equipped = false) {
        super(id, name, category, description, image, quantity, equipped);
        this.defense = defense;
    }
}
