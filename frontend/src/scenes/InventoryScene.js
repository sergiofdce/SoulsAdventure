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

        document.querySelector(".inventory-equipment #inventory-equipment-box-player img").src = this.player.img;
        document.querySelector(".inventory-equipment #inventory-equipment-box-player").addEventListener("click", () => this.showAttributes());

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
    
        // Separar los ítems equipados y no equipados
        const equippedItems = [];
        const unequippedItems = [];
    
        Object.keys(this.player.inventory.items).forEach((key) => {
            const item = this.player.getItemData(key);
            if (item.equipped) {
                equippedItems.push({ key, item });
            } else {
                unequippedItems.push({ key, item });
            }
        });
    
        // Recorrer los ítems equipados
        equippedItems.forEach(({ key, item }) => {
            const li = document.createElement("li");
    
            // Agregar el evento de doble clic
            li.addEventListener("dblclick", () => this.toggleEquipItem(key));
    
            // Mostrar el ítem
            li.innerHTML = `
                <img src="${item.image}" alt="${key}">
                <p class='inventory-items-Name'>${item.name}</p>
                ${item.equipped ? "<span>&#9876;</span>" : ""}
                <p class='inventory-items-Quantity'>X${item.quantity}</p>
            `;
    
            // Evento para mostrar detalles del ítem al hacer clic
            li.addEventListener("click", () => this.showItemDetails(item, key));

            li.classList.add("inventory-items-equipped");
    
            inventoryItemsContainer.appendChild(li);
        });

        // Recorrer los ítems del inventario
        unequippedItems.forEach(({ key, item }) => {
            const li = document.createElement("li");
    
            // Agregar el evento de doble clic
            li.addEventListener("dblclick", () => this.toggleEquipItem(key));
    
            // Mostrar el ítem
            li.innerHTML = `
                <img src="${item.image}" alt="${key}">
                <p class='inventory-items-Name'>${item.name}</p>
                ${item.equipped ? "<span>&#9876;</span>" : ""}
                <p class='inventory-items-Quantity'>X${item.quantity}</p>
            `;
    
            // Evento para mostrar detalles del ítem al hacer clic
            li.addEventListener("click", () => this.showItemDetails(item, key));
    
            inventoryItemsContainer.appendChild(li);
        });
    
        this.showEquipment();
    };    

    showItemDetails(item, key) {
        document.querySelector(".inventory-stats").innerHTML = `<div id="inventory-stats-item-img">
                        <img src="" alt="">
                    </div>
                    <ul id="inventory-stats-item">
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
        document.querySelector("#inventory-stats-item-name h3").textContent = item.name;
        document.querySelector("#inventory-stats-item-descripcion p").textContent = `Descripción: ${item.description}`;
        document.querySelector("#inventory-stats-item-type p").textContent = `Tipo: ${item.category}`;
        if (item.damage){
            document.querySelector("#inventory-stats-item-utility p").textContent = `Daño: +${item.damage}`;
        } else if (item.defense){
            document.querySelector("#inventory-stats-item-utility p").textContent = `Armadura: +${item.defense}`;
        } else {
            document.querySelector("#inventory-stats-item-utility p").textContent = `Efecto: ${item.effect || 'N/A'}`;
        }
    };

    showAttributes() {
        // attributes = this.player.attributes;

        document.querySelector(".inventory-stats").innerHTML = `
                    <ul id="inventory-stats-player">
                        <li id="inventory-stats-player-health">
                            <p>Vida:</p>
                            <p class="p-stats"></p>
                        </li>
                        <li id="inventory-stats-player-strength">
                            <p>Fuerza:</p>
                            <p class="p-stats"></p>
                        </li>
                        <li id="inventory-stats-player-energy">
                            <p>Energia:</p>
                            <p class="p-stats"></p>
                        </li>
                        <li id="inventory-stats-player-speed">
                            <p>Velocidad:</p>
                            <p class="p-stats"></p>
                        </li>
                        <li id="inventory-stats-player-souls">
                            <p>Almas:</p>
                            <p class="p-stats"></p>
                        </li>
                    </ul>`;
        document.querySelector("#inventory-stats-player-health p.p-stats").textContent = `${this.player.health}`;
        document.querySelector("#inventory-stats-player-strength p.p-stats").textContent = `${this.player.strength}`;
        document.querySelector("#inventory-stats-player-energy p.p-stats").textContent = `${this.player.energy}`;
        document.querySelector("#inventory-stats-player-speed p.p-stats").textContent = `${this.player.speed}`;
        document.querySelector("#inventory-stats-player-souls p.p-stats").textContent = `${this.player.souls}`;
    };

    showEquipment() {

        console.log("----------------------------")

        Object.keys(this.player.inventory.items).forEach((key) => {
            const item = this.player.getItemData(key); // Obtener el item de ese key
            const imgElement = document.querySelector(`#inventory-equipment-box #${item.category} img`);
            const imgElementAccessory1 = document.querySelector(`#inventory-equipment-box #${item.category}1 img`);
            const imgElementAccessory2 = document.querySelector(`#inventory-equipment-box #${item.category}2 img`);

            // Solo actualizar los elementos si el ítem está equipado
            if (item.equipped) {
                if (imgElement) {

                    console.log(`Actualizando imagen de: ${item.name} en ${item.category}`);

                    imgElement.src = item.image;
                    imgElement.alt = key;
    
                    // Limpiar los eventos anteriores antes de agregar nuevos
                    imgElement.removeEventListener("click", this.showItemDetails);
                    imgElement.removeEventListener("dblclick", this.removeEquipItem);
    
                    // Añadir evento de clic para mostrar detalles
                    imgElement.addEventListener("click", () => this.showItemDetails(item, key));
    
                    // Añadir evento de doble clic para desequipar
                    imgElement.addEventListener("dblclick", () => this.removeEquipItem(key));
                }
    
                if (item.accessory1) {
                    imgElementAccessory1.src = item.image;
                    imgElementAccessory1.alt = key;
    
                    // Limpiar los eventos anteriores antes de agregar nuevos
                    imgElementAccessory1.removeEventListener("click", this.showItemDetails);
                    imgElementAccessory1.removeEventListener("dblclick", this.removeEquipItem);
    
                    // Añadir evento de clic para mostrar detalles
                    imgElementAccessory1.addEventListener("click", () => this.showItemDetails(item, key));
    
                    // Añadir evento de doble clic para desequipar
                    imgElementAccessory1.addEventListener("dblclick", () => this.removeEquipItem(key,1));
                }
    
                if (item.accessory2) {
                    imgElementAccessory2.src = item.image;
                    imgElementAccessory2.alt = key;
    
                    // Limpiar los eventos anteriores antes de agregar nuevos
                    imgElementAccessory2.removeEventListener("click", this.showItemDetails);
                    imgElementAccessory2.removeEventListener("dblclick", this.removeEquipItem);
    
                    // Añadir evento de clic para mostrar detalles
                    imgElementAccessory2.addEventListener("click", () => this.showItemDetails(item, key));
    
                    // Añadir evento de doble clic para desequipar
                    imgElementAccessory2.addEventListener("dblclick", () => this.removeEquipItem(key,2));
                }
            }
        });
    };
    

    // Equipa arma
    toggleEquipItem(key) {
        // Filtra los objetos actualmente equipados que pertenecen a la misma categoría del objeto seleccionado
        const equippedItemsData = Object.keys(this.player.inventory.items)
            .filter(itemId => 
                this.player.inventory.items[itemId].equipped && // Verifica si está equipado
                this.player.getItemData(itemId).category === this.player.getItemData(key).category // Compara la categoría
            )
            .map(itemId => ({
                key: itemId,
                data: this.player.getItemData(itemId) // Guarda el ID y los datos del objeto equipado
            }));
    
        // Obtiene los datos del objeto que se quiere equipar/desequipar
        const equippedItemIdData = this.player.inventory.items[key];
    
        // Verifica que el objeto seleccionado exista en el inventario
        if (this.player.getItemData(key)) {
            // Verifica que no sea un accesorio
            if (this.player.getItemData(key).category !== "accessory"){
                // Verifica que el objeto tenga al menos una unidad y que aún no esté equipado
                if (equippedItemIdData.quantity > 0 && !equippedItemIdData.equipped) {
                    // Si hay otro objeto de la misma categoría ya equipado, lo desequipa
                    if (equippedItemsData.length > 0) {
                        this.player.inventory.items[equippedItemsData[0].key].equipped = false;
                        equippedItemIdData.equipped = true; 
                    } else {
                        equippedItemIdData.equipped = true;
                    }
                }
            // si es una accesorio
            } else {
                // Verifica que el objeto tenga al menos una unidad
                if (equippedItemIdData.quantity > 0){
                    // Si hay otro objeto de la misma categoría ya equipado, lo desequipa
                    console.log("Numero de objetos: "+equippedItemsData.length)
                    if (equippedItemsData.length > 0 ) {
                        if (equippedItemsData[0].key == key && equippedItemIdData.quantity > 1){
                            if (!this.player.inventory.items[equippedItemsData[0].key].accessory1 && this.player.inventory.items[equippedItemsData[0].key].accessory2){

                                this.player.inventory.items[equippedItemsData[0].key].accessory1 = false;
    
                                equippedItemIdData.accessory1 = true; 
                                equippedItemIdData.equipped = true; 
    
                            } else if (this.player.inventory.items[equippedItemsData[0].key].accessory1 && !this.player.inventory.items[equippedItemsData[0].key].accessory2){
    
                                this.player.inventory.items[equippedItemsData[0].key].accessory2 = false; 
    
                                equippedItemIdData.accessory2 = true; 
                                equippedItemIdData.equipped = true;
    
                            }

                        } else if (equippedItemsData[0].key !== key){
                            if (!this.player.inventory.items[equippedItemsData[0].key].accessory1 && this.player.inventory.items[equippedItemsData[0].key].accessory2){

                                this.player.inventory.items[equippedItemsData[0].key].accessory1 = false;
    
                                equippedItemIdData.accessory1 = true; 
                                equippedItemIdData.equipped = true; 
    
                            } else if (this.player.inventory.items[equippedItemsData[0].key].accessory1 && !this.player.inventory.items[equippedItemsData[0].key].accessory2){
    
                                this.player.inventory.items[equippedItemsData[0].key].accessory2 = false; 
    
                                equippedItemIdData.accessory2 = true; 
                                equippedItemIdData.equipped = true;
    
                            } else if (this.player.inventory.items[equippedItemsData[0].key].accessory1 && 
                                this.player.inventory.items[equippedItemsData[0].key].accessory2) {
                       
                                const modal = document.getElementById("accessoryModal");
                                modal.style.display = "flex";
                            
                                const self = this; // Guardamos `this` en `self`
                            
                                function closeModal() {
                                    modal.style.display = "none";
                                    self.populateInventory(); // Ahora `self` apunta a la clase del juego
                                }
                            
                                document.getElementById("replaceAccessory1").onclick = () => {
                                    self.player.inventory.items[equippedItemsData[0].key].accessory1 = false;
                                    equippedItemIdData.accessory1 = true;
                                    equippedItemIdData.equipped = true;
                                    closeModal();
                                };
                            
                                document.getElementById("replaceAccessory2").onclick = () => {
                                    self.player.inventory.items[equippedItemsData[0].key].accessory2 = false;
                                    equippedItemIdData.accessory2 = true;
                                    equippedItemIdData.equipped = true;
                                    closeModal();
                                };
                            
                                document.getElementById("cancelModal").onclick = () => {
                                    closeModal();
                                };
                            }
                       
                        }
                        if (!this.player.inventory.items[equippedItemsData[0].key].accessory1 && !this.player.inventory.items[equippedItemsData[0].key].accessory2){
                            this.player.inventory.items[equippedItemsData[0].key].equipped = false;
                        }
                    } else {
                        equippedItemIdData.accessory1 = true; 
                        equippedItemIdData.equipped = true; 
                    }
                }
            }
        }
    
        // Actualiza la interfaz del inventario después de equipar o desequipar
        this.populateInventory();
    }
    
    
    // Quitar equipo
    removeEquipItem(key, number = 0) {
        const equippedItemIdData = this.player.inventory.items[key];
    
        // Verifica que el objeto existe, tiene cantidad mayor a 0 y está equipado
        if (equippedItemIdData && equippedItemIdData.quantity > 0 && equippedItemIdData.equipped) {
            
            // Si el objeto NO es un accesorio
            if (this.player.getItemData(key).category !== "accessory") {
                equippedItemIdData.equipped = false;
    
                // Obtener la categoría del objeto
                const category = this.player.getItemData(key).category;
                const imgElement = document.querySelector(`#inventory-equipment-box #${category} img`);

                // Clonar el nodo de la imagen para eliminar todos los eventos previos asociados
                const newImgElement = imgElement.cloneNode(true);
                imgElement.parentNode.replaceChild(newImgElement, imgElement);

                // Cambiar la imagen a una imagen vacía (sin objeto equipado)
                newImgElement.src = "./assets/imagenPruebaNada.png";
                newImgElement.alt = `${category} no equipado`;

            } else { 
                // Si el objeto ES un accesorio
                const category = this.player.getItemData(key).category;
    
                // Seleccionar las imágenes de los accesorios
                const imgElementAccessory1 = document.querySelector(`#inventory-equipment-box #${category}1 img`);
                const imgElementAccessory2 = document.querySelector(`#inventory-equipment-box #${category}2 img`);
    
                // Si se pasa el número 1, significa que se está eliminando el accesorio 1
                if (number === 1 && imgElementAccessory1) {
                    equippedItemIdData.accessory1 = false;
    
                    // Clonar y reemplazar el nodo para eliminar eventos
                    const newImgElement1 = imgElementAccessory1.cloneNode(true);
                    imgElementAccessory1.parentNode.replaceChild(newImgElement1, imgElementAccessory1);
    
                    // Cambiar la imagen a una imagen vacía
                    newImgElement1.src = "./assets/imagenPruebaNada.png";
                    newImgElement1.alt = `${category} no equipado`;
    
                // Si se pasa el número 2, significa que se está eliminando el accesorio 2
                } else if (number === 2 && imgElementAccessory2) {
                    equippedItemIdData.accessory2 = false;
    
                    // Clonar y reemplazar el nodo para eliminar eventos
                    const newImgElement2 = imgElementAccessory2.cloneNode(true);
                    imgElementAccessory2.parentNode.replaceChild(newImgElement2, imgElementAccessory2);
    
                    // Cambiar la imagen a una imagen vacía
                    newImgElement2.src = "./assets/imagenPruebaNada.png";
                    newImgElement2.alt = `${category} no equipado`;
                }
    
                // Si ambos accesorios han sido eliminados, marcar el objeto como no equipado
                if (!equippedItemIdData.accessory1 && !equippedItemIdData.accessory2) {
                    equippedItemIdData.equipped = false;
                }
            }
        }
    
        // Actualiza la interfaz del inventario después de desequipar el objeto
        this.populateInventory();
    }
    
 
};