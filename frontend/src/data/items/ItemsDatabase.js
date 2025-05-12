/**
 * Catálogo completo de todos los objetos disponibles en el juego
 * Organizado por categorías: armas, escudos, armaduras, consumibles, accesorios
 */

import { Weapon, Shield, Armor, Accessory, Consumable } from "../../items/base/Item.js";

const ItemsDatabase = {
    // ARMAS
    weapons: {
        "espada-oscura": new Weapon(
            "espada-oscura",
            "Espada Oscura",
            "Una espada forjada con metal oscurecido por magia arcana.",
            "./assets/items/weapons/espada-oscura.png",
            25
        ),
        "espada-larga": new Weapon(
            "espada-larga",
            "Espada Larga",
            "Una espada de alcance extraordinario, requiere gran destreza.",
            "./assets/items/weapons/espada-larga.png",
            10
        ),
    },

    // ESCUDOS
    shields: {
        "escudo-torre": new Shield(
            "escudo-torre",
            "Escudo Torre",
            "Un gran escudo que cubre casi todo el cuerpo, pero limita la movilidad.",
            "./assets/items/shields/escudo-torre.png",
            20
        ),
        "escudo-dragon": new Shield(
            "escudo-dragon",
            "Escudo del Dragón",
            "Forjado con escamas de dragón, este escudo ofrece protección contra elementos mágicos.",
            "./assets/items/shields/escudo-dragon.png",
            50
        ),
    },

    // ARMADURAS
    armor: {
        // Cuero
        "casco-cuero": new Armor(
            "casco-cuero",
            "Casco de Cuero",
            "helmet",
            "Un casco ligero elaborado con cuero tratado, ofrece protección básica.",
            "./assets/items/armor/casco-cuero.png",
            12
        ),
        "pechera-cuero": new Armor(
            "pechera-cuero",
            "Pechera de Cuero",
            "chest",
            "Armadura ligera pero resistente, perfecta para moverse con agilidad.",
            "./assets/items/armor/pechera-cuero.png",
            20
        ),
        "guantes-cuero": new Armor(
            "guantes-cuero",
            "Guantes de Cuero",
            "glove",
            "Guantes flexibles que permiten gran destreza manual.",
            "./assets/items/armor/guantes-cuero.png",
            8
        ),
        "botas-cuero": new Armor(
            "botas-cuero",
            "Botas de Cuero",
            "shoes",
            "Botas resistentes y silenciosas, ideales para moverse sin ser detectado.",
            "./assets/items/armor/botas-cuero.png",
            10
        ),

        // Vagabundo
        "casco-vagabundo": new Armor(
            "casco-vagabundo",
            "Capucha de Vagabundo",
            "helmet",
            "Una desgastada capucha que ha visto incontables caminos y travesías.",
            "./assets/items/armor/casco-vagabundo.png",
            8
        ),
        "pechera-vagabundo": new Armor(
            "pechera-vagabundo",
            "Túnica de Vagabundo",
            "chest",
            "Una túnica andrajosa pero sorprendentemente resistente, perfecta para largos viajes.",
            "./assets/items/armor/pechera-vagabundo.png",
            15
        ),
        "guantes-vagabundo": new Armor(
            "guantes-vagabundo",
            "Vendajes de Vagabundo",
            "glove",
            "Simples vendajes que protegen las manos durante largos viajes.",
            "./assets/items/armor/guantes-vagabundo.png",
            5
        ),
        "botas-vagabundo": new Armor(
            "botas-vagabundo",
            "Sandalias de Vagabundo",
            "shoes",
            "Simples pero duraderas sandalias, perfectas para caminar largas distancias.",
            "./assets/items/armor/botas-vagabundo.png",
            7
        ),

        // Vigilante
        "casco-vigilante": new Armor(
            "casco-vigilante",
            "Yelmo del Vigilante",
            "helmet",
            "Yelmo reforzado diseñado para proteger a quienes custodian los reinos fronterizos.",
            "./assets/items/armor/casco-vigilante.png",
            35
        ),
        "pechera-vigilante": new Armor(
            "pechera-vigilante",
            "Coraza del Vigilante",
            "chest",
            "Pesada armadura que ha resistido innumerables batallas en defensa del reino.",
            "./assets/items/armor/pechera-vigilante.png",
            55
        ),
        "guantes-vigilante": new Armor(
            "guantes-vigilante",
            "Guanteletes del Vigilante",
            "glove",
            "Robustos guanteletes diseñados para proteger las manos en el combate.",
            "./assets/items/armor/guantes-vigilante.png",
            25
        ),
        "botas-vigilante": new Armor(
            "botas-vigilante",
            "Grebas del Vigilante",
            "shoes",
            "Pesadas botas de metal diseñadas para mantener firme la posición en batalla.",
            "./assets/items/armor/botas-vigilante.png",
            30
        ),

        // Demonio
        "casco-demonio": new Armor(
            "casco-demonio",
            "Cráneo Demoníaco",
            "helmet",
            "Un aterrador casco forjado a partir de huesos de criaturas del inframundo.",
            "./assets/items/armor/casco-demonio.png",
            40
        ),
        "pechera-demonio": new Armor(
            "pechera-demonio",
            "Coraza Demoníaca",
            "chest",
            "Una armadura forjada en las llamas del inframundo, emana un aura de maldad.",
            "./assets/items/armor/pechera-demonio.png",
            65
        ),
        "guantes-demonio": new Armor(
            "guantes-demonio",
            "Garras Demoníacas",
            "glove",
            "Guantes con garras afiladas capaces de desgarrar armaduras.",
            "./assets/items/armor/guantes-demonio.png",
            30
        ),
        "botas-demonio": new Armor(
            "botas-demonio",
            "Pezuñas Demoníacas",
            "shoes",
            "Botas que transforman los pies del portador en temibles pezuñas demoníacas.",
            "./assets/items/armor/botas-demonio.png",
            35
        ),
    },

    // CONSUMIBLES
    consumables: {
        "pocion-salud": new Consumable(
            "pocion-salud",
            "Poción de Salud",
            "Restaura puntos de vida durante el combate.",
            "./assets/items/consumables/pocion-salud.png",
            "restore-health"
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
        "anillo-ceremonial": new Accessory(
            "anillo-ceremonial",
            "Anillo Ceremonial",
            "Un anillo utilizado en ceremonias ancestrales.",
            "./assets/items/accessories/anillo-ceremonial.png",
            10
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
