import { $, $$ } from "./common/shortcuts";
import u from "./parsers/utils";

import ParserContext from "./parsers/ParserContext";
import QuestParser from "./parsers/QuestParser";
import MissionParser from "./parsers/MissionParser";
import NPCParser from "./parsers/NPCParser";

class Parsers {
	constructor(context) {
		this.quest = new QuestParser(context);
		this.mission = new MissionParser(context);
		this.npc = new NPCParser(context);
	}

	format() {
		let url = $("link[rel=canonical]").getAttribute("href");
		
		if (!url) {
			return null;
		}

		let articleType = u.getRegexGroup(url, /\/([a-z-]+)=[0-9]+\//, 1);
		let parser = this[articleType];

		if (!parser) {
			return null;
		}

		let parseResult = parser.parse();

		// Format
		let context = {};
		context[parser.templatePrefix] = parseResult;
		return parser.template(context);
	}
};

export default {
	create: function() {
		return ParserContext.create().then(context => {
			return new Parsers(context);
		});
	}
}