import Mission from "./Mission";

export default class ClassHallMission extends Mission {
	getInfoboxTemplate() {
		return "MissionLegionbox";
	}

	getResourceName() {
		return "Order Resources";
	}
}
