export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "InventoryScene" });
        this.player = null;
        this.selectedItem = null;
        // Nuevo: Agregar un temporizador para el delay
        this.attributesTimer = null;
    }

    init(data) {
        this.player = data.player;
    }

    create() {
        // Ocultar HUD
        document.getElementById("hud-container").classList.add("hidden");

        // Mostrar el inventario en HTML
        const inventoryDiv = document.getElementById("inventory-container");
        inventoryDiv.classList.remove("hidden");

        // Configurar el contenedor para el juego Phaser del jugador
        this.setupPlayerAnimationGame();

        // Llenar el inventario con los datos del jugador
        this.populateInventory();

        // Mostrar los atributos del jugador inicialmente sin delay
        this.showAttributes(false);

        // Detectar la tecla I
        this.input.keyboard.on("keydown-I", () => {
            // Cerrar Inventario
            inventoryDiv.classList.add("hidden");
            // Mostrar HUD
            document.getElementById("hud-container").classList.remove("hidden");
            // Limpiar el juego Phaser del jugador si existe
            if (this.playerAnimGame) {
                this.playerAnimGame.destroy(true);
            }
            this.scene.resume("GameScene");
            this.scene.stop("InventoryScene");
        });
    }

    /**
     * Configura el sistema de animaciones para el jugador en el inventario
     */
    setupPlayerAnimationGame() {
        const animContainer = document.querySelector(".inventory-equipment #inventory-equipment-box-player");

        // Limpiar cualquier contenido previo
        while (animContainer.firstChild) {
            animContainer.removeChild(animContainer.firstChild);
        }

        // Crear un div para el nuevo juego Phaser
        const animDiv = document.createElement("div");
        animDiv.id = "inventory-player-anim-game";
        animDiv.style.width = "100%";
        animDiv.style.height = "100%";

        // Configurar estilos para que ocupe todo el espacio disponible
        animDiv.style.display = "flex";
        animDiv.style.justifyContent = "center";
        animDiv.style.alignItems = "center";

        animContainer.appendChild(animDiv);

        // Obtener las dimensiones actuales del contenedor
        const containerWidth = animContainer.clientWidth || 100;
        const containerHeight = animContainer.clientHeight || 100;

        // Configuración del nuevo juego Phaser
        const animConfig = {
            type: Phaser.AUTO,
            width: containerWidth,
            height: containerHeight,
            transparent: true,
            parent: "inventory-player-anim-game",
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            scene: {
                preload: function () {
                    this.load.spritesheet("player-inventory", this.game.mainScene.player.spritesheet, {
                        frameWidth: 96,
                        frameHeight: 96,
                    });
                },
                create: function () {
                    // Referencia a la escena principal (para acceder desde métodos)
                    this.mainScene = this.game.mainScene;

                    // Crear manualmente las animaciones para este contexto específico
                    this.anims.create({
                        key: "idle",
                        frames: this.anims.generateFrameNumbers("player-inventory", { start: 0, end: 5 }),
                        frameRate: 10,
                        repeat: -1,
                        repeatDelay: 5000,
                    });

                    // Ajustar el sprite al centro de la escala actual
                    this.playerSprite = this.add.sprite(
                        this.cameras.main.width / 2,
                        this.cameras.main.height / 2,
                        "player-inventory"
                    );

                    // Hacer el sprite considerablemente más grande
                    this.playerSprite.setScale(3);

                    // Reproducir animación por defecto
                    this.playerSprite.play("idle");

                    // Ya no necesitamos el evento pointerover porque ahora siempre se mostrarán los atributos
                    // Mantener el sprite interactivo para posible funcionalidad futura
                    this.playerSprite.setInteractive();
                },
            },
        };

        // Iniciar el juego secundario para la animación
        this.playerAnimGame = new Phaser.Game(animConfig);

        // Guardar referencia para poder acceder desde los métodos de la escena
        this.playerAnimGame.mainScene = this;

        // Agregar un listener para redimensionar el juego si cambia el tamaño del contenedor
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === animContainer && this.playerAnimGame) {
                    this.playerAnimGame.scale.resize(entry.contentRect.width, entry.contentRect.height);
                }
            }
        });

        // Observar cambios en el contenedor
        resizeObserver.observe(animContainer);
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

        // Mostrar los atributos del jugador después de actualizar el inventario
        this.showAttributes();
    }

    /**
     * Renderiza una lista de ítems en el contenedor HTML
     */
    renderItemsList(items, container, isEquipped) {
        items.forEach(({ key, item }) => {
            const li = document.createElement("li");

            // Ocultar cantidad si solo hay 1 unidad
            const quantityDisplay =
                item.quantity > 1 ? `<p class='inventory-items-Quantity'>X${item.quantity}</p>` : "";

            li.innerHTML = `
                <img src="${item.image}" alt="${key}">
                <p class='inventory-items-Name'>${item.name}</p>
                ${quantityDisplay}
            `;

            // Añadir la clase de equipado si corresponde
            if (isEquipped) {
                li.classList.add("inventory-items-equipped");
            }

            // Eventos - mouseenter para mostrar detalles y click para equipar
            li.addEventListener("mouseenter", () => {
                // Cancelar cualquier temporizador pendiente
                this.clearAttributesTimer();
                this.showItemDetails(item, key);
            });

            // Añadir evento mouseleave para volver a mostrar los atributos con delay
            li.addEventListener("mouseleave", () => {
                // Establecer un temporizador para mostrar los atributos después de 1.5 segundos
                this.scheduleAttributesDisplay();
            });

            // Cambiado de dblclick a click para equipar/desequipar
            li.addEventListener("click", () => this.toggleEquipItem(key));

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
                    <p>${item.description}</p>
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


    showAttributes(useDelay = true) {
        // Si se requiere delay y no estamos ya dentro de un callback de temporizador
        if (useDelay && !this.attributesTimer) {
            this.scheduleAttributesDisplay();
            return;
        }

        // Resetear el temporizador si existe
        this.clearAttributesTimer();

        // Asegurar que el contenedor de estadísticas tenga scroll cuando sea necesario
        const statsContainer = document.querySelector(".inventory-stats");

        // Forzar recálculo de estadísticas para asegurar valores actualizados
        this.player.inventory.recalculatePlayerStats();

        // Asegurarse de que los valores nunca sean undefined
        const strength = this.player.strength || 0;
        const weaponDamage = this.player.damage || 0;
        const totalDamage = strength + weaponDamage;

        const resistance = this.player.resistance || 0;
        const defense = this.player.defense || 0;
        const totalResistance = resistance + defense;
        
        // Crear contenido usando grid para mejor organización
        statsContainer.innerHTML = `
            <div id="inventory-stats-player" class="stats-grid">

            <div class="stats-label">Fuerza:</div>
            <div class="stats-value">${strength} + (${weaponDamage}) = ${totalDamage}</div>
            
            <div class="stats-label">Resistencia:</div>
            <div class="stats-value">${resistance} + (${defense}) = ${totalResistance}</div>
            `;
    }

    /**
     * Programa la visualización de atributos después de un delay
     */
    scheduleAttributesDisplay() {
        // Cancelar cualquier temporizador existente para evitar múltiples llamadas
        this.clearAttributesTimer();

        // Crear un nuevo temporizador para mostrar atributos después de 1.5 segundos
        this.attributesTimer = setTimeout(() => {
            this.showAttributes();
        }, 250);
    }

    /**
     * Cancelar temporizador pendiente
     */
    clearAttributesTimer() {
        if (this.attributesTimer) {
            clearTimeout(this.attributesTimer);
            this.attributesTimer = null;
        }
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
                imgElement.src = "./assets/items/placeholder.png";
                imgElement.alt = "Slot vacío";

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

            // Añadir nuevos eventos - mouseenter para mostrar detalles
            newImg.addEventListener("mouseenter", () => {
                // Cancelar cualquier temporizador pendiente
                this.clearAttributesTimer();
                this.showItemDetails(item, key);
            });

            // Añadir evento mouseleave para volver a mostrar los atributos con delay
            newImg.addEventListener("mouseleave", () => {
                // Establecer un temporizador para mostrar los atributos después de 1.5 segundos
                this.scheduleAttributesDisplay();
            });

            // Cambiado de dblclick a click para desequipar
            if (slotId.startsWith("accessory")) {
                const accessoryNum = slotId.endsWith("1") ? 1 : 2;
                newImg.addEventListener("click", () => this.removeEquipItem(key, accessoryNum));
            } else {
                newImg.addEventListener("click", () => this.removeEquipItem(key));
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

        // Recalcular estadísticas del jugador
        this.player.inventory.recalculatePlayerStats();

        // Actualizar la interfaz
        this.populateInventory();

        // Mostrar atributos inmediatamente después de equipar/desequipar
        this.showAttributes(false);
    }

    /**
     * Equipa un ítem
     */
    equipItem(key, item, itemData) {
        // No permitir equipar consumibles
        if (item.category === "consumable") {
            return;
        }

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

        // Recalcular estadísticas del jugador
        this.player.inventory.recalculatePlayerStats();

        this.populateInventory();

        // Mostrar atributos inmediatamente después de desequipar
        this.showAttributes(false);
    }

    // Asegurar que limpiamos el temporizador cuando se cierre la escena
    shutdown() {
        this.clearAttributesTimer();
    }
}
