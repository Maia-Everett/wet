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

	getExperienceStr() {
		return new Intl.NumberFormat("en-US").format(this.experience);
	}
}
