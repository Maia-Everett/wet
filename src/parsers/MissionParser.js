import { $, $$ } from "../common/shortcuts";
import u from "./utils";
import substitutions from "./substitutions";

import missionEJS from "../templates/mission.ejs";

import Mission from "../model/mission/Mission";
import GarrisonMission from "../model/mission/GarrisonMission";
import NavalMission from "../model/mission/NavalMission";
import ClassHallMission from "../model/mission/ClassHallMission";

// Magic numbers from breadcrumb bar
const MISSION_SYSTEM_GARRISONS = 21;
const MISSION_SYSTEM_CLASS_HALLS = 30;
const MISSION_UNIT_FOLLOWERS = 1;
const MISSION_UNIT_SHIPS = 2;

/**
 * @param {ParserContext} context 
 */
export default function MissionParser(context) {
	this.context = context;
	this.templatePrefix = "m";
	this.template = missionEJS;

	/**
	 * @return {Mission}
	 */
	this.parse = function() {
		let mission = createMissionOfCorrectType();
		return mission;
	}

	function createMissionOfCorrectType() {
		let categoryIds = u.getCategoryIds();
		
		if (categoryIds[1] === MISSION_SYSTEM_CLASS_HALLS) {
			return new ClassHallMission();
		}

		switch (categoryIds[3]) {
		case MISSION_UNIT_FOLLOWERS:
			return new GarrisonMission();
		case MISSION_UNIT_SHIPS:
			return new NavalMission();
		default:
			throw new Error();
		}
	}
}
