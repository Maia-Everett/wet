package org.lucidfox.questfiller.model.npc;

import java.util.ArrayList;
import java.util.List;

import org.lucidfox.questfiller.model.core.Faction;

public final class NPC {
	// Infobox
	private String name;
	private String title;
	private String gender;
	private int level;
	private String levelClassification;
	private long health;
	private long mana;
	private Faction faction;
	private CreatureType creatureType;
	private Reaction allianceReaction;
	private String petFamily;
	private String patchAdded;

	// Other
	private String location;
	private List<NPCQuest> quests = new ArrayList<>();
	private List<String> quotes = new ArrayList<>();
	
	// Methods

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public int getLevel() {
		return level;
	}

	public void setLevel(int level) {
		this.level = level;
	}

	public String getLevelClassification() {
		return levelClassification;
	}

	public void setLevelClassification(String levelClassification) {
		this.levelClassification = levelClassification;
	}

	public long getHealth() {
		return health;
	}

	public void setHealth(long health) {
		this.health = health;
	}

	public long getMana() {
		return mana;
	}

	public void setMana(long mana) {
		this.mana = mana;
	}

	public Faction getFaction() {
		return faction;
	}

	public void setFaction(Faction faction) {
		this.faction = faction;
	}

	public CreatureType getCreatureType() {
		return creatureType;
	}

	public void setCreatureType(CreatureType creatureType) {
		this.creatureType = creatureType;
	}

	public Reaction getAllianceReaction() {
		return allianceReaction;
	}

	public void setAllianceReaction(Reaction allianceReaction) {
		this.allianceReaction = allianceReaction;
	}

	public String getPetFamily() {
		return petFamily;
	}

	public void setPetFamily(String petFamily) {
		this.petFamily = petFamily;
	}
	
	public String getPatchAdded() {
		return patchAdded;
	}
	
	public void setPatchAdded(String patchAdded) {
		this.patchAdded = patchAdded;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public List<NPCQuest> getQuests() {
		return quests;
	}

	public void setQuests(List<NPCQuest> quests) {
		this.quests = quests;
	}

	public List<String> getQuotes() {
		return quotes;
	}

	public void setQuotes(List<String> quotes) {
		this.quotes = quotes;
	}
}
