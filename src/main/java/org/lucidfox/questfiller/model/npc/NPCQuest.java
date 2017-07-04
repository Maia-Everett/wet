package org.lucidfox.questfiller.model.npc;

public final class NPCQuest implements Comparable<NPCQuest> {
	private final String name;
	private final boolean starts;
	private final boolean finishes;
	
	public NPCQuest(String name, boolean starts, boolean finishes) {
		this.name = name;
		this.starts = starts;
		this.finishes = finishes;
	}

	public String getName() {
		return name;
	}

	public boolean isStarts() {
		return starts;
	}

	public boolean isFinishes() {
		return finishes;
	}

	@Override
	public int compareTo(NPCQuest o) {
		return name.compareTo(o.name);
	}
}
