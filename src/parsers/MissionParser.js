import { $, $$ } from "../common/shortcuts";
import u from "./utils";
import substitutions from "./substitutions";

import missionEJS from "../templates/mission.ejs";

import Mission from "../model/mission/Mission";
import GarrisonMission from "../model/mission/GarrisonMission";
import NavalMission from "../model/mission/NavalMission";
import ClassHallMission from "../model/mission/ClassHallMission";
import BFAMission from "../model/mission/BFAMission";
import MissionEnemy from "../model/mission/MissionEnemy";
import ItemReward from "../model/core/ItemReward";

// Magic numbers from breadcrumb bar
// const MISSION_SYSTEM_GARRISONS = 21;
const MISSION_SYSTEM_CLASS_HALLS = 30;
const MISSION_UNIT_FOLLOWERS = 1;
const MISSION_UNIT_SHIPS = 2;
const MISSION_UNIT_BFA = 22;

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
		parseRewards(mission, mainContainer);
		parseInfobox(mission);

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
		case MISSION_UNIT_BFA:
			return new BFAMission();
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
	/**
	 * 
	 * @param {Mission} mission 
	 * @param {Element} mainContainer 
	 */
	function parseRewards(mission, mainContainer) {
		let headingsSize3 = mainContainer.querySelectorAll("h2.heading-size-3");
		
		u.getFirstWithOwnText(headingsSize3, "Rewards", rewardsHeading => {
			// Look through everything between Rewards and the next header (or end of parent)
			for (let el = rewardsHeading.nextElementSibling;
					el !== null && !(u.tagName(el) === "h3" && el.classList.contains("heading-size-3"));
					el = el.nextElementSibling) {
				if (u.tagName(el) === "table" && el.classList.contains("icontab")) {
					parseItemRewards(mission, el);
				} else if (u.tagName(el) === "ul") {
					// Non-item rewards
					parseNonItemRewards(mission, el.getElementsByTagName("li"));
				}
			}
		});
	}
	
	/**
	 * 
	 * @param {Mission} mission 
	 * @param {Element} icontab 
	 */
	function parseItemRewards(mission, icontab) {
		u.collectItemRewards(icontab, (item, quantity) => {
			if (item === mission.getResourceName()) {
				mission.bonusResources = quantity;
			} else {
				mission.bonusItems.push(new ItemReward(item, quantity, mission.bonusItems.length + 1));
			}
		});
	}

	/**
	 * 
	 * @param {Mission} mission 
	 * @param {Array.<Element>} listItems
	 */
	function parseNonItemRewards(mission, listItems) {
		// This is a bit messy because Wowhead lumps all rewards together
		for (let li of listItems) {
			let text = u.normalize(li.textContent);
			let maybeXP = u.getRegexGroup(text, "([0-9,]*) experience", 1);
			
			if (maybeXP) {
				mission.bonusXP = parseInt(maybeXP.replace(",", ""));
				continue;
			}
			
			let money = u.getMoney(li);
			
			if (money !== 0) {
				mission.bonusMoney = money;
			}
		}
	}

	function parseInfobox(mission) {
		// Infobox section
		// Pattern-match each infobox line
		for (let infoboxLine of u.getInfoboxLines(true)) {
			if (infoboxLine.startsWith("Rare")) {
				mission.rare = true;
				continue;
			}
			
			if (infoboxLine.startsWith("Exhausting")) {
				mission.exhausting = true;
				continue;
			}
			
			u.getRegexGroup(infoboxLine, "Level: ([0-9]+)", 1, levelStr => {
				mission.level = parseInt(levelStr);
			});
			
			u.getRegexGroup(infoboxLine, "Required item level: ([0-9]+)", 1, levelStr => {
				mission.followerItemLevel = parseInt(levelStr);
			});
			
			u.getRegexGroup(infoboxLine, "Location: (.+)", 1, location => {
				mission.location = location;
			});
			
			u.getRegexGroup(infoboxLine, "Duration: (.+)", 1, duration => {
				mission.duration = duration;
			});
			
			u.getRegexGroup(infoboxLine, "Type: (.+)", 1, type => {
				mission.type = type;
			});

			u.getRegexGroup(infoboxLine, "Category: (.+)", 1, category => {
				if (category === "8.0 - Generic Missions") {
					mission.category = "War Campaign Generic";
				} else if (category.startsWith("8.0")) {
					mission.category = category.replace ("8.0 - ", "War Campaign ");
				} else {
					mission.category = category;
				}
			});
			
			u.getRegexGroup(infoboxLine, "Class: ([0-9]+)", 1, classId => {
				mission.characterClass = context.classes[classId];
			});
			
			u.getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1, patch => {
				mission.patchAdded = substitutions.getCanonicalPatchVersion(patch);
			});
			
			u.getRegexGroup(infoboxLine, "(?:Followers|Champions|Ships): ([0-9]+)", 1, groupSize => {
				mission.groupSize = parseInt(groupSize);
			});
		}
	}
}
