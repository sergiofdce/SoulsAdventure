/**
 * Catálogo completo de todos los objetos disponibles en el juego
 * Organizado por categorías: armas, escudos, armaduras, consumibles, accesorios
 */

import { Weapon, Shield, Armor, Edible, Accessory } from "../../items/base/Item.js";

const ItemsDatabase = {
    // ARMAS
    weapons: {
        "espada-oscura": new Weapon(
            "espada-oscura",
            "Espada Oscura",
            "Una espada forjada con metal oscurecido por magia arcana.",
            "./assets/items/weapons/espada-oscura.png",
            15
        ),
        "espada-muy-larga": new Weapon(
            "espada-muy-larga",
            "Espada Muy Larga",
            "Una espada de alcance extraordinario, requiere gran destreza.",
            "./assets/items/weapons/espada-muy-larga.png",
            25,
            0,
            false,
            true // twoHanded
        ),
        "hacha-de-guerra": new Weapon(
            "hacha-de-guerra",
            "Hacha de Guerra",
            "Un hacha pesada diseñada para destrozar armaduras.",
            "./assets/items/weapons/hacha-guerra.png",
            30,
            0,
            false,
            true // twoHanded
        ),
        "daga-rapida": new Weapon(
            "daga-rapida",
            "Daga Rápida",
            "Una daga ligera que permite ataques veloces.",
            "./assets/items/weapons/daga-rapida.png",
            8
        ),
    },

    // ESCUDOS
    shields: {
        "escudo-metal": new Shield(
            "escudo-metal",
            "Escudo de Metal",
            "Un resistente escudo de metal que ofrece buena protección.",
            "./assets/items/shields/escudo-metal.png",
            10,
            25
        ),
        "escudo-anillos-cristal": new Shield(
            "escudo-anillos-cristal",
            "Escudo de Anillos y Cristal",
            "Escudo ligero con cristales mágicos que mejoran su capacidad de bloqueo.",
            "./assets/items/shields/escudo-anillos-cristal.png",
            5,
            35
        ),
        "escudo-torre": new Shield(
            "escudo-torre",
            "Escudo Torre",
            "Un gran escudo que cubre casi todo el cuerpo, pero limita la movilidad.",
            "./assets/items/shields/escudo-torre.png",
            20,
            50
        ),
    },

    // ARMADURAS
    armor: {
        // Cascos
        "casco-metal": new Armor(
            "casco-metal",
            "Casco de Metal",
            "helmet",
            "Un casco de metal resistente.",
            "./assets/items/armor/casco-metal.png",
            30
        ),
        "casco-cuero": new Armor(
            "casco-cuero",
            "Casco de Cuero",
            "helmet",
            "Un casco ligero pero con poca protección.",
            "./assets/items/armor/casco-cuero.png",
            10
        ),

        // Pecheras
        "pechera-hierro": new Armor(
            "pechera-hierro",
            "Pechera de hierro",
            "chest",
            "Una pechera de hierro resistente.",
            "./assets/items/armor/pechera-hierro.png",
            50
        ),
        "pechera-cuero": new Armor(
            "pechera-cuero",
            "Pechera de Cuero",
            "chest",
            "Una pechera ligera que permite mayor movilidad.",
            "./assets/items/armor/pechera-cuero.png",
            20
        ),

        // Guantes
        "guantes-magicos": new Armor(
            "guantes-magicos",
            "Guantes mágicos",
            "glove",
            "Guantes encantados con magia.",
            "./assets/items/armor/guantes-magicos.png",
            10
        ),
        "guantes-hierro": new Armor(
            "guantes-hierro",
            "Guantes de Hierro",
            "glove",
            "Guantes robustos que protegen manos y antebrazos.",
            "./assets/items/armor/guantes-hierro.png",
            15
        ),

        // Botas
        "zapatos-montana": new Armor(
            "zapatos-montana",
            "Zapatos de montaña",
            "shoes",
            "Zapatos resistentes ideales para montañas.",
            "./assets/items/armor/zapatos-montana.png",
            15
        ),
        "botas-viajero": new Armor(
            "botas-viajero",
            "Botas del Viajero",
            "shoes",
            "Botas ligeras y cómodas para largas caminatas.",
            "./assets/items/armor/botas-viajero.png",
            8
        ),
    },

    // CONSUMIBLES
    consumables: {
        "pocion-curacion": new Edible(
            "pocion-curacion",
            "Poción de Curación",
            "Restaura 50 puntos de vida al instante.",
            "./assets/items/consumables/pocion-curacion.png",
            "restore-health-50"
        ),
        "pocion-resistencia": new Edible(
            "pocion-resistencia",
            "Poción de Resistencia",
            "Aumenta la resistencia en un 20% durante 60 segundos.",
            "./assets/items/consumables/pocion-resistencia.png",
            "boost-resistance-20-60"
        ),
        "pocion-fuerza": new Edible(
            "pocion-fuerza",
            "Poción de Fuerza",
            "Aumenta la fuerza en un 15% durante 45 segundos.",
            "./assets/items/consumables/pocion-fuerza.png",
            "boost-strength-15-45"
        ),
    },

    // ACCESORIOS
    accessories: {
        "anillo-oro": new Accessory(
            "anillo-oro",
            "Anillo de Oro",
            "Un anillo de oro que incrementa ligeramente tu fuerza.",
            "./assets/items/accessories/anillo-oro.png",
            5
        ),
        "anillo-legendario": new Accessory(
            "anillo-legendario",
            "Anillo Legendario",
            "Un anillo de gran poder que aumenta significativamente tus atributos.",
            "./assets/items/accessories/anillo-legendario.png",
            15
        ),
        "anillo-mitico": new Accessory(
            "anillo-mitico",
            "Anillo Mítico",
            "Un anillo creado por dioses antiguos con propiedades asombrosas.",
            "./assets/items/accessories/anillo-mitico.png",
            25
        ),
        "anillo-ceremonial": new Accessory(
            "anillo-ceremonial",
            "Anillo Ceremonial",
            "Un anillo utilizado en ceremonias ancestrales.",
            "./assets/items/accessories/anillo-ceremonial.png",
            10
        ),
        "collar-dragon": new Accessory(
            "collar-dragon",
            "Collar del Dragón",
            "Un collar forjado con escamas de dragón que aumenta tu resistencia al fuego.",
            "./assets/items/accessories/collar-dragon.png",
            12
        ),
    },

    // Método para obtener todos los items en formato plano
    getAllItems() {
        return {
            ...this.weapons,
            ...this.shields,
            ...this.armor,
            ...this.consumables,
            ...this.accessories,
        };
    },
};

// Exportar todo el catálogo
export default ItemsDatabase;

// Exportar también cada categoría individualmente para uso más específico
export const weapons = ItemsDatabase.weapons;
export const shields = ItemsDatabase.shields;
export const armor = ItemsDatabase.armor;
export const consumables = ItemsDatabase.consumables;
export const accessories = ItemsDatabase.accessories;
