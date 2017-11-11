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
}
