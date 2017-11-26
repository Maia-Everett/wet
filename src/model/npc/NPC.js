const MAX_ITEMBOX_ITEMS = 30;

/**
 * 
 * @param {Array.<any>} array 
 * @param {function} condition 
 */
function anyMatch(array, condition) {
	for (let element of array) {
		if (condition(element)) {
			return true;
		}
	}

	return false;
}

export default class NPC {
	constructor() {
		this.quests = [];
		this.quotes = [];
		this.itemsSold = [];
	}
	
	isQuestGiver() {
		return anyMatch(this.quests, q => q.starts);
	}
	
	isQuestEnder() {
		return anyMatch(this.quests, q => q.finishes);
	}
	
	getFaction() {
		if (this.allianceReaction == null && this.hordeReaction == null) {
			return null;
		} else if (this.allianceReaction === "Friendly" && this.hordeReaction !== "Friendly") {
			return "Alliance";
		} else if (this.allianceReaction !== "Friendly" && this.hordeReaction === "Friendly") {
			return "Horde";
		} else if (this.allianceReaction === "Hostile" && this.hordeReaction === "Hostile") {
			return "Combat";
		} else if (this.allianceReaction === "Neutral" && this.hordeReaction === "Neutral") {
			return "Combat";
		} else {
			return "Neutral";
		}
	}
	
	getHealthStr() {
		return new Intl.NumberFormat("en-US").format(this.health);
	}
	
	getManaStr() {
		return mana == null ? null : new Intl.NumberFormat("en-US").format(this.mana);
	}

	isUseItembox() {
		return this.itemsSold.length <= MAX_ITEMBOX_ITEMS;
	}
	
	isRaceStartsWithVowel() {
		return this.race && this.race.length && "AEIOU".includes(this.race.charAt(0));
	}

	getGold() {
		return Math.floor(this.money / 10000) || "";
	}

	getSilver() {
		return (Math.floor(this.money / 100) % 100) || "";
	}

	getCopper() {
		return (this.money % 100) || "";
	}
}
