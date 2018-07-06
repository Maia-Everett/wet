import ItemReward from "../core/ItemReward";

export default class Quest {
	constructor() {
		this.stages = [];
		this.providedItems = [];

		this.choiceRewards = [];
		this.nonChoiceRewards = [];
		this.abilityRewards = [];
		this.buffRewards = [];

		this.reputationGains = [];
		this.otherGains = [];

		this.previousQuests = [];
		this.nextQuests = [];
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
	
	hasItemRewards() {
		return this.choiceRewards.length > 0 || this.nonChoiceRewards.length > 0;
	}
	
	getAllNonChoiceRewards() {
		let result = this.nonChoiceRewards.slice();
		
		// These are not actually item rewards, but the formatter will behave as if they're items with unknown quantity
		function insertReward(reward) {
			result.push(new ItemReward(reward, null, result.length + 1));
		}

		this.abilityRewards.forEach(insertReward);
		this.buffRewards.forEach(insertReward);
		return result;
	}
	
	hasChoiceAbilityOrBuffRewards() {
		return this.choiceRewards.length > 0 || this.abilityRewards.length > 0 || this.buffRewards.length > 0;
	}
	
	hasItemAbilityOrBuffRewards() {
		return this.hasItemRewards() || this.abilityRewards.length > 0 || this.buffRewards.length > 0;
	}
	
	hasGains() {
		return !!this.money || !!this.experience || this.reputationGains.length > 0 || this.otherGains.length > 0;
	}
	
	hasRewards() {
		return this.hasItemAbilityOrBuffRewards() || this.hasGains();
	}

	getExperienceStr() {
		return new Intl.NumberFormat("en-US").format(this.experience);
	}
}
