function arrayToDict(array, dict) {
	dict = dict || {};
	array.forEach(element => dict[element[0]] = element[1]);
	return dict;
}

class ParserContext {
	constructor(localeData) {
		this.questCategories = {};

		localeData.mn_quests.forEach(element => {
			let sublist = element[3];
			
			if (Array.isArray(sublist)) {
				sublist.forEach(subelement => {
					// category ID and name
					this.questCategories[subelement[0]] = subelement[1];
				});
			}
		});

		this.missionMechanics = {
			"1": "Wild Aggression",
			"2": "Massive Strike",
			"3": "Group Damage",
			"4": "Magic Debuff",
			"6": "Danger Zones",
			"7": "Minion Swarms",
			"8": "Powerful Spell",
			"9": "Deadly Minions",
			"10": "Timed Battle",
		};

		this.races = arrayToDict(localeData.mn_races);
		this.classes = arrayToDict(localeData.mn_classes);

		// This has to be hardcoded for now :(
		this.legionMissionMechanics = {
			"474": "Broken Gear",
			"471": "Cursed",
			"472": "Disorienting",
			"762": "Dungeon",
			"760": "Elite",
			"473": "Head Wound",
			"475": "Heroic",
			"437": "Lethal",
			"476": "Mythic",
			"761": "Placeholder",
			"436": "Powerful",
			"482": "Powerful",
			"763": "Raid",
			"428": "Slowing",
		};
	}
}

export default {
	create: function() {
		return new Promise((resolve, reject) => {
			// Hack: inject script to pass Wowhead localization data from window into content script
			function onMessage(e) {
				if (e.source === window && e.data.questFillerTag) {
					window.removeEventListener("message", onMessage);
					resolve(new ParserContext(e.data));
				}
			}

			window.addEventListener("message", onMessage);

			var script = document.createElement("script");
			script.text = `
				window.postMessage({
					questFillerTag: "questFillerTag",
					mn_quests: window.mn_quests,
					mn_races: window.mn_races,
					mn_classes: window.mn_classes
				}, "*");
			`;
			document.head.appendChild(script);
		});
	}
};
