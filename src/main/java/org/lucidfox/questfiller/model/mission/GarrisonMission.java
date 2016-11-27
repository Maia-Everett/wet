package org.lucidfox.questfiller.model.mission;

public final class GarrisonMission extends Mission {
	@Override
	public String getInfoboxTemplate() {
		return "Missionbox";
	}

	@Override
	public String getResourceName() {
		return "Garrison Resources";
	}
}
