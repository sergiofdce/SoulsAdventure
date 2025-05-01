import ItemsDatabase from "./ItemsDatabase.js";

export default class Inventory {
    constructor(inventoryData = null) {
        // Si se proporciona data de inventario, usarla; de lo contrario, crear un inventario predeterminado
        this.data = inventoryData || {
            items: {
                "espada-oscura": {
                    quantity: 1,
                    twoHanded: false,
                    equipped: false,
                },
                "escudo-anillos-cristal": {
                    quantity: 2,
                    equipped: false,
                },
                "casco-metal": {
                    quantity: 1,
                    equipped: true,
                },
                "pechera-hierro": {
                    quantity: 1,
                    equipped: true,
                },
                "guantes-magicos": {
                    quantity: 1,
                    twoHanded: false,
                    equipped: true,
                },
                "zapatos-montana": {
                    quantity: 1,
                    equipped: true,
                },
                "espada-muy-larga": {
                    quantity: 1,
                    twoHanded: false,
                    equipped: true,
                },
                "escudo-metal": {
                    quantity: 1,
                    equipped: true,
                },
                "anillo-oro": {
                    quantity: 1,
                    accessory1: false,
                    accessory2: true,
                    equipped: true,
                },
                "anillo-legendario": {
                    quantity: 1,
                    accessory1: true,
                    accessory2: false,
                    equipped: true,
                },
                "anillo-mitico": {
                    quantity: 1,
                    accessory1: false,
                    accessory2: false,
                    equipped: false,
                },
                "anillo-ceremonial": {
                    quantity: 1,
                    accessory1: false,
                    accessory2: false,
                    equipped: false,
                },
            },
        };
    }

    // Método para obtener información completa de un item
    getItemData(itemId) {
        if (!this.data.items[itemId]) {
            return null;
        }

        // Combinamos los datos del JSON con los datos específicos del jugador
        return {
            ...ItemsDatabase.getAllItems()[itemId], // Datos generales del JSON (nombre, descripción, etc.)
            ...this.data.items[itemId], // Datos específicos del jugador (cantidad, equipado)
        };
    }

    // Inventario - Agregar un ítem
    addItem(itemId, quantity = 1) {
        const allItems = ItemsDatabase.getAllItems();
        if (allItems[itemId]) {
            if (this.data.items[itemId]) {
                this.data.items[itemId].quantity += quantity;
            } else {
                this.data.items[itemId] = {
                    quantity: quantity,
                    equipped: false,
                    twoHanded: allItems[itemId].category === "weapon" ? false : undefined,
                };
            }
            return true;
        }
        return false;
    }

    // Inventario - Eliminar ítem
    deleteItem(itemId) {
        if (this.data.items[itemId]) {
            this.data.items[itemId].quantity -= 1;

            // Si la cantidad llega a 0 y está equipado, lo desequipamos
            if (this.data.items[itemId].quantity >= 0 && this.data.items[itemId].equipped) {
                this.data.items[itemId].equipped = false;
            }
        }
    }

    // Retorna el inventario completo
    getInventory() {
        return this.data.items;
    }

    // Exporta el inventario como JSON para guardarlo
    exportToJSON() {
        return JSON.stringify(this.data);
    }

    // Importa el inventario desde un JSON
    importFromJSON(jsonData) {
        try {
            const parsedData = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
            this.data = parsedData;
            return true;
        } catch (error) {
            console.error("Error al importar el inventario desde JSON:", error);
            return false;
        }
    }

    // Método para actualizar directamente un elemento del inventario
    updateItem(itemId, properties) {
        if (this.data.items[itemId]) {
            this.data.items[itemId] = {
                ...this.data.items[itemId],
                ...properties,
            };
            return true;
        }
        return false;
    }
}
