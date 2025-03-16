import itemsData from "../items/data/itemsData.js";

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "InventoryScene" });
        this.player = null;
        this.selectedItem = null;
    };

    init(data) {
        this.player = data.player;
    };

    create() {
        // Mostrar el inventario en HTML
        const inventoryDiv = document.getElementById("inventory");
        inventoryDiv.style.display = "flex";

        // Llenar el inventario con los datos del jugador
        this.populateInventory();

        // Detectar la tecla I para cerrar el inventario
        this.input.keyboard.on("keydown-I", () => {
            inventoryDiv.style.display = "none";
            this.scene.resume("GameScene");
            this.scene.stop("InventoryScene");
        });
    };

    populateInventory() {
        const inventoryItemsContainer = document.querySelector(".inventory-items ul");

        // Limpiar el inventario antes de llenarlo
        inventoryItemsContainer.innerHTML = "";

        // Convertir los ítems del objeto en un array y recorrerlos
        Object.keys(this.player.inventory.items).forEach((key) => {
            const item = this.player.inventory.items[key]; // Obtener el objeto del ítem
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${item.image}" alt="${key}">
                <p>${key.replace(/-/g, " ")}</p>
                <span>&#9876;</span>
                <p>X${item.quantity}</p>
            `;

            // Evento para mostrar detalles del ítem al hacer clic
            li.addEventListener("click", () => this.showItemDetails(item, key));

            inventoryItemsContainer.appendChild(li);

        });

        this.showEquipment();
    };

    showItemDetails(item, key) {
        document.querySelector(".inventory-stats-item").innerHTML = `<div id="inventory-stats-item-img">
                        <img src="" alt="">
                    </div>
                    <ul>
                        <li id="inventory-stats-item-name">
                            <h3></h3>
                        </li>
                        <li id="inventory-stats-item-descripcion">
                            <p></p>
                        </li>
                        <li id="inventory-stats-item-type">
                            <p></p>
                        </li>
                        <li id="inventory-stats-item-utility">
                            <p></p>
                        </li>
                    </ul>`;
        document.querySelector("#inventory-stats-item-img img").src = item.image;
        document.querySelector("#inventory-stats-item-img img").alt = key;

        if (item.name) {
            document.querySelector("#inventory-stats-item-name h3").textContent = item.name;
        } else {
            document.querySelector("#inventory-stats-item-name h3").textContent = key.replace(/-/g, " ");
        }

        document.querySelector("#inventory-stats-item-descripcion p").textContent = `Descripción: ${item.description}`;
        document.querySelector("#inventory-stats-item-type p").textContent = `Tipo: ${item.type}`;
        if (item.type == "sword"){
            document.querySelector("#inventory-stats-item-utility p").textContent = `Daño: +${item.damage}`;
        } else if (item.type == "shield"){
            document.querySelector("#inventory-stats-item-utility p").textContent = `Armadura: +${item.defense}`;
        } else {
            document.querySelector("#inventory-stats-item-utility p").textContent = `Efecto: ${item.effect || 'N/A'}`;
        }
    };

    showEquipment() {
        const equipment = this.player.equipment; // Asegúrate de acceder correctamente a equipment

        for (const slot in equipment) {
            const item = equipment[slot]; // Obtener el item de ese slot
            const imgElement = document.querySelector(`#inventory-equipment-box #${slot} img`);

            if (imgElement) {
                imgElement.src = item.image;
                imgElement.alt = item.name;

                // Remover cualquier evento anterior para evitar duplicaciones
                imgElement.replaceWith(imgElement.cloneNode(true));
                
                // Añadir evento de clic para mostrar detalles
                document.querySelector(`#inventory-equipment-box #${slot}`).addEventListener("click", () => this.showItemDetails(item, slot));
            }
        }


        // for (const slot in equipment) {
        //     const item = equipment[slot];
        //     const imgElement = document.querySelector(`#inventory-equipment-box #${slot} img`);
        //     if (imgElement) {
        //         imgElement.src = item.image;
        //         imgElement.alt = item.name;
        //     }
        // }
    };
};