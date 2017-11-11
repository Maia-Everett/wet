export default class ReputationGain {
	/**
	 * 
	 * @param {string} faction 
	 * @param {number} canonicalName 
	 * @param {number} gain
	 */
	constructor(faction, canonicalName, gain) {
		this.faction = faction;
		this.canonicalName = canonicalName;
		this.gain = gain;
	}

	/**
	 * @return {string}
	 */
	getLink() {
		if (this.canonicalName == null) {
			return "[[" + this.faction + "]]";
		} else {
			return "[[" + this.canonicalName + "|" + this.faction + "]]";
		}
	}

	/**
	 * @return {string}
	 */
	getFullText() {
		return "+" + this.gain + " reputation with " + this.getLink();
	}

	/**
	 * @return {string}
	 */
	toString() {
		return "+" + this.gain + " " + this.getLink();
	}
}
