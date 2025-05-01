import ItemsDatabase from "../data/items/ItemsDatabase.js";

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
        // Mostrar el inventario en HTML
        const inventoryDiv = document.getElementById("inventory-container");
        inventoryDiv.classList.remove("hidden");

        // Configurar la imagen del jugador y el evento para mostrar atributos
        const playerBox = document.querySelector(".inventory-equipment #inventory-equipment-box-player");
        playerBox.querySelector("img").src = this.player.img;
        playerBox.addEventListener("click", () => this.showAttributes());

        // Llenar el inventario con los datos del jugador
        this.populateInventory();

        // Detectar la tecla I para cerrar el inventario
        this.input.keyboard.on("keydown-I", () => {
            inventoryDiv.classList.add("hidden");
            this.scene.resume("GameScene");
            this.scene.stop("InventoryScene");
        });
    }

    /**
     * Llena el inventario con los ítems del jugador
     */
    populateInventory() {
        const inventoryItemsContainer = document.querySelector(".inventory-items ul");
        inventoryItemsContainer.innerHTML = ""; // Limpiar el inventario

        // Separar los ítems equipados y no equipados
        const equippedItems = [];
        const unequippedItems = [];

        // Ahora accedemos al inventario a través del método getInventory()
        const playerInventory = this.player.inventory.getInventory();

        Object.keys(playerInventory).forEach((key) => {
            const item = this.player.getItemData(key);
            if (item.equipped) {
                equippedItems.push({ key, item });
            } else {
                unequippedItems.push({ key, item });
            }
        });

        // Mostrar primero los ítems equipados
        this.renderItemsList(equippedItems, inventoryItemsContainer, true);
        this.renderItemsList(unequippedItems, inventoryItemsContainer, false);

        // Actualizar la visualización del equipo
        this.updateEquipmentDisplay();
    }

    /**
     * Renderiza una lista de ítems en el contenedor HTML
     */
    renderItemsList(items, container, isEquipped) {
        items.forEach(({ key, item }) => {
            const li = document.createElement("li");

            li.innerHTML = `
                <img src="${item.image}" alt="${key}">
                <p class='inventory-items-Name'>${item.name}</p>
                ${item.equipped ? "<span>&#9876;</span>" : ""}
                <p class='inventory-items-Quantity'>X${item.quantity}</p>
            `;

            // Añadir la clase de equipado si corresponde
            if (isEquipped) {
                li.classList.add("inventory-items-equipped");
            }

            // Eventos
            li.addEventListener("click", () => this.showItemDetails(item, key));
            li.addEventListener("dblclick", () => this.toggleEquipItem(key));

            container.appendChild(li);
        });
    }

    /**
     * Muestra los detalles de un ítem seleccionado
     */
    showItemDetails(item, key) {
        const statsContainer = document.querySelector(".inventory-stats");

        let extraInfo = "";
        if (item.category === "weapon" && item.twoHanded) {
            extraInfo = `<li id="inventory-stats-item-two-handed"><p>Arma a dos manos</p></li>`;
        }

        statsContainer.innerHTML = `
            <div id="inventory-stats-item-img">
                <img src="${item.image}" alt="${key}">
            </div>
            <ul id="inventory-stats-item">
                <li id="inventory-stats-item-name">
                    <h3>${item.name}</h3>
                </li>
                <li id="inventory-stats-item-descripcion">
                    <p>Descripción: ${item.description}</p>
                </li>
                <li id="inventory-stats-item-type">
                    <p>Tipo: ${item.category}</p>
                </li>
                <li id="inventory-stats-item-utility">
                    <p>${this.getItemUtilityText(item)}</p>
                </li>
                ${extraInfo}
            </ul>`;
    }

    /**
     * Obtiene el texto de utilidad de un ítem según su tipo
     */
    getItemUtilityText(item) {
        if (item.damage) {
            return `Daño: +${item.damage}`;
        } else if (item.defense) {
            return `Armadura: +${item.defense}`;
        } else if (item.blockChance) {
            return `Bloqueo: ${item.blockChance}%`;
        } else {
            return `Efecto: ${item.effect || "N/A"}`;
        }
    }

    /**
     * Muestra los atributos del jugador
     */
    showAttributes() {
        const statsContainer = document.querySelector(".inventory-stats");

        statsContainer.innerHTML = `
            <ul id="inventory-stats-player">
                <li id="inventory-stats-player-health">
                    <p>Vida:</p>
                    <p class="p-stats">${this.player.health}</p>
                </li>
                <li id="inventory-stats-player-strength">
                    <p>Fuerza:</p>
                    <p class="p-stats">${this.player.strength}</p>
                </li>
                <li id="inventory-stats-player-energy">
                    <p>Energia:</p>
                    <p class="p-stats">${this.player.energy}</p>
                </li>
                <li id="inventory-stats-player-speed">
                    <p>Velocidad:</p>
                    <p class="p-stats">${this.player.speed}</p>
                </li>
                <li id="inventory-stats-player-souls">
                    <p>Almas:</p>
                    <p class="p-stats">${this.player.souls}</p>
                </li>
            </ul>`;
    }

    /**
     * Actualiza la visualización del equipo en la interfaz
     */
    updateEquipmentDisplay() {
        // Primero, resetear todas las ranuras de equipo a imagen vacía
        this.resetEquipmentSlots();

        // Luego actualizar las ranuras con los ítems equipados
        const playerInventory = this.player.inventory.getInventory();

        Object.keys(playerInventory).forEach((key) => {
            const itemData = playerInventory[key];
            const item = this.player.getItemData(key);

            if (!itemData.equipped) return;

            if (item.category === "accessory") {
                this.updateAccessorySlot(key, item, itemData);
            } else {
                this.updateRegularEquipmentSlot(key, item);
            }
        });
    }

    /**
     * Reinicia todas las ranuras de equipo a la imagen vacía
     */
    resetEquipmentSlots() {
        const slots = ["weapon", "shield", "helmet", "chest", "glove", "shoes", "accessory1", "accessory2"];
        slots.forEach((slotId) => {
            const imgElement = document.querySelector(`#inventory-equipment-box #${slotId} img`);
            if (imgElement) {
                imgElement.src = "./assets/imagenPruebaNada.png";
                imgElement.alt = "No equipado";

                // Eliminar eventos antiguos clonando y reemplazando el elemento
                const newImg = imgElement.cloneNode(true);
                imgElement.parentNode.replaceChild(newImg, imgElement);
            }
        });
    }

    /**
     * Actualiza una ranura de accesorio
     */
    updateAccessorySlot(key, item, itemData) {
        if (itemData.accessory1) {
            this.setEquipmentSlotImage("accessory1", key, item);
        }

        if (itemData.accessory2) {
            this.setEquipmentSlotImage("accessory2", key, item);
        }
    }

    /**
     * Actualiza una ranura de equipo regular (no accesorio)
     */
    updateRegularEquipmentSlot(key, item) {
        this.setEquipmentSlotImage(item.category, key, item);
    }

    /**
     * Configura la imagen y eventos para una ranura de equipo
     */
    setEquipmentSlotImage(slotId, key, item) {
        const imgElement = document.querySelector(`#inventory-equipment-box #${slotId} img`);
        if (imgElement) {
            imgElement.src = item.image;
            imgElement.alt = key;

            // Clonar y reemplazar para eliminar eventos antiguos
            const newImg = imgElement.cloneNode(true);
            imgElement.parentNode.replaceChild(newImg, imgElement);

            // Añadir nuevos eventos
            newImg.addEventListener("click", () => this.showItemDetails(item, key));

            if (slotId.startsWith("accessory")) {
                const accessoryNum = slotId.endsWith("1") ? 1 : 2;
                newImg.addEventListener("dblclick", () => this.removeEquipItem(key, accessoryNum));
            } else {
                newImg.addEventListener("dblclick", () => this.removeEquipItem(key));
            }
        }
    }

    /**
     * Equipa o desequipa un ítem
     */
    toggleEquipItem(key) {
        const item = this.player.getItemData(key);
        const itemData = this.player.inventory.getInventory()[key];

        // Si el ítem no existe o no hay cantidad, salir
        if (!item || itemData.quantity <= 0) return;

        // Si no está equipado, intentar equiparlo
        if (!itemData.equipped) {
            this.equipItem(key, item, itemData);
        } else {
            this.removeEquipItem(key);
        }

        // Actualizar la interfaz
        this.populateInventory();
    }

    /**
     * Equipa un ítem
     */
    equipItem(key, item, itemData) {
        if (item.category === "accessory") {
            this.equipAccessory(key, itemData);
        } else {
            this.equipRegularItem(key, item, itemData);
        }
    }

    /**
     * Equipa un accesorio
     */
    equipAccessory(key, itemData) {
        // Contar accesorios equipados
        const equippedAccessories = Object.keys(this.player.inventory.getInventory()).filter(
            (itemId) =>
                this.player.inventory.getInventory()[itemId].equipped &&
                this.player.getItemData(itemId).category === "accessory"
        );

        if (equippedAccessories.length < 2) {
            // Si hay espacio, equipar en la primera ranura disponible
            itemData.equipped = true;

            if (!Object.values(this.player.inventory.getInventory()).some((item) => item.accessory1)) {
                itemData.accessory1 = true;
            } else {
                itemData.accessory2 = true;
            }
        } else {
            // Si no hay espacio, mostrar modal para reemplazar
            this.showAccessoryReplaceModal(key);
        }
    }

    /**
     * Muestra el modal para reemplazar accesorios
     */
    showAccessoryReplaceModal(key) {
        const modal = document.getElementById("accessoryModal");
        modal.style.display = "flex";

        const self = this;

        document.getElementById("replaceAccessory1").onclick = () => {
            self.replaceAccessory(key, 1);
            modal.style.display = "none";
        };

        document.getElementById("replaceAccessory2").onclick = () => {
            self.replaceAccessory(key, 2);
            modal.style.display = "none";
        };

        document.getElementById("cancelModal").onclick = () => {
            modal.style.display = "none";
        };
    }

    /**
     * Reemplaza un accesorio en la ranura especificada
     */
    replaceAccessory(newItemKey, slotNum) {
        // Buscar el accesorio que está en la ranura especificada
        const accessoryToReplace = Object.keys(this.player.inventory.getInventory()).find((key) => {
            const item = this.player.inventory.getInventory()[key];
            return item.equipped && ((slotNum === 1 && item.accessory1) || (slotNum === 2 && item.accessory2));
        });

        if (accessoryToReplace) {
            const oldAccessory = this.player.inventory.getInventory()[accessoryToReplace];
            if (slotNum === 1) oldAccessory.accessory1 = false;
            if (slotNum === 2) oldAccessory.accessory2 = false;

            // Si no tiene ninguna ranura ocupada, marcar como no equipado
            if (!oldAccessory.accessory1 && !oldAccessory.accessory2) {
                oldAccessory.equipped = false;
            }
        }

        // Equipar el nuevo accesorio
        const newAccessory = this.player.inventory.getInventory()[newItemKey];
        newAccessory.equipped = true;
        if (slotNum === 1) newAccessory.accessory1 = true;
        if (slotNum === 2) newAccessory.accessory2 = true;

        this.populateInventory();
    }

    /**
     * Equipa un ítem regular (no accesorio)
     */
    equipRegularItem(key, item, itemData) {
        // Casos especiales para armas y escudos (pueden ser combinados)
        if (item.category === "weapon" || item.category === "shield") {
            // Si es un escudo, verificar si hay un arma a dos manos equipada
            if (item.category === "shield") {
                const equippedWeapon = this.findEquippedItemByCategory("weapon");
                if (equippedWeapon && this.player.getItemData(equippedWeapon).twoHanded) {
                    // Desequipar el arma a dos manos si estamos equipando un escudo
                    this.player.inventory.getInventory()[equippedWeapon].equipped = false;
                }
            }
            // Si es un arma a dos manos, desequipar escudo si hay uno equipado
            else if (item.twoHanded) {
                const equippedShield = this.findEquippedItemByCategory("shield");
                if (equippedShield) {
                    this.player.inventory.getInventory()[equippedShield].equipped = false;
                }
            }

            // Desequipar solo ítems de la misma categoría
            const playerInventory = this.player.inventory.getInventory();
            Object.keys(playerInventory).forEach((itemId) => {
                const currentItem = this.player.getItemData(itemId);
                if (currentItem.category === item.category && playerInventory[itemId].equipped) {
                    playerInventory[itemId].equipped = false;
                }
            });
        } else {
            // Para el resto de categorías, comportamiento normal
            const playerInventory = this.player.inventory.getInventory();
            Object.keys(playerInventory).forEach((itemId) => {
                const currentItem = this.player.getItemData(itemId);
                if (currentItem.category === item.category && playerInventory[itemId].equipped) {
                    playerInventory[itemId].equipped = false;
                }
            });
        }

        // Equipar el nuevo ítem
        itemData.equipped = true;
    }

    /**
     * Encuentra un ítem equipado por categoría
     */
    findEquippedItemByCategory(category) {
        const playerInventory = this.player.inventory.getInventory();
        return Object.keys(playerInventory).find((itemId) => {
            const item = this.player.getItemData(itemId);
            return item.category === category && playerInventory[itemId].equipped;
        });
    }

    /**
     * Quita un equipo
     */
    removeEquipItem(key, accessorySlot = 0) {
        const itemData = this.player.inventory.getInventory()[key];

        if (!itemData || !itemData.equipped) return;

        const item = this.player.getItemData(key);

        if (item.category === "accessory") {
            if (accessorySlot === 1) {
                itemData.accessory1 = false;
            } else if (accessorySlot === 2) {
                itemData.accessory2 = false;
            } else {
                // Si no se especifica ranura, quitar de ambas
                itemData.accessory1 = false;
                itemData.accessory2 = false;
            }

            // Si no está en ninguna ranura, marcar como no equipado
            if (!itemData.accessory1 && !itemData.accessory2) {
                itemData.equipped = false;
            }
        } else {
            itemData.equipped = false;
        }

        this.populateInventory();
    }
}
