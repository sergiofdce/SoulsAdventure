import ItemsDatabase from "./ItemsDatabase.js";

export default class Inventory {
    constructor(inventoryData = null) {
        this.data = inventoryData || {
            // Inventario con ítems iniciales
            items: {
                "espada-larga": {
                    quantity: 1,
                    equipped: false,
                },
                "casco-cuero": {
                    quantity: 1,
                    equipped: false,
                },
                "pechera-cuero": {
                    quantity: 1,
                    equipped: false,
                },
                "guantes-cuero": {
                    quantity: 1,
                    equipped: false,
                },
                "botas-cuero": {
                    quantity: 1,
                    equipped: false,
                },
                "pocion-salud": {
                    quantity: 1,
                    equipped: false,
                },
            },
        };

        // Referencia al jugador (se establecerá cuando se inicialice el inventario)
        this.player = null;
    }

    // Nuevo método para establecer la referencia al jugador
    setPlayer(player) {
        this.player = player;
    }

    // Nuevo método para equipar un ítem
    equipItem(itemId) {
        const allItems = ItemsDatabase.getAllItems();
        const item = allItems[itemId];

        if (!item || !this.data.items[itemId] || this.data.items[itemId].quantity <= 0) {
            return false;
        }

        // Si el ítem ya está equipado, no hacemos nada
        if (this.data.items[itemId].equipped) {
            return true;
        }

        // Desequipar otros ítems del mismo tipo si es necesario
        if (item.category === "weapon") {
            this.unequipItemsByCategory("weapon");

            // Actualizar daño del jugador
            if (this.player) {
                this.player.damage = item.damage || 0;
            }
        } else if (item.category === "shield") {
            this.unequipItemsByCategory("shield");

            // Actualizar defensa del jugador
            if (this.player) {
                this.player.defense += item.defense || 0;
            }
        } else if (item.slotType) {
            // Para armaduras, desequipamos el slot específico (helmet, chest, etc)
            this.unequipItemsBySlot(item.slotType);

            // Actualizar defensa del jugador
            if (this.player) {
                this.player.defense += item.defense || 0;
            }
        }

        // Equipar el nuevo ítem
        this.data.items[itemId].equipped = true;
        return true;
    }

    // Nuevo método para desequipar un ítem
    unequipItem(itemId) {
        const allItems = ItemsDatabase.getAllItems();
        const item = allItems[itemId];

        if (!item || !this.data.items[itemId] || !this.data.items[itemId].equipped) {
            return false;
        }

        // Quitar stats del jugador
        if (this.player) {
            if (item.category === "weapon") {
                this.player.damage = 0; // Volver al daño base
            } else if (item.category === "shield" || item.slotType) {
                this.player.defense -= item.defense || 0;
            }
        }

        // Desequipar el ítem
        this.data.items[itemId].equipped = false;
        return true;
    }

    // Método auxiliar para desequipar ítems por categoría
    unequipItemsByCategory(category) {
        const allItems = ItemsDatabase.getAllItems();

        for (const itemId in this.data.items) {
            if (this.data.items[itemId].equipped && allItems[itemId].category === category) {
                this.unequipItem(itemId);
            }
        }
    }

    // Método auxiliar para desequipar ítems por slot
    unequipItemsBySlot(slotType) {
        const allItems = ItemsDatabase.getAllItems();

        for (const itemId in this.data.items) {
            if (this.data.items[itemId].equipped && allItems[itemId].slotType === slotType) {
                this.unequipItem(itemId);
            }
        }
    }

    // Método para recalcular todos los stats basados en equipamiento
    recalculatePlayerStats() {
        if (!this.player) return;

        // Resetear stats - daño es 0 (solo contará equipamiento), defensa es 0
        this.player.damage = 0;
        this.player.defense = 0;

        const allItems = ItemsDatabase.getAllItems();

        // Recorrer todos los ítems equipados
        for (const itemId in this.data.items) {
            if (this.data.items[itemId].equipped) {
                const item = allItems[itemId];

                if (item.category === "weapon") {
                    this.player.damage += item.damage || 0;
                } else if (item.category === "shield") {
                    this.player.defense += item.defense || 0;
                } else if (["helmet", "chest", "glove", "shoes"].includes(item.category)) {
                    // Verificar si el ítem es una armadura por su categoría
                    this.player.defense += item.defense || 0;
                }
            }
        }
    }

    // Reiniciar todos los objetos del inventario
    clearInventory() {
        this.data = {
            items: {
                "espada-larga": {
                    quantity: 1,
                    equipped: false,
                },
                "casco-cuero": {
                    quantity: 1,
                    equipped: false,
                },
                "pechera-cuero": {
                    quantity: 1,
                    equipped: false,
                },
                "guantes-cuero": {
                    quantity: 1,
                    equipped: false,
                },
                "botas-cuero": {
                    quantity: 1,
                    equipped: false,
                },
                "pocion-salud": {
                    quantity: 1,
                    equipped: false,
                },
            },
        };

        // Recalcular estadísticas del jugador después de limpiar
        this.recalculatePlayerStats();

        console.log("Inventario reiniciado completamente");
        return true;
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

    // Método para listar todos los items disponibles en el juego
    listAvailableItems() {
        const allItems = ItemsDatabase.getAllItems();
        return Object.keys(allItems);
    }

    // Método para mostrar información detallada de un item
    showItemDetails(itemId) {
        const allItems = ItemsDatabase.getAllItems();
        return allItems[itemId] || null;
    }
}
