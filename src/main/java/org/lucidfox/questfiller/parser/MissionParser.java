package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.collectTextUntilNextTag;
import static org.lucidfox.questfiller.parser.ParseUtils.getFirstWithOwnText;
import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.lucidfox.questfiller.model.core.CharacterClass;
import org.lucidfox.questfiller.model.mission.ClassHallMission;
import org.lucidfox.questfiller.model.mission.GarrisonMission;
import org.lucidfox.questfiller.model.mission.Mission;
import org.lucidfox.questfiller.model.mission.MissionEnemy;
import org.lucidfox.questfiller.model.mission.NavalMission;

final class MissionParser implements IParser<Mission> {
	// Magic numbers from breadcrumb bar
	private static final int MISSION_SYSTEM_GARRISONS = 21;
	private static final int MISSION_SYSTEM_CLASS_HALLS = 30;
	private static final int MISSION_UNIT_FOLLOWERS = 1;
	private static final int MISSION_UNIT_SHIPS = 2;
	
	private final ParserContext context;
	
	MissionParser(final ParserContext context) {
		this.context = context; 
	}
	
	public Mission parse(final Document html) {
		final Mission mission = createMissionOfCorrectType(html);
		
		final String url = html.select("link[rel=canonical]").attr("href");
		final String idStr = getRegexGroup(url, "/mission=([0-9]+)/", 1).get();
		mission.setId(Integer.parseInt(idStr));
		
		final Element mainContainer = html.select("#main-contents div.text").first();
		final Element missionName = html.select("h1.heading-size-1").first();
		mission.setName(missionName.text());
		
		parseDescription(mission, mainContainer, html);
		parseEncounters(mission, mainContainer);
		parseCost(mission, mainContainer);
		parseRewards(mission, mainContainer);
		parseInfobox(mission, html);
		return mission;
	}
	
	private Mission createMissionOfCorrectType(final Document html) {
		final int[] categoryIds = ParseUtils.getCategoryIds(html);
		
		if (categoryIds[1] == MISSION_SYSTEM_CLASS_HALLS) {
			return new ClassHallMission();
		}

		assert categoryIds[1] == MISSION_SYSTEM_GARRISONS;
		
		switch (categoryIds[3]) {
		case MISSION_UNIT_FOLLOWERS:
			return new GarrisonMission();
		case MISSION_UNIT_SHIPS:
			return new NavalMission();
		default:
			throw new AssertionError();
		}
	}

	private void parseDescription(final Mission mission, final Element mainContainer, final Document html) {
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		
		getFirstWithOwnText(headingsSize3, "Description").ifPresent(descriptionHeading -> {
			mission.setDescription(collectTextUntilNextTag(descriptionHeading, "h2").trim());
		});
	}

	private void parseEncounters(final Mission mission, final Element mainContainer) {
		final boolean useLegionThreats = mission instanceof ClassHallMission;
		
		for (final Element td : mainContainer.select("td.garrison-encounter-enemy")) {
			if (td.hasClass("empty")) {
				continue;
			}
			
			final String enemyName = td.select("span.garrison-encounter-enemy-name").text();
			final List<String> enemyCounters = new ArrayList<>();
			
			for (final Element mechanic : td.select("div.garrison-encounter-enemy-mechanic")) {
				if (!useLegionThreats) {
					final int mechanicId = Integer.parseInt(mechanic.attr("data-mechanic"));
					enemyCounters.add(context.getMissionThreat(mechanicId));
				} else {
					final String abilityLink = mechanic.attr("data-href");
					final int mechanicId = Integer.parseInt(
							getRegexGroup(abilityLink, "/mission-ability=([0-9]+)", 1).get());
					enemyCounters.add(context.getLegionMissionThreat(mechanicId));
				}
			}
			
			mission.getEnemies().add(new MissionEnemy(enemyName, enemyCounters));
		}
	}

	private void parseCost(final Mission mission, final Element mainContainer) {
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		
		// Find the icontab that describes the mission cost
		getFirstWithOwnText(headingsSize3, "Cost").ifPresent(costHeading -> {
			Element icontab = costHeading;
			
			do {
				icontab = icontab.nextElementSibling();
			} while (!icontab.tagName().equals("table") || !icontab.hasClass("icontab"));
			
			// Mission cost is the quantity of the only item in the icontab
			ParseUtils.collectItemRewards(icontab, reward -> mission.setCost(reward.getQuantity()));
		});
	}

	private void parseRewards(final Mission mission, final Element mainContainer) {
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		
		getFirstWithOwnText(headingsSize3, "Rewards").ifPresent(rewardsHeading -> {
			// Look through everything between Rewards and the next header (or end of parent)
			for (Element el = rewardsHeading.nextElementSibling();
					el != null && !(el.tagName().equals("h3") && el.hasClass("heading-size-3"));
					el = el.nextElementSibling()) {
				if (el.tagName().equals("table") && el.hasClass("icontab")) {
					parseItemRewards(mission, el);
				} else if (el.tagName().equals("ul")) {
					// Non-item rewards
					parseNonItemRewards(mission, el.getElementsByTag("li"));
				}
			}
		});
	}
	
	private void parseItemRewards(final Mission mission, final Element icontab) {
		ParseUtils.collectItemRewards(icontab, reward -> {
			if (reward.getName().equals(mission.getResourceName())) {
				mission.setBonusResources(reward.getQuantity());
			} else {
				mission.getBonusItems().add(reward);
			}
		});
	}

	private void parseNonItemRewards(final Mission mission, final Elements listItems) {
		// This is a bit messy because Wowhead lumps all rewards together
		for (final Element li : listItems) {
			final String text = li.text();
			final Optional<String> maybeXP = getRegexGroup(text, "([0-9,]*) experience", 1);
			
			if (maybeXP.isPresent()) {
				mission.setBonusXP(Integer.parseInt(maybeXP.get().replace(",", "")));
				continue;
			}
			
			final int money = ParseUtils.getMoney(li);
			
			if (money != 0) {
				mission.setBonusMoney(money);
			}
		}
	}

	private void parseInfobox(final Mission mission, final Document html) {
		// Infobox section
		final List<String> infoboxLines = ParseUtils.getInfoboxLines(html);
		
		// Pattern-match each infobox line
		for (final String infoboxLine : infoboxLines) {
			if (infoboxLine.startsWith("Rare")) {
				mission.setRare(true);
				continue;
			}
			
			if (infoboxLine.startsWith("Exhausting")) {
				mission.setExhausting(true);
				continue;
			}
			
			getRegexGroup(infoboxLine, "Level: ([0-9]+)", 1).ifPresent(levelStr -> {
				mission.setLevel(Integer.parseInt(levelStr));
			});
			
			getRegexGroup(infoboxLine, "Required item level: ([0-9]+)", 1).ifPresent(levelStr -> {
				mission.setFollowerItemLevel(Integer.parseInt(levelStr));
			});
			
			getRegexGroup(infoboxLine, "Location: (.+)", 1).ifPresent(location -> {
				mission.setLocation(location);
			});
			
			getRegexGroup(infoboxLine, "Duration: (.+)", 1).ifPresent(duration -> {
				mission.setDuration(duration);
			});
			
			getRegexGroup(infoboxLine, "Type: (.+)", 1).ifPresent(type -> {
				mission.setType(type);
			});

			getRegexGroup(infoboxLine, "Category: (.+)", 1).ifPresent(category -> {
				mission.setCategory(category);
			});
			
			getRegexGroup(infoboxLine, "Class: ([0-9]+)", 1).ifPresent(classId -> {
				mission.setCharacterClass(CharacterClass.getById(Integer.parseInt(classId)));
			});
			
			getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1).ifPresent(patch -> {
				mission.setPatchAdded(PatchVersions.getCanonicalVersion(patch));
			});
			
			getRegexGroup(infoboxLine, "(?:Followers|Champions|Ships): ([0-9]+)", 1).ifPresent(groupSize -> {
				mission.setGroupSize(Integer.parseInt(groupSize));
			});
		}
	}
}
