import { $, $$ } from "../common/shortcuts";
import u from "./utils";
import substitutions from "./substitutions";

import npcEJS from "../templates/npc.ejs";

import NPC from "../model/npc/NPC";
import NPCQuest from "../model/npc/NPCQuest";
import SoldItem from "../model/npc/SoldItem";
import Reaction from "../model/npc/Reaction";

/**
 * @param {ParserContext} context 
 */
export default function NPCParser(context) {
	this.context = context;
	this.templatePrefix = "n";
	this.template = npcEJS;

	/**
	 * @return {NPC}
	 */
	this.parse = function() {
		let npc = new NPC();
		
		let url = $("link[rel=canonical]").getAttribute("href");
		let idStr = u.getRegexGroup(url, "/npc=([0-9]+)/", 1);
		npc.id = parseInt(idStr, 10);
		
		let mainContainer = $("#main-contents > div.text");
		let npcName = mainContainer.querySelector("h1.heading-size-1").textContent;
		
		npc.name = npcName.replace(/<.*>/g, "").trim();
		
		// If we have a title
		u.getRegexGroup(npcName, "<(.*)>", 1, title => {
			npc.title = title;
		});
		
		parseCreatureType(npc);
		parseLocation(npc, mainContainer);
		parseLists(npc);
		parseQuotes(npc, mainContainer);
		parseHealth(npc);
		parseInfobox(npc);

		return npc;
	}

	/**
	 * @param {NPC} npc 
	 */
	function parseCreatureType(npc) {
		let categoryIds = u.getCategoryIds();
		// third number in list is the creature type id
		let creatureTypeId = categoryIds[2];
		npc.creatureType = context.npcTypes[creatureTypeId.toString()];
	}
	
	/**
	 * @param {NPC} npc 
	 * @param {Element} mainContainer
	 */
	function parseLocation(npc, mainContainer) {
		let locationLink = mainContainer.querySelector("#locations a");
		
		if (locationLink) {
			npc.location = locationLink.textContent;
		}
	}
	
	/**
	 * @param {NPC} npc 
	 */
	function parseLists(npc) {
		u.getElementContainingOwnText(document, "script", "new Listview", script => {
			parseQuests(npc, script.textContent);
			parseItems(npc, script.textContent);
			parseSounds(npc, script.textContent);
		});
	}
	
	/**
	 * @param {NPC} npc 
	 * @param {string} script
	 */
	function parseQuests(npc, script) {
		let startsQuests = new Set();
		
		u.getRegexGroup(script, "new Listview\\(\\{template: 'quest', id: 'starts', (.*)\\);", 1, s => {
			addQuests(startsQuests, s);
		});
		
		let finishesQuests = new Set();
		
		u.getRegexGroup(script, "new Listview\\(\\{template: 'quest', id: 'ends', (.*)\\);", 1, s => {
			addQuests(finishesQuests, s);
		});
		
		// Split all quests into three groups: starts, finishes, both 
		let startsAndFinishesQuests = new Set();
		
		for (let quest of startsQuests) {
			if (finishesQuests.has(quest)) {
				startsAndFinishesQuests.add(quest);
			}
		}

		for (let quest of startsAndFinishesQuests) {
			startsQuests.delete(quest);
			finishesQuests.delete(quest);
		};
		
		let quests = [];
		
		for (let quest of startsAndFinishesQuests) {
			quests.push(new NPCQuest(quest, true, true));
		}
		
		for (let quest of startsQuests) {
			quests.push(new NPCQuest(quest, true, false));
		}
		
		for (let quest of finishesQuests) {
			quests.push(new NPCQuest(quest, false, true));
		}
		
		quests.sort((q1, q2) => q1.compareTo(q2));
		npc.quests = quests;
	}
	
	/**
	 * 
	 * @param {Set} quests 
	 * @param {string} jsPart 
	 */
	function addQuests(quests, jsPart) {
		// Extract the name field from every quest in the list
		let regex = /"name":"([^"]+)"/g;
		let match;
		
		while ((match = regex.exec(jsPart)) !== null) {
			quests.add(match[1]);
		}
	}
	
	/**
	 * @param {NPC} npc 
	 * @param {string} script
	 */
	function parseItems(npc, script) {
		u.getRegexGroup(script, /new Listview\(\{template: 'item', id: 'sells', (.*)\);/, 1, s => {
			let soldItems = [];
			let regex = /"name":"[0-9]([^"]+)".+?cost:\[([0-9]+)/g;
			let match;
			
			while ((match = regex.exec(s)) !== null) {
				soldItems.push(new SoldItem(match[1], parseInt(match[2])));
			}
			
			soldItems.sort((s1, s2) => s1.compareTo(s2));
			npc.itemsSold = soldItems;
		});
	}
	
	/**
	 * @param {NPC} npc 
	 * @param {string} script
	 */
	function parseSounds(npc, script) {
		u.getRegexGroup(script, "new Listview\\(\\{template: 'sound', id: 'sounds', (.*)\\);", 1, s => {
			// First, try to determine both race and gender from the attack sound
			let raceGenderPattern = new RegExp(
					"\"name\":\"([A-Za-z0-9_]+)"
					+ "(Male|Female|_MALE|_FEMALE)"
					+ "[A-Za-z0-9_]*"
					+ "(?:Attack|ATTACK)\"");
			
			let match = s.match(raceGenderPattern);

			if (match) {
				npc.race = normalizeRaceName(match[1]);
				
				switch (match[2]) {
				case "_MALE":
					npc.gender = "Male";
					break;
				case "_FEMALE":
					npc.gender = "Female";
					break;
				default:
					npc.gender = match[2];
					break;
				}
			} else {
				// Try to determine just race
				u.getRegexGroup(s, "\"name\":\"([A-Za-z0-9_]+)(?:Attack|ATTACK)\"", 1, race => {
					npc.race = normalizeRaceName(race);
				});
			}
		});
	}
	
	/**
	 * 
	 * @param {string} raceName 
	 */
	function normalizeRaceName(raceName) {
		let transformed = raceName
				.replace(/Player/g, "")
				.replace(/^MON_/, "")
				.replace(/^VO_[0-9]*/, "");
		
		if (transformed.length === 0) {
			return "";
		} else if (/^[A-Z0-9_]+$/.test(transformed)) {
			// Convert UPPERCASE_WITH_UNDERSCORES_CONVENTION to normal name (e.g. FROST_NYMPH -> Frost nymph)
			// Convert every uppercase character except the first to lowercase, and every underscore to space
			let src = transformed.replace(/_/g, " ").trim();
			
			if (src.length === 0) {
				return "";
			}
			
			return src.charAt(0) + src.substring(1).toLowerCase();
		} else {
			// Convert CamelCase to normal name (e.g. NightElf -> Night elf)
			let src = transformed.replace(/_/g, "");
			
			if (src.length === 0) {
				return "";
			}
			
			return src.charAt(0) + src.substring(1).replace(/[A-Z]/g, ch => " " + ch.toLowerCase());
		}
	}
	
	/**
	 * @param {NPC} npc 
	 * @param {Element} mainContainer
	 */
	function parseQuotes(npc, mainContainer) {
		let quotesDiv = null;

		for (let link of mainContainer.querySelectorAll("a.disclosure-off")) {
			if (link.textContent.includes("Quotes")) {
				let quotesEl = u.findNextElementSibling(link.parentElement, el => u.tagName(el) === "div");

				if (quotesEl !== null) {
					quotesDiv = quotesEl;
					break;
				}
			}
		}

		if (quotesDiv !== null) {
			npc.quotes = Array.from(quotesDiv.querySelectorAll("span.s2"))
					.map(el => el.textContent.replace(/^.+ says: /g, ""));
		};
	}
	
	/**
	 * @param {NPC} npc
	 */
	function parseHealth(npc) {
		u.getElementContainingOwnText(document, "script", "Health: ", script => {
			u.getRegexGroup(script.textContent, "Health: ([0-9,]+)", 1, health => {
				npc.health = parseInt(health.replace(/,/g, ""));
			});
		});
	}
	
	/**
	 * @param {NPC} npc
	 */
	function parseInfobox(npc) {
		// Infobox section
		// Pattern-match each infobox line
		for (let infoboxLine of u.getInfoboxLines(false)) {
			u.getRegexGroup(infoboxLine, "Level: (.+)", 1, levelStr => {
				let match = levelStr.match(/([^ ]+)(?: - ([0-9]+))?/);
				
				if (match) {
					npc.levelLow = match[1];
					npc.levelHigh = match[2];
				}
			});
			
			u.getRegexGroup(infoboxLine, "Classification: (.+)", 1, levelClassification => {
				npc.levelClassification = levelClassification;
			});

			u.getRegexGroup(infoboxLine, "React: (.+)", 1, reaction => {
				u.getRegexGroup(reaction, "<q([^>]*)>A", 1, colorId => {
					npc.allianceReaction = Reaction.getByColor(colorId);
				});

				u.getRegexGroup(reaction, "<q([^>]*)>H", 1, colorId => {
					npc.hordeReaction = Reaction.getByColor(colorId);
				});
			});
			
			u.getRegexGroup(infoboxLine, "Faction: (.+)", 1, repFaction => {
				npc.repFaction = repFaction;
			});
			
			u.getRegexGroup(infoboxLine, "Tameable \\((.+)\\)", 1, petFamily => {
				npc.petFamily = petFamily;
			});
			
			u.getRegexGroup(infoboxLine, "Worth: ([0-9]+)", 1, money => {
				npc.money = parseInt(money);
			});
			
			u.getRegexGroup(infoboxLine, "Mana: ([0-9,]+)", 1, mana => {
				npc.mana = parseInt(mana.replace(/,/g, ""));
			});

			u.getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1, patch => {
				npc.patchAdded = substitutions.getCanonicalPatchVersion(patch);
			});
		}
	}

	
}
