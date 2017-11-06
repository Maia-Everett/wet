import { $, $$ } from "../common/shortcuts";

export default class QuestParser {
	constructor(context) {
		this.context = context;
	}

	parse() {
		return "Quest";
	}
}
