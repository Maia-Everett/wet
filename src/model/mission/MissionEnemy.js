export default class MissionEnemy {
	/**
	 * 
	 * @param {string} name 
	 * @param {Array.<string>} counters 
	 */
	constructor(name, counters) {
		this.name = name;
		this.counters = counters.slice();
	}

	toString() {
		return this.name + " " + this.counters;
	}
}
