package org.lucidfox.questfiller.model.quest;

public final class ReputationGain {
	private final String faction;
	private final String canonicalName;
	private final int gain;
	
	public ReputationGain(final String faction, final String canonicalName, final int gain) {
		this.faction = faction;
		this.canonicalName = canonicalName;
		this.gain = gain;
	}
	
	private String getLink() {
		if (canonicalName == null) {
			return String.format("[[%s]]", faction);
		} else {
			return String.format("[[%s|%s]]", canonicalName, faction);
		}
	}
	
	public String getFullText() {
		return String.format("+%s reputation with %s", gain, getLink());
	}
	
	@Override
	public String toString() {
		return String.format("+%s %s", gain, getLink());
	}
}
