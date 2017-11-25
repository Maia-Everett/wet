import Mission from "./Mission";

export default class GarrisonMission extends Mission {
	getInfoboxTemplate() {
		return "Missionbox";
	}

	getResourceName() {
		return "Garrison Resources";
	}
}
