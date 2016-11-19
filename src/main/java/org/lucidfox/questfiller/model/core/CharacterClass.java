package org.lucidfox.questfiller.model.core;

import java.util.HashMap;
import java.util.Map;

public enum CharacterClass {
	DEATH_KNIGHT(6, "Death Knight"),
	DEMON_HUNTER(12, "Demon Hunter"),
	DRUID(11, "Druid"),
	HUNTER(3, "Hunter"),
	MAGE(8, "Mage"),
	MONK(10, "Monk"),
	PALADIN(2, "Paladin"),
	PRIEST(5, "Priest"),
	ROGUE(4, "Rogue"),
	SHAMAN(7, "Shaman"),
	WARLOCK(9, "Warlock"),
	WARRIOR(1, "Warrior");
	
	private static final Map<Integer, CharacterClass> BY_ID = new HashMap<>();
	
	static {
		for (final CharacterClass cc : CharacterClass.values()) {
			BY_ID.put(cc.id, cc);
		}
	}
	
	public static CharacterClass getById(final int id) {
		return BY_ID.get(id);
	}
	
	private final int id;
	private final String name;
	
	CharacterClass(final int id, final String name) {
		this.id = id;
		this.name = name;
	}
	
	@Override
	public String toString() {
		return name;
	}
}
