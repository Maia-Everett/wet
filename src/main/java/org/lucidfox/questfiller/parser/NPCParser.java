package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.lucidfox.questfiller.model.npc.CreatureType;
import org.lucidfox.questfiller.model.npc.NPC;
import org.lucidfox.questfiller.model.npc.NPCQuest;
import org.lucidfox.questfiller.model.npc.Reaction;
import org.lucidfox.questfiller.model.npc.SoldItem;

final class NPCParser implements IParser<NPC> {
	// private final ParserContext context;
	
	NPCParser(final ParserContext context) {
		// this.context = context;
	}
	
	public NPC parse(final Document html) {
		final NPC npc = new NPC();
		
		final String url = html.select("link[rel=canonical]").attr("href");
		final String idStr = getRegexGroup(url, "/npc=([0-9]+)/", 1).get();
		npc.setId(Integer.parseInt(idStr));
		
		final Element mainContainer = html.select("#main-contents div.text").first();
		final String npcName = mainContainer.select("h1.heading-size-1").first().text();
		
		npc.setName(npcName.replaceAll("<.*>", "").trim());
		
		// If we have a title
		getRegexGroup(npcName, "<(.*)>", 1).ifPresent(title -> {
			npc.setTitle(title);
		});
		
		parseCreatureType(npc, html);
		parseLocation(npc, mainContainer);
		parseLists(npc, html);
		parseQuotes(npc, mainContainer);
		parseHealth(npc, html);
		parseInfobox(npc, html);
		return npc;
	}
	
	private void parseCreatureType(final NPC npc, final Document html) {
		final int[] categoryIds = ParseUtils.getCategoryIds(html);
		// third number in list is the creature type id
		final int creatureTypeId = categoryIds[2];
		npc.setCreatureType(CreatureType.getById(creatureTypeId));
	}
	
	private void parseLocation(final NPC npc, final Element mainContainer) {
		final Elements locationLinks = mainContainer.select("#locations a");
		
		if (!locationLinks.isEmpty()) {
			npc.setLocation(locationLinks.first().text());
		}
	}
	
	private void parseLists(final NPC npc, final Document html) {
		final Optional<String> listViewScript = html.getElementsByTag("script")
				.stream()
				.map(Element::data)
				.filter(data -> data.contains("new Listview"))
				.findFirst();
		
		listViewScript.ifPresent(script -> {
			parseQuests(npc, script);
			parseItems(npc, script);
			parseSounds(npc, script);
		});
	}
	
	private void parseQuests(final NPC npc, final String script) {
		final Set<String> startsQuests = new HashSet<>();
		
		getRegexGroup(script, "new Listview\\(\\{template: 'quest', id: 'starts', (.*)\\);", 1).ifPresent(s -> {
			addQuests(startsQuests, s);
		});
		
		final Set<String> finishesQuests = new HashSet<>();
		
		getRegexGroup(script, "new Listview\\(\\{template: 'quest', id: 'ends', (.*)\\);", 1).ifPresent(s -> {
			addQuests(finishesQuests, s);
		});
		
		// Split all quests into three groups: starts, finishes, both 
		final Set<String> startsAndFinishesQuests = new HashSet<>(startsQuests);
		startsAndFinishesQuests.retainAll(finishesQuests);
		startsQuests.removeAll(startsAndFinishesQuests);
		finishesQuests.removeAll(startsAndFinishesQuests);
		
		final List<NPCQuest> quests = new ArrayList<>();
		
		for (final String quest : startsAndFinishesQuests) {
			quests.add(new NPCQuest(quest, true, true));
		}
		
		for (final String quest : startsQuests) {
			quests.add(new NPCQuest(quest, true, false));
		}
		
		for (final String quest : finishesQuests) {
			quests.add(new NPCQuest(quest, false, true));
		}
		
		Collections.sort(quests);
		npc.setQuests(quests);
	}
	
	private void addQuests(final Collection<String> quests, final String jsPart) {
		// Extract the name field from every quest in the list
		final Matcher matcher = Pattern.compile("\"name\":\"([^\"]+)\"").matcher(jsPart);
		
		while (matcher.find()) {
			quests.add(matcher.group(1));
		}
	}
	
	private void parseItems(final NPC npc, final String script) {
		getRegexGroup(script, "new Listview\\(\\{template: 'item', id: 'sells', (.*)\\);", 1).ifPresent(s -> {
			final List<SoldItem> soldItems = new ArrayList<>();
			final Pattern pattern = Pattern.compile("\"name\":\"[0-9]([^\"]+)\",[^\\}]+,cost:\\[([0-9]+),");
			final Matcher matcher = pattern.matcher(s);
			
			while (matcher.find()) {
				soldItems.add(new SoldItem(matcher.group(1), Integer.parseInt(matcher.group(2))));
			}
			
			Collections.sort(soldItems);
			npc.setItemsSold(soldItems);
		});
	}
	
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
}
