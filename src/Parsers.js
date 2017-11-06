import { $, $$ } from "./common/shortcuts";
import u from "./common/utils";
import ParserContext from "./parsers/ParserContext";
import QuestParser from "./parsers/QuestParser";
import MissionParser from "./parsers/MissionParser";
import NPCParser from "./parsers/NPCParser";

class Parsers {
	constructor(context) {
		this.quest = {
			name: "Quest",
			templatePrefix: "q",
			parser: new QuestParser(context)
		};

		this.mission = {
			name: "Quest",
			templatePrefix: "m",
			parser: new MissionParser(context)
		};

		this.npc = {
			name: "NPC",
			templatePrefix: "n",
			parser: new NPCParser(context)
		};
	}

	format() {
		let url = $("link[rel=canonical]").getAttribute("href");
		
		if (!url) {
			return null;
		}

		let articleType = u.getRegexGroup(url, /\/([a-z-]+)=[0-9]+\//, 1);
		let parserType = this[articleType];

		if (!parserType) {
			return null;
		}

		let parseResult = parserType.parser.parse();
		return parseResult;
	}
};

export default {
	create: function() {
		return ParserContext.create().then(context => {
			return new Parsers(context);
		});
	}
}