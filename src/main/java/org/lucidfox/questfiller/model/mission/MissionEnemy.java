package org.lucidfox.questfiller.model.mission;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class MissionEnemy {
	private final String name;
	private final List<String> counters;

	public MissionEnemy(final String name, final Iterable<String> counters) {
		this.name = name;
		
		final ArrayList<String> countersCopy = new ArrayList<>();
		counters.forEach(countersCopy::add);
		countersCopy.trimToSize();
		this.counters = Collections.unmodifiableList(countersCopy);
	}

	public String getName() {
		return name;
	}

	public List<String> getCounters() {
		return counters;
	}
	
	@Override
	public String toString() {
		return name + " " + counters;
	}
}
