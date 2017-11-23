export default class NPCQuest {
	/**
	 * 
	 * @param {string} name 
	 * @param {boolean} starts 
	 * @param {boolean} finishes 
	 */
	constructor(name, starts, finishes) {
		this.name = name;
		this.starts = starts;
		this.finishes = finishes;
	}

	/**
	 * 
	 * @param {NPCQuest} other 
	 */
	compareTo(other) {
		return this.name.localeCompare(other.name);
	}
}
