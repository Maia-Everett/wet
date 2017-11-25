import { $, $$ } from "../common/shortcuts";
import u from "./utils";
import substitutions from "./substitutions";

import missionEJS from "../templates/mission.ejs";

import Mission from "../model/mission/Mission";
import GarrisonMission from "../model/mission/GarrisonMission";
import NavalMission from "../model/mission/NavalMission";
import ClassHallMission from "../model/mission/ClassHallMission";
import MissionEnemy from "../model/mission/MissionEnemy";

// Magic numbers from breadcrumb bar
const MISSION_SYSTEM_GARRISONS = 21;
const MISSION_SYSTEM_CLASS_HALLS = 30;
const MISSION_UNIT_FOLLOWERS = 1;
const MISSION_UNIT_SHIPS = 2;

/**
 * @param {ParserContext} context 
 */
export default function MissionParser(context) {
	this.context = context;
	this.templatePrefix = "m";
	this.template = missionEJS;

	/**
	 * @return {Mission}
	 */
	this.parse = function() {
		let mission = createMissionOfCorrectType();
		
		let url = $("link[rel=canonical]").getAttribute("href");
		let idStr = u.getRegexGroup(url, "/mission=([0-9]+)/", 1);
		mission.id = parseInt(idStr, 10);
		
		let mainContainer = $("#main-contents > div.text");
		mission.name = mainContainer.querySelector("h1.heading-size-1").textContent.trim();

		parseDescription(mission, mainContainer);
		parseEncounters(mission, mainContainer);
		parseCost(mission, mainContainer);
		parseGains(mission, mainContainer);
		/*
		parseRewards(mission, mainContainer);
		parseInfobox(mission, html);
		*/

		return mission;
	}

	function createMissionOfCorrectType() {
		let categoryIds = u.getCategoryIds();
		
		if (categoryIds[1] === MISSION_SYSTEM_CLASS_HALLS) {
			return new ClassHallMission();
		}

		switch (categoryIds[3]) {
		case MISSION_UNIT_FOLLOWERS:
			return new GarrisonMission();
		case MISSION_UNIT_SHIPS:
			return new NavalMission();
		default:
			throw new Error();
		}
	}

	/**
	 * 
	 * @param {Mission} mission 
	 * @param {Element} mainContainer 
	 */
	function parseDescription(mission, mainContainer) {
		let headingsSize3 = mainContainer.querySelectorAll("h2.heading-size-3");

		u.getFirstWithOwnText(headingsSize3, "Description", descriptionHeading => {
			mission.description = u.normalize(u.collectTextUntilNextTag(descriptionHeading, "h2"));
		});
	}


	/**
	 * 
	 * @param {Mission} mission 
	 * @param {Element} mainContainer 
	 */
	function parseEncounters(mission, mainContainer) {
		let useLegionThreats = mission instanceof ClassHallMission;
		
		for (let td of mainContainer.querySelectorAll("td.garrison-encounter-enemy")) {
			if (td.classList.contains("empty")) {
				continue;
			}
			
			let enemyName = u.normalize(td.querySelector("span.garrison-encounter-enemy-name").textContent);
			let enemyCounters = [];
			
			for (let mechanic of td.querySelectorAll("div.garrison-encounter-enemy-mechanic")) {
				if (useLegionThreats) {
					// Try to parse Legion mission counter, if available
					let abilityLink = mechanic.getAttribute("data-href");
					let abilityStr = u.getRegexGroup(abilityLink, "/mission-ability=([0-9]+)", 1);
					
					if (abilityStr) {
						let mechanicId = parseInt(abilityStr, 10);
						enemyCounters.push(context.legionMissionMechanics[mechanicId]);
						continue;
					}
				}
				
				// Fallback
				let mechanicId = parseInt(mechanic.getAttribute("data-mechanic"), 10);
				enemyCounters.push(context.missionMechanics[mechanicId]);
			}
			
			mission.enemies.push(new MissionEnemy(enemyName, enemyCounters));
		}
	}

	/**
	 * 
	 * @param {Mission} mission 
	 * @param {Element} mainContainer 
	 */
	function parseCost(mission, mainContainer) {
		let headingsSize3 = mainContainer.querySelectorAll("h2.heading-size-3");
		
		// Find the icontab that describes the mission cost
		u.getFirstWithOwnText(headingsSize3, "Cost", costHeading => {
			let icontab = costHeading;
			
			do {
				icontab = icontab.nextElementSibling;
			} while (u.tagName(icontab) !== "table" || !icontab.classList.contains("icontab"));
			
			// Mission cost is the quantity of the only item in the icontab
			u.collectItemRewards(icontab, (item, quantity) => mission.cost = quantity);
		});
	}

	/**
	 * 
	 * @param {Mission} mission 
	 * @param {Element} mainContainer 
	 */
	function parseGains(mission, mainContainer) {
		let headingsSize3 = mainContainer.querySelectorAll("h2.heading-size-3");
		let gainsList;
		
		u.getFirstWithOwnText(headingsSize3, "Gains", heading => {
			gainsList = u.findNextElementSibling(heading, el => u.tagName(el) === "ul");
		});
		
		if (gainsList) {
			for (let li of gainsList.getElementsByTagName("li")) {
				let text = u.normalize(li.textContent);
				let maybeXP = u.getRegexGroup(text, "([0-9,]*) experience", 1);
				
				if (maybeXP) {
					mission.followerXP = parseInt(maybeXP.replace(",", ""));
					break;
				}
			}
		}
	}

	/*
	private void parseRewards(final Mission mission, final Element mainContainer) {
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		
		getFirstWithOwnText(headingsSize3, "Rewards", rewardsHeading => {
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
		ParseUtils.collectItemRewards(icontab, (item, quantity) -> {
			if (item.equals(mission.getResourceName())) {
				mission.setBonusResources(quantity);
			} else {
				mission.getBonusItems().add(new ItemReward(item, quantity, mission.getBonusItems().size() + 1));
			}
		});
	}

	private void parseNonItemRewards(final Mission mission, final Elements listItems) {
		// This is a bit messy because Wowhead lumps all rewards together
		for (final Element li : listItems) {
			final String text = li.text();
			final Optional<String> maybeXP = u.getRegexGroup(text, "([0-9,]*) experience", 1);
			
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
		final List<String> infoboxLines = ParseUtils.getInfoboxLines(html, true);
		
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
			
			u.getRegexGroup(infoboxLine, "Level: ([0-9]+)", 1, levelStr => {
				mission.setLevel(Integer.parseInt(levelStr));
			});
			
			u.getRegexGroup(infoboxLine, "Required item level: ([0-9]+)", 1, levelStr => {
				mission.setFollowerItemLevel(Integer.parseInt(levelStr));
			});
			
			u.getRegexGroup(infoboxLine, "Location: (.+)", 1, location => {
				mission.setLocation(location);
			});
			
			u.getRegexGroup(infoboxLine, "Duration: (.+)", 1, duration => {
				mission.setDuration(duration);
			});
			
			u.getRegexGroup(infoboxLine, "Type: (.+)", 1, type => {
				mission.setType(type);
			});

			u.getRegexGroup(infoboxLine, "Category: (.+)", 1, category => {
				mission.setCategory(category);
			});
			
			u.getRegexGroup(infoboxLine, "Class: ([0-9]+)", 1, classId => {
				mission.setCharacterClass(CharacterClass.getById(Integer.parseInt(classId)));
			});
			
			u.getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1, patch => {
				mission.setPatchAdded(Substitutions.getCanonicalPatchVersion(patch));
			});
			
			u.getRegexGroup(infoboxLine, "(?:Followers|Champions|Ships): ([0-9]+)", 1, groupSize => {
				mission.setGroupSize(Integer.parseInt(groupSize));
			});
		}
	}
	*/
}
