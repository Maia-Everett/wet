package org.lucidfox.questfiller.model.core;

public enum Faction {
	ALLIANCE("A", "Alliance"),
	HORDE("H", "Horde"),
	NEUTRAL("N", "Neutral");
	
	private final String id;
	private final String name;
	
	Faction(final String id, final String name) {
		this.id = id;
		this.name = name;
	}
	
	public String getId() {
		return id;
	}
	
	@Override
	public String toString() {
		return name;
	}
}
