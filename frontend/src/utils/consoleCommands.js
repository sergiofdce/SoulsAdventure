/**
 * Este archivo configura comandos para la consola del navegador
 * que permiten manipular el inventario y otros aspectos del juego.
 */

import ItemsDatabase from "../data/items/itemsDatabase.js";

// Esta función debe ser llamada desde el punto de entrada principal de la aplicación
export function setupConsoleCommands(gameState) {
    // Comando para añadir un item al inventario
    window.addItem = function (itemId, quantity = 1) {
        const allItems = ItemsDatabase.getAllItems();

        // Verificar si el item existe
        if (!allItems[itemId]) {
            console.error(`El item "${itemId}" no existe en la base de datos.`);
            console.log("Usa 'listItems()' para ver todos los items disponibles.");
            return false;
        }

        // Añadir el item al inventario
        const result = gameState.inventory.addItem(itemId, quantity);

        if (result) {
            console.log(`✅ Añadido: ${quantity}x ${allItems[itemId].name}`);
            return true;
        } else {
            console.error("Error al añadir el item.");
            return false;
        }
    };

    // Comando para listar todos los items disponibles
    window.listItems = function (category = null) {
        let items;

        if (category) {
            // Filtrar por categoría si se proporciona
            switch (category.toLowerCase()) {
                case "weapons":
                    items = ItemsDatabase.weapons;
                    break;
                case "shields":
                    items = ItemsDatabase.shields;
                    break;
                case "armor":
                    items = ItemsDatabase.armor;
                    break;
                case "consumables":
                    items = ItemsDatabase.consumables;
                    break;
                case "accessories":
                    items = ItemsDatabase.accessories;
                    break;
                default:
                    console.error(`Categoría "${category}" no válida.`);
                    console.log("Categorías disponibles: weapons, shields, armor, consumables, accessories");
                    return;
            }
        } else {
            // Sin filtro, mostrar todos los items
            items = ItemsDatabase.getAllItems();
        }

        console.log("📋 Items disponibles:");
        Object.entries(items).forEach(([id, item]) => {
            console.log(`🔹 ${id}: ${item.name}`);
        });

        console.log("\nPara añadir un item, usa: addItem('id-del-item', cantidad)");
        console.log("Por ejemplo: addItem('espada-oscura', 1)");
    };

    // Comando para ver el inventario actual
    window.showInventory = function () {
        const inventory = gameState.inventory.getInventory();
        const allItems = ItemsDatabase.getAllItems();

        if (Object.keys(inventory).length === 0) {
            console.log("📦 El inventario está vacío.");
            return;
        }

        console.log("📦 Contenido del inventario:");
        Object.entries(inventory).forEach(([id, itemData]) => {
            if (allItems[id]) {
                console.log(`🔸 ${allItems[id].name}: ${itemData.quantity}x ${itemData.equipped ? "(Equipado)" : ""}`);
            } else {
                console.log(`🔸 ${id}: ${itemData.quantity}x [ÍTEM NO RECONOCIDO]`);
            }
        });
    };

    // Comando para equipar un item
    window.equipItem = function (itemId) {
        const inventory = gameState.inventory;
        const itemData = inventory.getItemData(itemId);

        if (!itemData) {
            console.error(`El item "${itemId}" no está en tu inventario o no existe.`);
            return false;
        }

        inventory.updateItem(itemId, { equipped: true });
        console.log(`✅ Equipado: ${itemData.name}`);
        return true;
    };

    // Comando para ver detalles de un item
    window.itemDetails = function (itemId) {
        const allItems = ItemsDatabase.getAllItems();
        if (allItems[itemId]) {
            console.log("📃 Detalles del item:");
            console.log(allItems[itemId]);
            return allItems[itemId];
        } else {
            console.error(`El item "${itemId}" no existe en la base de datos.`);
            return null;
        }
    };
}
