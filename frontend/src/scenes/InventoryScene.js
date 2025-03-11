import itemsData from "../items/data/itemsData.js";

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "InventoryScene" });
        this.player = null;
        this.selectedItem = null;
    }

    init(data) {
        this.player = data.player;
    }

    create() {
        // Mostrar el HTML del inventario
        document.getElementById("inventory-container").classList.remove("hidden");

        this.displayPlayerInventory();

        // Tecla para cerrar el inventario
        this.input.keyboard.on("keydown-I", () => {
            document.getElementById("inventory-container").classList.add("hidden");
            this.scene.stop("InventoryScene");
            this.scene.resume("GameScene");
        });
    }

    displayPlayerInventory() {
        if (!this.player) return;

        // Obtener el contenedor de items del inventario
        const inventoryItemsContainer = document.getElementById("inventory-items");
        inventoryItemsContainer.innerHTML = ""; // Limpiar contenido anterior

        // Crear lista para los items
        const itemsList = document.createElement("ul");
        itemsList.className = "inventory-list";

        // Crear elementos HTML para cada ítem en el inventario del jugador
        for (const [itemId, playerItemData] of Object.entries(this.player.inventory.items)) {
            if (playerItemData.quantity > 0) {
                // Obtener la información completa del item (JSON + datos del jugador)
                const itemData = itemsData[itemId];
                if (!itemData) continue; // Si no existe en el JSON, lo saltamos

                const itemElement = document.createElement("li");
                itemElement.className = "inventory-item";
                itemElement.setAttribute("data-item-id", itemId);

                // Contenedor para la imagen
                const imageContainer = document.createElement("div");
                imageContainer.className = "item-image-container";

                // Si tiene imagen en el JSON, la usamos
                if (itemData.image && itemData.image !== "/") {
                    const itemImage = document.createElement("img");
                    itemImage.src = itemData.image;
                    itemImage.className = "item-image";
                    imageContainer.appendChild(itemImage);
                } else {
                    // Si no, mostramos el placeholder
                    const imagePlaceholder = document.createElement("div");
                    imagePlaceholder.className = "item-image-placeholder";
                    imagePlaceholder.textContent = "Imagen";
                    imageContainer.appendChild(imagePlaceholder);
                }

                // Contenedor para los detalles del item
                const detailsContainer = document.createElement("div");
                detailsContainer.className = "item-details";

                // Nombre del item desde el JSON
                const itemName = document.createElement("div");
                itemName.className = "item-name";
                itemName.textContent = itemData.name;

                // Descripción del item desde el JSON
                const itemDescription = document.createElement("div");
                itemDescription.className = "item-description";
                itemDescription.textContent = itemData.description || "Sin descripción";

                // Cantidad del item desde el inventario del jugador
                const itemQuantity = document.createElement("div");
                itemQuantity.className = "item-quantity";
                itemQuantity.textContent = `x${playerItemData.quantity}`;

                // Agregar elementos al contenedor de detalles
                detailsContainer.appendChild(itemName);
                detailsContainer.appendChild(itemDescription);
                detailsContainer.appendChild(itemQuantity);

                // Agregar contenedores al elemento de lista
                itemElement.appendChild(imageContainer);
                itemElement.appendChild(detailsContainer);

                // Agregar evento de click para equipar
                itemElement.addEventListener("dblclick", () => {
                    this.checkEquippedItem(itemId);
                });

                // Agregar evento de click para mostrar detalles
                itemElement.addEventListener("click", () => {
                    this.showItemDetails(itemId);
                });

                // Agregar el elemento a la lista
                itemsList.appendChild(itemElement);
            }
        }

        // Agregar la lista al contenedor de items
        inventoryItemsContainer.appendChild(itemsList);

        // Mostrar estadísticas del personaje
        this.displayCharacterStats();
    }

    checkEquippedItem(itemId) {
        const playerItemData = this.player.inventory.items[itemId];
        const jsonItemData = itemsData[itemId];
        const selectedItem = document.querySelector(`.inventory-item[data-item-id="${itemId}"]`);

        if (playerItemData && jsonItemData) {
            // Estilo visual
            playerItemData.equipped = !playerItemData.equipped;
            selectedItem.style.borderColor = playerItemData.equipped ? "gold" : "rgba(255, 255, 255, 0.4)";

            // Comprobar si tiene arma equipada
            if (jsonItemData.category === "weapon") {
                const hasAnotherWeapon = Object.entries(this.player.inventory.items).some(
                    ([otherItemId, otherItemData]) =>
                        otherItemId !== itemId &&
                        otherItemData.equipped &&
                        itemsData[otherItemId]?.category === "weapon"
                );

                if (hasAnotherWeapon) {
                    Object.entries(this.player.inventory.items).forEach(([otherItemId, otherItemData]) => {
                        if (
                            otherItemId !== itemId &&
                            otherItemData.equipped &&
                            itemsData[otherItemId]?.category === "weapon"
                        ) {
                            otherItemData.equipped = false;
                            const weaponElement = document.querySelector(
                                `.inventory-item[data-item-id="${otherItemId}"]`
                            );
                            if (weaponElement) {
                                weaponElement.style.borderColor = "rgba(255, 255, 255, 0.4)";
                            }
                        }
                    });
                }

                // Verificar si hay escudo equipado para determinar si es a dos manos
                const hasShieldEquipped = Object.entries(this.player.inventory.items).some(
                    ([shieldId, shieldData]) => shieldData.equipped && itemsData[shieldId]?.category === "shield"
                );

                playerItemData.twoHanded = !hasShieldEquipped;
            }

            // Comprobar si tiene escudo equipado
            if (jsonItemData.category === "shield") {
                if (playerItemData.equipped) {
                    // Si equipo escudo, arma a 1 mano
                    Object.entries(this.player.inventory.items).forEach(([weaponId, weaponData]) => {
                        if (weaponData.equipped && itemsData[weaponId]?.category === "weapon") {
                            weaponData.twoHanded = false;
                        }
                    });
                } else {
                    // Si me quito escudo, arma a 2 manos
                    Object.entries(this.player.inventory.items).forEach(([weaponId, weaponData]) => {
                        if (weaponData.equipped && itemsData[weaponId]?.category === "weapon") {
                            weaponData.twoHanded = true;
                        }
                    });
                }
            }

            this.showItemDetails(itemId);
            this.displayCharacterStats();
        }
    }

    showItemDetails(itemId) {
        if (!this.player || !this.player.inventory.items[itemId]) return;

        const playerItemData = this.player.inventory.items[itemId];
        const jsonItemData = itemsData[itemId];

        if (!jsonItemData) return;

        // Mostrar detalles combinando datos del JSON y datos específicos del jugador
        const detailsContainer = document.getElementById("item-details");

        detailsContainer.innerHTML = `
            <h3>${jsonItemData.name}</h3>
            <p>Cantidad: ${playerItemData.quantity}</p>
            <p>Descripción: ${jsonItemData.description || "Sin descripción"}</p>
            <p>Categoría: ${jsonItemData.category}</p>
            ${
                jsonItemData.category === "weapon" && playerItemData.equipped
                    ? `<p>Uso: ${playerItemData.twoHanded ? "A dos manos" : "A una mano"}</p>`
                    : ""
            }
        `;

        this.selectedItem = itemId;
    }

    displayCharacterStats() {
        if (!this.player) return;

        const statsContainer = document.getElementById("character-stats");

        // Armas equipadas
        const equippedWeapons = Object.entries(this.player.inventory.items)
            .filter(([itemId, playerItemData]) => playerItemData.equipped && itemsData[itemId]?.category === "weapon")
            .map(([itemId, playerItemData]) => {
                const weaponName = itemsData[itemId].name;
                let equipTypeText = playerItemData.twoHanded ? "2 manos" : "1 mano";
                return `${weaponName} (${equipTypeText})`;
            })
            .join(", ");

        // Escudos equipados
        const equippedShields = Object.entries(this.player.inventory.items)
            .filter(([itemId, playerItemData]) => playerItemData.equipped && itemsData[itemId]?.category === "shield")
            .map(([itemId]) => itemsData[itemId].name)
            .join(", ");

        statsContainer.innerHTML = `
            <div>Salud: ${this.player.health}</div>
            <div>Fuerza: ${this.player.strength}</div>
            <div>Energía: ${this.player.energy}</div>
            <div>Velocidad: ${this.player.speed}</div>
            <div>Almas: ${this.player.souls}</div>
            <div>Arma: ${equippedWeapons || "Ninguna"}</div>
            <div>Escudo: ${equippedShields || "Ninguno"}</div>
        `;
    }
}
