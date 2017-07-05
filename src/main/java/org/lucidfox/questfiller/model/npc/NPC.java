package org.lucidfox.questfiller.model.npc;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.lucidfox.questfiller.model.core.Faction;
import org.lucidfox.questfiller.model.core.IDumpable;

public final class NPC implements IDumpable {
	private static final int MAX_ITEMBOX_ITEMS = 30;
	
	// Infobox
	private int id;
	private String name;
	private String title;
	private String gender;
	private String levelLow;
	private String levelHigh;
	private String levelClassification;
	private Long health;
	private String repFaction;
	private String race;
	private CreatureType creatureType;
	private Reaction allianceReaction;
	private Reaction hordeReaction;
	private String petFamily;
	private String patchAdded;
	private int money;

	// Other
	private String location;
	private List<NPCQuest> quests = new ArrayList<>();
	private List<String> quotes = new ArrayList<>();
	private List<SoldItem> itemsSold = new ArrayList<>();
	
	// Methods
	
	public int getId() {
		return id;
	}
	
	public void setId(int id) {
		this.id = id;
	}

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
	
	public String getLevelLow() {
		return levelLow;
	}
	
	public void setLevelLow(String levelLow) {
		this.levelLow = levelLow;
	}
	
	public String getLevelHigh() {
		return levelHigh;
	}
	
	public void setLevelHigh(String levelHigh) {
		this.levelHigh = levelHigh;
	}
	
	public String getLevelClassification() {
		return levelClassification;
	}

	public void setLevelClassification(String levelClassification) {
		this.levelClassification = levelClassification;
	}

	public Long getHealth() {
		return health;
	}

	public void setHealth(Long health) {
		this.health = health;
	}

	public String getRepFaction() {
		return repFaction;
	}

	public void setRepFaction(String faction) {
		this.repFaction = faction;
	}
	
	public String getRace() {
		return race;
	}
	
	public void setRace(String race) {
		this.race = race;
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
	
	public Reaction getHordeReaction() {
		return hordeReaction;
	}
	
	public void setHordeReaction(Reaction hordeReaction) {
		this.hordeReaction = hordeReaction;
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
	
	public int getMoney() {
		return money;
	}
	
	public void setMoney(int money) {
		this.money = money;
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
	
	public List<SoldItem> getItemsSold() {
		return itemsSold;
	}
	
	public void setItemsSold(List<SoldItem> itemsSold) {
		this.itemsSold = itemsSold;
	}
	
	public boolean isQuestGiver() {
		return quests.stream().anyMatch(NPCQuest::isStarts);
	}
	
	public boolean isQuestEnder() {
		return quests.stream().anyMatch(NPCQuest::isFinishes);
	}
	
	public Faction getFaction() {
		if (allianceReaction == null && hordeReaction == null) {
			return null;
		} else if (allianceReaction == Reaction.FRIENDLY && hordeReaction != Reaction.FRIENDLY) {
			return Faction.ALLIANCE;
		} else if (allianceReaction != Reaction.FRIENDLY && hordeReaction == Reaction.FRIENDLY) {
			return Faction.HORDE;
		} else if (allianceReaction == Reaction.HOSTILE && hordeReaction == Reaction.HOSTILE) {
			return Faction.COMBAT;
		} else if (allianceReaction == Reaction.NEUTRAL && hordeReaction == Reaction.NEUTRAL) {
			return Faction.COMBAT;
		} else {
			return Faction.NEUTRAL;
		}
	}
	
	public String getHealthStr() {
		return NumberFormat.getNumberInstance(Locale.US).format(health);
	}

	public boolean isUseItembox() {
		return itemsSold.size() <= MAX_ITEMBOX_ITEMS;
	}
	
	public String getRaceLowerCase() {
		return race == null ? null : race.toLowerCase();
	}
	
	public boolean isRaceStartsWithVowel() {
		return race == null || race.isEmpty() ? false : "AEIOU".indexOf(race.charAt(0)) != -1;
	}
	
	public boolean hasMoney() {
		return money != 0;
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
}
