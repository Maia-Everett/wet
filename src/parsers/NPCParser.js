import { $, $$ } from "../common/shortcuts";

export default class NPCParser {
	constructor(context) {
		this.context = context;
	}

	parse() {
		return "NPC";
	}
}
