package org.lucidfox.questfiller.model.npc;

public enum Reaction {
	HOSTILE(-1),
	NEUTRAL(0),
	FRIENDLY(1);
	
	public static Reaction getByColor(final String colorId) {
		switch (colorId) {
		case "":
			return NEUTRAL;
		case "2":
			return FRIENDLY;
		case "10":
			return HOSTILE;
		default:
			throw new AssertionError();
		}
	}
	
	private final int value;
	
	Reaction(final int value) {
		this.value = value;
	}
	
	@Override
	public String toString() {
		return Integer.toString(value);
	}
}
