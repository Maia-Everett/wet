package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.collectTextUntilNextTag;
import static org.lucidfox.questfiller.parser.ParseUtils.getFirstWithOwnText;
import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;

import java.util.List;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.lucidfox.questfiller.model.core.CharacterClass;
import org.lucidfox.questfiller.model.mission.ClassHallMission;
import org.lucidfox.questfiller.model.mission.GarrisonMission;
import org.lucidfox.questfiller.model.mission.Mission;
import org.lucidfox.questfiller.model.mission.NavalMission;

final class MissionParser implements IParser<Mission> {
	// Magic numbers from breadcrumb bar
	private static final int MISSION_SYSTEM_GARRISONS = 21;
	private static final int MISSION_SYSTEM_CLASS_HALLS = 30;
	private static final int MISSION_UNIT_FOLLOWERS = 1;
	private static final int MISSION_UNIT_SHIPS = 2;
	
	//private final ParserContext context;
	
	MissionParser(final ParserContext context) {
		//this.context = context; 
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
		// TODO Auto-generated method stub
		
	}

	private void parseRewards(final Mission mission, final Element mainContainer) {
		// TODO Auto-generated method stub
		
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
			
			getRegexGroup(infoboxLine, "(?:Followers|Champions): ([0-9]+)", 1).ifPresent(groupSize -> {
				mission.setGroupSize(Integer.parseInt(groupSize));
			});
		}
	}
}
