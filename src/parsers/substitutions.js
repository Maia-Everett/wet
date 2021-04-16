let patches = {
	"4.0.3": "4.0.3a",
	"6.0.1": "6.0.2",
	"7.0.1": "7.0.3",
};

let reputations = {
	"7th Legion": "7th Legion (faction)",
	"Stormwind": "Stormwind (faction)",
	"Ironforge": "Ironforge (faction)",
	"Darnassus": "Darnassus (faction)",
	"Exodar": "Exodar (faction)",
	"Gnomeregan": "Gnomeregan (faction)",
	"Gilneas": "Gilneas (faction)",
	"Orgrimmar": "Orgrimmar (faction)",
	"Thunder Bluff": "Thunder Bluff (faction)",
	"Undercity": "Undercity (faction)",
	"Silvermoon": "Silvermoon (faction)",
	"Zandalari Empire": "Zandalari Empire (faction)",
	"Bilgewater Cartel": "Bilgewater Cartel (faction)",
};

export default {
	getCanonicalPatchVersion : function(patch) {
		return patches[patch] || patch;
	},

	getCanonicalReputationFaction : function(repFaction) {
		return reputations[repFaction] || repFaction;
	}
};
