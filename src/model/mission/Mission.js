export default class Mission {
	constructor() {
		 this.enemies = [];
		 this.bonusItems = [];
	}

	hasRewards() {
		return this.bonusItems.length > 0 || this.hasNonItemRewards();
	}
	
	hasNonItemRewards() {
		return !!this.bonusXP || !!this.bonusMoney || !!this.bonusResources;
	}

	getFollowerXPStr() {
		if (!this.followerXP) {
			return null;
		}
		
		return new Intl.NumberFormat("en-US").format(this.followerXP);
	}

	getBonusXPStr() {
		if (!bonusXP) {
			return null;
		}
		
		return new Intl.NumberFormat("en-US").format(this.bonusXP);
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
