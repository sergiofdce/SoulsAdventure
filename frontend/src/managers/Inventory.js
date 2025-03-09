export default class Inventory {
    // constructor(maxSize = 10) {
    //   this.items = [];
    //   this.maxSize = maxSize;
    // }

    addItem(item) {
      if (this.items.length < this.maxSize) {
        this.items.push(item);
        console.log(`Added item: ${item.name} to inventory.`);
      } else {
        console.log("Inventory is full.");
      }
    }

    removeItem(item) {
      const index = this.items.indexOf(item);
      if (index !== -1) {
        this.items.splice(index, 1);
        console.log(`Removed item: ${item.name} from inventory.`);
      } else {
        console.log("Item not found in inventory.");
      }
    }

    listItems() {
      console.log("Items in inventory:");
      this.items.forEach((item, index) => {
        console.log(`${index + 1}: ${item.name} - ${item.description}`);
      });
    }
}
  