export default class SoldItem {
	/**
	 * 
	 * @param {string} name 
	 * @param {number} price 
	 */
	constructor(name, price) {
		this.name = name;
		this.price = price || 0;
	}

	getGold() {
		return Math.floor(this.price / 10000) || "";
	}

	getSilver() {
		return (Math.floor(this.price / 100) % 100) || "";
	}

	getCopper() {
		return (this.price % 100) || "";
	}

	/**
	 * 
	 * @param {SoldItem} other 
	 */
	compareTo(other) {
		return this.name.localeCompare(other.name);
	}
}
