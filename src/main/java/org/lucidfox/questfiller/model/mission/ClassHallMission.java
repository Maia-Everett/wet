package org.lucidfox.questfiller.model.mission;

public final class ClassHallMission extends Mission {
	@Override
	public String getInfoboxTemplate() {
		// TODO: It probably needs its own template
		return "Missionbox";
	}

	@Override
	public String getResourceName() {
		return "Order Resources";
	}
}
