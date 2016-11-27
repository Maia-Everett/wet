package org.lucidfox.questfiller.model.mission;

public final class ClassHallMission extends Mission {
	@Override
	public String getInfoboxTemplate() {
		return "MissionLegionbox";
	}

	@Override
	public String getResourceName() {
		return "Order Resources";
	}
}
