import { $, $$ } from "../common/shortcuts";
import u from "./utils";
import substitutions from "./substitutions";

import npcEJS from "../templates/npc.ejs";

import NPC from "../model/npc/NPC";
import NPCQuest from "../model/npc/NPCQuest";
import SoldItem from "../model/npc/SoldItem";

/**
 * @param {ParserContext} context 
 */
export default function NPCParser(context) {
	this.context = context;
	this.templatePrefix = "n";
	this.template = npcEJS;

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
		/*
		parseQuotes(npc, mainContainer);
		parseHealth(npc);
		parseInfobox(npc);
		*/

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
			// parseSounds(npc, script.textContent);
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
	
	/*
	private void parseSounds(final NPC npc, final String script) {
		getRegexGroup(script, "new Listview\\(\\{template: 'sound', id: 'sounds', (.*)\\);", 1).ifPresent(s -> {
			// First, try to determine both race and gender from the attack sound
			final Pattern raceGenderPattern =
					Pattern.compile("\"name\":\"([A-Za-z0-9_]+)"
							+ "(Male|Female|_MALE|_FEMALE)"
							+ "[A-Za-z0-9_]*"
							+ "(?:Attack|ATTACK)\"");
			final Matcher matcher = raceGenderPattern.matcher(s);	
			
			if (matcher.find()) {
				npc.setRace(normalizeRaceName(matcher.group(1)));
				
				switch (matcher.group(2)) {
				case "_MALE":
					npc.setGender("Male");
					break;
				case "_FEMALE":
					npc.setGender("Female");
					break;
				default:
					npc.setGender(matcher.group(2));
					break;
				}
			} else {
				// Try to determine just race
				getRegexGroup(s, "\"name\":\"([A-Za-z0-9_]+)(?:Attack|ATTACK)\"", 1).ifPresent(race -> {
					npc.setRace(normalizeRaceName(race));
				});
			}
		});
	}
	
	private static String normalizeRaceName(final String raceName) {
		final String transformed = raceName
				.replace("Player", "")
				.replaceAll("^MON_", "")
				.replaceAll("^VO_[0-9]*", "");
		
		if (transformed.isEmpty()) {
			return "";
		} else if (transformed.matches("[A-Z0-9_]+")) {
			// Convert UPPERCASE_WITH_UNDERSCORES_CONVENTION to normal name (e.g. FROST_NYMPH -> Frost nymph)
			final char[] src = transformed.replace('_', ' ').trim().toCharArray();
			final StringBuilder sb = new StringBuilder();
			sb.append(src[0]);
			
			for (int i = 1; i < src.length; i++) {
				char ch = src[i];
				
				// Convert every uppercase character except the first to lowercase, and every underscore to space
				if (ch >= 'A' && ch <= 'Z') {
					sb.append(Character.toLowerCase(ch));
				} else {
					sb.append(ch);
				}
			}
			
			return sb.toString();
		} else {
			// Convert CamelCase to normal name (e.g. NightElf -> Night elf)
			final char[] src = transformed.replace("_", "").toCharArray();
			
			if (src.length == 0) {
				return "";
			}
			
			final StringBuilder sb = new StringBuilder();
			sb.append(src[0]);
			
			for (int i = 1; i < src.length; i++) {
				char ch = src[i];
				
				// Convert every uppercase character into a pair of space + lowercase
				if (ch >= 'A' && ch <= 'Z') {
					sb.append(' ');
					sb.append(Character.toLowerCase(ch));
				} else {
					sb.append(ch);
				}
			}
			
			return sb.toString();
		}
	}
	
	private void parseQuotes(final NPC npc, final Element mainContainer) {
		final Optional<Element> quotesDiv = mainContainer.select("a.disclosure-off")
				.stream()
				.filter(link -> link.text().contains("Quotes"))
				.findFirst()
				.map(Element::parent) // step from a to its parent h2
				.flatMap(quotesEl -> ParseUtils.findNextElementSibling(quotesEl, el -> "div".equals(el.tagName())));
		
		quotesDiv.ifPresent(div -> {
			npc.setQuotes(div.select("span.s2")
					.stream()
					.map(Element::text)
					.map(quote -> quote.replaceAll("^.+ says: ", ""))
					.collect(Collectors.toList()));
		});
	}
	
	private void parseHealth(final NPC npc, final Document html) {
		html.getElementsByTag("script")
				.stream()
				.map(Element::data)
				.filter(data -> data.contains("Health: "))
				.findFirst()
				.flatMap(data -> getRegexGroup(data, "Health: ([0-9,]+)", 1))
				.ifPresent(health -> {
					npc.setHealth(Long.parseLong(health.replace(",", "")));
				});
	}

	private void parseInfobox(final NPC npc, final Document html) {
		// Infobox section
		final List<String> infoboxLines = ParseUtils.getInfoboxLines(html, false);
		infoboxLines.forEach(System.out::println);
		
		// Pattern-match each infobox line
		for (final String infoboxLine : infoboxLines) {
			getRegexGroup(infoboxLine, "Level: (.+)", 1).ifPresent(levelStr -> {
				final Pattern levelRegex = Pattern.compile("([^ ]+)(?: - ([0-9]+))?");
				final Matcher matcher = levelRegex.matcher(levelStr);
				
				if (matcher.find()) {
					npc.setLevelLow(matcher.group(1));
					npc.setLevelHigh(matcher.group(2));
				}
			});
			
			getRegexGroup(infoboxLine, "Classification: (.+)", 1).ifPresent(levelClassification -> {
				npc.setLevelClassification(levelClassification);
			});

			getRegexGroup(infoboxLine, "React: (.+)", 1).ifPresent(reaction -> {
				getRegexGroup(reaction, "<q([^>]*)>A", 1).ifPresent(colorId -> {
					npc.setAllianceReaction(Reaction.getByColor(colorId));
				});

				getRegexGroup(reaction, "<q([^>]*)>H", 1).ifPresent(colorId -> {
					npc.setHordeReaction(Reaction.getByColor(colorId));
				});
			});
			
			getRegexGroup(infoboxLine, "Faction: (.+)", 1).ifPresent(repFaction -> {
				npc.setRepFaction(repFaction);
			});
			
			getRegexGroup(infoboxLine, "Tameable \\((.+)\\)", 1).ifPresent(petFamily -> {
				npc.setPetFamily(petFamily);
			});
			
			getRegexGroup(infoboxLine, "Worth: ([0-9]+)", 1).ifPresent(money -> {
				npc.setMoney(Integer.parseInt(money));
			});
			
			getRegexGroup(infoboxLine, "Mana: ([0-9,]+)", 1).ifPresent(mana -> {
				npc.setMana(Long.parseLong(mana.replace(",", "")));
			});

			getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1).ifPresent(patch -> {
				npc.setPatchAdded(Substitutions.getCanonicalPatchVersion(patch));
			});
		}
	}
	*/
}
