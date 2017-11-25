import Mission from "./Mission";

export default class NavalMission extends Mission {
	getInfoboxTemplate() {
		return "Navalbox";
	}

	getResourceName() {
		return "Oil";
	}
}
