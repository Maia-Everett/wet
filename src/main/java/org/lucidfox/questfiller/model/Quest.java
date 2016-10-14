package org.lucidfox.questfiller.model;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class Quest {
	// Infobox
	private int id;
	private String name;
	private Faction faction;
	private CharacterClass characterClass;
	private String category;
	private int level;
	private int levelRequired;
	private boolean isGroup;
	private int groupSize;
	private String startEntity;
	private String finishEntity;
	private Map<String, Integer> reputationGains = new LinkedHashMap<>();
	private int experience;
	private List<String> choiceRewards = new ArrayList<>();
	private List<String> nonChoiceRewards = new ArrayList<>();
	private List<String> abilityRewards = new ArrayList<>();
	private List<String> buffRewards = new ArrayList<>();
	private int money;
	private boolean repeatable;
	private boolean shareable;
	private String previousQuestName;
	private String nextQuestName;

	// Main text
	private String objectives;
	private List<String> stages = new ArrayList<>();
	private String description;
	private String progress;
	private String completion;
	private String patchAdded;

	public int getId() {
		return id;
	}

	public void setId(final int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(final String name) {
		this.name = name;
	}

	public Faction getFaction() {
		return faction;
	}

	public void setFaction(final Faction faction) {
		this.faction = faction;
	}
	
	public CharacterClass getCharacterClass() {
		return characterClass;
	}
	
	public void setCharacterClass(final CharacterClass characterClass) {
		this.characterClass = characterClass;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(final String category) {
		this.category = category;
	}

	public int getLevel() {
		return level;
	}

	public void setLevel(final int level) {
		this.level = level;
	}

	public int getLevelRequired() {
		return levelRequired;
	}

	public void setLevelRequired(final int levelRequired) {
		this.levelRequired = levelRequired;
	}

	public boolean isGroup() {
		return isGroup;
	}

	public void setGroup(final boolean group) {
		this.isGroup = group;
	}

	public int getGroupSize() {
		return groupSize;
	}

	public void setGroupSize(final int groupSize) {
		this.groupSize = groupSize;
	}

	public String getStartEntity() {
		return startEntity;
	}

	public void setStartEntity(final String startEntity) {
		this.startEntity = startEntity;
	}

	public String getFinishEntity() {
		return finishEntity;
	}

	public void setFinishEntity(final String finishEntity) {
		this.finishEntity = finishEntity;
	}

	public Map<String, Integer> getReputationGains() {
		return reputationGains;
	}

	public void setReputationGains(final Map<String, Integer> reputationGains) {
		this.reputationGains = reputationGains;
	}

	public int getExperience() {
		return experience;
	}

	public void setExperience(final int experience) {
		this.experience = experience;
	}

	public List<String> getChoiceRewards() {
		return choiceRewards;
	}

	public void setChoiceRewards(final List<String> choiceRewards) {
		this.choiceRewards = choiceRewards;
	}

	public List<String> getNonChoiceRewards() {
		return nonChoiceRewards;
	}

	public void setNonChoiceRewards(final List<String> nonChoiceRewards) {
		this.nonChoiceRewards = nonChoiceRewards;
	}

	public List<String> getAbilityRewards() {
		return abilityRewards;
	}

	public void setAbilityRewards(final List<String> abilityRewards) {
		this.abilityRewards = abilityRewards;
	}

	public List<String> getBuffRewards() {
		return buffRewards;
	}

	public void setBuffRewards(final List<String> buffRewards) {
		this.buffRewards = buffRewards;
	}

	public int getMoney() {
		return money;
	}

	public void setMoney(final int money) {
		this.money = money;
	}

	public boolean isRepeatable() {
		return repeatable;
	}

	public void setRepeatable(final boolean repeatable) {
		this.repeatable = repeatable;
	}

	public boolean isShareable() {
		return shareable;
	}

	public void setShareable(final boolean shareable) {
		this.shareable = shareable;
	}

	public String getPreviousQuestName() {
		return previousQuestName;
	}

	public void setPreviousQuestName(final String previousQuestName) {
		this.previousQuestName = previousQuestName;
	}

	public String getNextQuestName() {
		return nextQuestName;
	}

	public void setNextQuestName(final String nextQuestName) {
		this.nextQuestName = nextQuestName;
	}

	public String getObjectives() {
		return objectives;
	}

	public void setObjectives(final String objectives) {
		this.objectives = objectives;
	}

	public List<String> getStages() {
		return stages;
	}

	public void setStages(final List<String> stages) {
		this.stages = stages;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(final String description) {
		this.description = description;
	}

	public String getProgress() {
		return progress;
	}

	public void setProgress(final String progress) {
		this.progress = progress;
	}

	public String getCompletion() {
		return completion;
	}

	public void setCompletion(final String completion) {
		this.completion = completion;
	}

	public String getPatchAdded() {
		return patchAdded;
	}

	public void setPatchAdded(final String patchAdded) {
		this.patchAdded = patchAdded;
	}
	
	public String dump() {
		final StringBuilder sb = new StringBuilder();
		
		for (final Method m : getClass().getDeclaredMethods()) {
			if (m.getName().startsWith("get") && m.getParameterCount() == 0 && !"getClass".equals(m.getName())) {
				sb.append(m.getName().replaceAll("^get", ""));
				sb.append(": ");
				
				try {
					sb.append(m.invoke(this));
				} catch (final ReflectiveOperationException e) {
					e.printStackTrace();
					sb.append("<error>");
				}
				
				sb.append("\n");
			}
		}
		
		return sb.toString();
	}
	
	@Override
	public String toString() {
		return String.format("[%s] [%s] %s", faction == null ? "" : faction.getId(), level, name);
	}
}
