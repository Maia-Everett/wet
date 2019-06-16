import Mission from "./Mission";

export default class BFAMission extends Mission {
	getInfoboxTemplate() {
		return "MissionBFAbox";
	}

	getResourceName() {
		return "War Resources";
	}
}
