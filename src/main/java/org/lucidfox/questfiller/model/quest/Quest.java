package org.lucidfox.questfiller.model.quest;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Stream;

import org.lucidfox.questfiller.model.core.CharacterClass;
import org.lucidfox.questfiller.model.core.Faction;
import org.lucidfox.questfiller.model.core.IDumpable;
import org.lucidfox.questfiller.model.core.ItemReward;
import org.lucidfox.questfiller.model.core.Race;

public final class Quest implements IDumpable {
	// Infobox
	private int id;
	private String name;
	private Faction faction;
	private CharacterClass characterClass;
	private Race race;
	private String category;
	private Integer level;
	private Integer levelRequired;
	private String type;
	private Integer groupSize;
	private String startEntity;
	private String finishEntity;
	private List<ReputationGain> reputationGains = new ArrayList<>();
	private int experience;
	private List<String> otherGains = new ArrayList<>();
	private List<ItemReward> choiceRewards = new ArrayList<>();
	private List<ItemReward> nonChoiceRewards = new ArrayList<>();
	private List<String> abilityRewards = new ArrayList<>();
	private List<String> buffRewards = new ArrayList<>();
	private int money;
	private boolean repeatable;
	private boolean shareable;
	private Set<String> previousQuests = new TreeSet<>();
	private Set<String> nextQuests = new TreeSet<>();

	// Main text
	private String objectives;
	private List<String> stages = new ArrayList<>();
	private List<String> providedItems = new ArrayList<>();
	private String description;
	private String progress;
	private String completion;
	private String patchAdded;
	private boolean removed;

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
	
	public Race getRace() {
		return race;
	}
	
	public void setRace(final Race race) {
		this.race = race;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(final String category) {
		this.category = category;
	}

	public Integer getLevel() {
		return level;
	}

	public void setLevel(final Integer level) {
		this.level = level;
	}

	public Integer getLevelRequired() {
		return levelRequired;
	}

	public void setLevelRequired(final Integer levelRequired) {
		this.levelRequired = levelRequired;
	}

	public String getType() {
		return type;
	}
	
	public void setType(final String type) {
		this.type = type;
	}

	public Integer getGroupSize() {
		return groupSize;
	}

	public void setGroupSize(final Integer groupSize) {
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

	public List<ReputationGain> getReputationGains() {
		return reputationGains;
	}

	public void setReputationGains(final List<ReputationGain> reputationGains) {
		this.reputationGains = reputationGains;
	}

	public int getExperience() {
		return experience;
	}

	public void setExperience(final int experience) {
		this.experience = experience;
	}
	
	public List<String> getOtherGains() {
		return otherGains;
	}
	
	public void setOtherGains(final List<String> otherGains) {
		this.otherGains = otherGains;
	}

	public List<ItemReward> getChoiceRewards() {
		return choiceRewards;
	}

	public void setChoiceRewards(final List<ItemReward> choiceRewards) {
		this.choiceRewards = choiceRewards;
	}

	public List<ItemReward> getNonChoiceRewards() {
		return nonChoiceRewards;
	}

	public void setNonChoiceRewards(final List<ItemReward> nonChoiceRewards) {
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

	public Set<String> getPreviousQuests() {
		return previousQuests;
	}

	public void setPreviousQuests(final Set<String> previousQuests) {
		this.previousQuests = previousQuests;
	}

	public Set<String> getNextQuests() {
		return nextQuests;
	}

	public void setNextQuests(final Set<String> nextQuests) {
		this.nextQuests = nextQuests;
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
	
	public List<String> getProvidedItems() {
		return providedItems;
	}
	
	public void setProvidedItems(final List<String> providedItems) {
		this.providedItems = providedItems;
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
	
	public boolean isRemoved() {
		return removed;
	}
	
	public void setRemoved(final boolean removed) {
		this.removed = removed;
	}
	
	public boolean hasItemRewards() {
		return !choiceRewards.isEmpty() || !nonChoiceRewards.isEmpty();
	}
	
	public List<ItemReward> getAllNonChoiceRewards() {
		final List<ItemReward> result = new ArrayList<>();
		result.addAll(nonChoiceRewards);
		// These are not actually item rewards, but the formatter will behave as if they're items with unknown quantity
		Stream.concat(abilityRewards.stream(), buffRewards.stream()).forEach(reward -> {
			result.add(new ItemReward(reward, null, result.size() + 1));
		});
		return result;
	}
	
	public boolean hasNonMoneyRewards() {
		return hasItemRewards() || !abilityRewards.isEmpty() || !buffRewards.isEmpty();
	}
	
	public boolean hasMoney() {
		return money != 0;
	}
	
	public boolean hasRewards() {
		return hasMoney() || hasNonMoneyRewards();
	}
	
	public boolean hasExperience() {
		return experience != 0;
	}
	
	public String getExperienceStr() {
		return NumberFormat.getNumberInstance(Locale.US).format(experience);
	}
	
	public boolean hasGains() {
		return hasExperience() || !reputationGains.isEmpty();
	}
	
	private static Integer getNonzeroOrNull(final int quantity) {
		return quantity == 0 ? null : quantity;
	}
	
	public Integer getGold() {
		return getNonzeroOrNull(money / 10000); 
	}
	
	public Integer getSilver() {
		return getNonzeroOrNull((money % 10000) / 100); 
	}
	
	public Integer getCopper() {
		return getNonzeroOrNull(money % 100); 
	}
	
	public boolean isNeutral() {
		return faction == Faction.NEUTRAL;
	}
	
	public boolean isStartAndFinishEqual() {
		return Objects.equals(startEntity, finishEntity);
	}
	
	@Override
	public String toString() {
		return String.format("[%s] [%s] %s", faction == null ? "" : faction.getId(), level, name);
	}
}
