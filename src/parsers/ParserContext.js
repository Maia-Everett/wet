function arrayToDict(array, dict) {
	dict = dict || {};
	array.forEach(element => dict[element[0]] = element[1]);
	return dict;
}

class ParserContext {
	constructor(jsFile) {
		let ctx = {};
		new Function("g_staticUrl", jsFile + `
			this.mn_quests = mn_quests;
			this.LANG = LANG;
		`).call(ctx, window.g_staticUrl);

		this.questCategories = {};

		ctx.mn_quests.forEach(element => {
			let sublist = element[3];
			
			if (Array.isArray(sublist)) {
				sublist.forEach(subelement => {
					// category ID and name
					this.questCategories[subelement[0]] = subelement[1];
				});
			}
		});

		this.missionMechanics = arrayToDict(ctx.LANG.fidropdowns.missionMechanics);
		arrayToDict(ctx.LANG.fidropdowns.missionThreats, this.missionMechanics);
		this.races = arrayToDict(ctx.LANG.fidropdowns.race);
		this.classes = arrayToDict(ctx.LANG.fidropdowns.classs);

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
		return fetch("http://wow.zamimg.com/js/enus.js")
				.then(response => response.text())
				.then(jsFile => new ParserContext(jsFile))
				.catch(error => console.log(error));
	}
};
