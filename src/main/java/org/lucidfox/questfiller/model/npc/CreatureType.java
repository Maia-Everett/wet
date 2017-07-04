package org.lucidfox.questfiller.model.npc;

import java.util.HashMap;
import java.util.Map;

public enum CreatureType {
	ABERRATION(15, "Aberration"),
	BATTLE_PET(12, "Battle Pet"),
	BEAST(1, "Beast"),
	CRITTER(8, "Critter"),
	DEMON(3, "Demon"),
	DRAGONKIN(2, "Dragonkin"),
	ELEMENTAL(4, "Elemental"),
	GIANT(5, "Giant"),
	HUMANOID(7, "Humanoid"),
	MECHANICAL(9, "Mechanical"),
	UNDEAD(6, "Undead"),
	UNCATEGORIZED(10, "Uncategorized");
	
	private static final Map<Integer, CreatureType> BY_ID = new HashMap<>();
	
	static {
		for (final CreatureType ct : CreatureType.values()) {
			BY_ID.put(ct.id, ct);
		}
	}
	
	public static CreatureType getById(final int id) {
		return BY_ID.get(id);
	}
	
	private final int id;
	private final String name;
	
	CreatureType(int id, String name) {
		this.id = id;
		this.name = name;
	}

	@Override
	public String toString() {
		return name;
	}
}
