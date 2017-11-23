export default class ItemReward {
	/**
	 * 
	 * @param {string} name 
	 * @param {number} quantity 
	 * @param {number} index 
	 */
	constructor(name, quantity, index) {
		this.name = name;
		this.quantity = quantity;
		this.index = index;
	}

	/**
	 * @return {string}
	 */
	toString() {
		if (this.quantity == null) {
			return this.name;
		}
		
		return this.name + " (" + this.quantity + ")";
	}
}
