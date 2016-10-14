package org.lucidfox.questfiller.model;

import java.util.HashMap;
import java.util.Map;

public enum Race {
	BLOOD_ELF(10, "Blood Elf"),
	DRAENEI(11, "Draenei"),
	DWARF(3, "Dwarf"),
	GNOME(7, "Gnome"),
	GOBLIN(9, "Goblin"),
	HUMAN(1, "Human"),
	NIGHT_ELF(4, "Night Elf"),
	ORC(2, "Orc"),
	PANDAREN_NEUTRAL(24, "Pandaren"),
	PANDAREN_ALLIANCE(25, "Pandaren"),
	PANDAREN_HORDE(26, "Pandaren"),
	TAUREN(6, "Tauren"),
	TROLL(8, "Troll"),
	UNDEAD(5, "Undead"),
	WORGEN(22, "Worgen");
	
	private static final Map<Integer, Race> BY_ID = new HashMap<>();
	
	static {
		for (final Race cc : Race.values()) {
			BY_ID.put(cc.id, cc);
		}
	}
	
	public static Race getById(final int id) {
		return BY_ID.get(id);
	}
	
	private final int id;
	private final String name;
	
	Race(final int id, final String name) {
		this.id = id;
		this.name = name;
	}
	
	@Override
	public String toString() {
		return name;
	}
}
