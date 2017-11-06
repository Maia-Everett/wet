import { $, $$ } from "../common/shortcuts";

export default class MissionParser {
	constructor(context) {
		this.context = context;
	}

	parse() {
		return "Mission";
	}
}
