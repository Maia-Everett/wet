package org.lucidfox.questfiller.model.mission;

public final class NavalMission extends Mission {
	@Override
	public String getInfoboxTemplate() {
		return "Navalbox";
	}

	@Override
	public String getResourceName() {
		return "Oil";
	}
}
