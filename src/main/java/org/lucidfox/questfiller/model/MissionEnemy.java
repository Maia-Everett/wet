package org.lucidfox.questfiller.model;

public final class MissionEnemy {
	private final String name;
	private final String counter;

	public MissionEnemy(final String name, final String counter) {
		this.name = name;
		this.counter = counter;
	}

	public String getName() {
		return name;
	}

	public String getCounter() {
		return counter;
	}
}
