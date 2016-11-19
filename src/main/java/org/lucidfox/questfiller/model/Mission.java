package org.lucidfox.questfiller.model;

import java.util.ArrayList;
import java.util.List;

public final class Mission implements IDumpable {
	private int id;
	private String name;
	private String location;
	private String duration;
	private Faction faction = Faction.NEUTRAL;
	private CharacterClass characterClass;
	private String category;
	private Integer level;
	private Integer followerItemLevel;
	private String type;
	private Integer groupSize;
	private int experience;
	private boolean rare;
	private int followerXP;
	private String description;
	private List<MissionEnemy> enemies = new ArrayList<>();
	private int bonusMoney;
	private int bonusXP;
	private int bonusResources;
	private String patchAdded;
	private List<String> bonusItems = new ArrayList<>();
	
	public String getLocation() {
		return location;
	}
	
	public void setLocation(final String location) {
		this.location = location;
	}
	
	public String getDuration() {
		return duration;
	}
	
	public void setDuration(final String duration) {
		this.duration = duration;
	}
	
	public boolean isRare() {
		return rare;
	}

	public void setRare(final boolean rare) {
		this.rare = rare;
	}

	public int getFollowerXP() {
		return followerXP;
	}

	public void setFollowerXP(final int followerXP) {
		this.followerXP = followerXP;
	}

	public int getBonusMoney() {
		return bonusMoney;
	}

	public void setBonusMoney(final int bonusMoney) {
		this.bonusMoney = bonusMoney;
	}

	public int getBonusXP() {
		return bonusXP;
	}

	public void setBonusXP(final int bonusXP) {
		this.bonusXP = bonusXP;
	}

	public int getBonusResources() {
		return bonusResources;
	}

	public void setBonusResources(final int bonusResources) {
		this.bonusResources = bonusResources;
	}

	public List<String> getBonusItems() {
		return bonusItems;
	}

	public void setBonusItems(final List<String> bonusItems) {
		this.bonusItems = bonusItems;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(final String description) {
		this.description = description;
	}

	public List<MissionEnemy> getEnemies() {
		return enemies;
	}

	public void setEnemies(final List<MissionEnemy> enemies) {
		this.enemies = enemies;
	}

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

	public Integer getLevel() {
		return level;
	}

	public void setLevel(final Integer level) {
		this.level = level;
	}

	public Integer getFollowerItemLevel() {
		return followerItemLevel;
	}

	public void setFollowerItemLevel(final Integer followerItemLevel) {
		this.followerItemLevel = followerItemLevel;
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

	public int getExperience() {
		return experience;
	}

	public void setExperience(final int experience) {
		this.experience = experience;
	}
	
	public String getPatchAdded() {
		return patchAdded;
	}
	
	public void setPatchAdded(final String patchAdded) {
		this.patchAdded = patchAdded;
	}
	
	private static Integer getNonzeroOrNull(final int quantity) {
		return quantity == 0 ? null : quantity;
	}
	
	public Integer getGold() {
		return getNonzeroOrNull(bonusMoney / 10000); 
	}
	
	public Integer getSilver() {
		return getNonzeroOrNull((bonusMoney % 10000) / 100); 
	}
	
	public Integer getCopper() {
		return getNonzeroOrNull(bonusMoney % 100); 
	}
	
	public boolean isNeutral() {
		return faction == Faction.NEUTRAL;
	}
	
	@Override
	public String toString() {
		return String.format("[%s] [%s] %s", faction == null ? "" : faction.getId(), level, name);
	}
}
