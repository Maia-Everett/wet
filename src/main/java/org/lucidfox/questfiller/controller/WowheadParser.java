package org.lucidfox.questfiller.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.jsoup.select.NodeTraversor;
import org.jsoup.select.NodeVisitor;
import org.lucidfox.questfiller.model.CharacterClass;
import org.lucidfox.questfiller.model.Faction;
import org.lucidfox.questfiller.model.Quest;
import org.lucidfox.questfiller.model.Race;

public final class WowheadParser {
	// Quest categories for which most quests scale with level
	private static final Set<String> LEGION_SCALING_QUEST_CATEGORIES = new HashSet<>(Arrays.asList(
			"Azsuna", "Val'sharah", "Highmountain", "Stormheim", "Artifact"
	));
	
	private final Map<Integer, String> questCategories = new HashMap<>();
	
	public WowheadParser(final Reader localeJsReader) throws IOException {
		// Obtain localization for quest categories
		final String fullScript = new BufferedReader(localeJsReader).lines().collect(Collectors.joining("\n"));
		final String questScript = getRegexGroup(fullScript, "var mn_quests=[^;]+;", 0).get();
		final ScriptEngine js = new ScriptEngineManager().getEngineByName("nashorn");
		
		try {
			// Eval the piece of JS that interests us, then convert the resulting data structure into our map
			js.eval(questScript);
			js.put("questCategories", questCategories);
			
			try (final Reader reader = new InputStreamReader(
					getClass().getResourceAsStream("LocaleCategories.js"), StandardCharsets.UTF_8)) {
				js.eval(reader);
			}
		} catch (final ScriptException e) {
			throw new RuntimeException(e);
		} 
	}
	
	public Quest parse(final Document html) {
		final Quest quest = new Quest();
		
		final String url = html.select("link[rel=canonical]").attr("href");
		final String idStr = getRegexGroup(url, "/quest=([0-9]+)/", 1).get();
		quest.setId(Integer.parseInt(idStr));
		
		final Element mainContainer = html.select("#main-contents div.text").first();
		final Element questName = html.select("h1.heading-size-1").first();
		quest.setName(questName.text());
		
		parseCategory(quest, html);
		parseObjectives(quest, mainContainer, questName);
		parseQuestText(quest, mainContainer, html);
		parseMoney(quest, mainContainer);
		parseRewards(quest, mainContainer);
		parseGains(quest, mainContainer);
		parseInfobox(quest, html);
		parseSeries(quest, html);
		return quest;
	}

	private void parseCategory(final Quest quest, final Document html) {
		// Category taken from breadcrumb, which Wowhead draws with JS :(
		final Optional<String> breadcrumbData = html.getElementsByTag("script")
				.stream()
				.map(Element::data)
				.filter(data -> data.contains("PageTemplate.set({breadcrumb:"))
				.findFirst();
		
		if (!breadcrumbData.isPresent()) {
			return;
		}
		
		// ugh, parsing JS with regexes
		final String regex = Pattern.quote("PageTemplate.set({breadcrumb: [") + "([0-9,-]+)" + Pattern.quote("]});");
		final String[] categoryIds = getRegexGroup(breadcrumbData.get(), regex, 1).get().split(",");
		// last number in list is the category id
		final int questId = Integer.parseInt(categoryIds[categoryIds.length - 1]);
		quest.setCategory(questCategories.get(questId));
	}

	private void parseObjectives(final Quest quest, final Element mainContainer, final Element questName) {
		// Objectives section
		Node objectivesNode = questName.nextSibling();
		
		// Objectives text is the first non-empty text node immediately following the header
		while (!(objectivesNode instanceof TextNode) || ((TextNode) objectivesNode).text().trim().isEmpty()) {
			objectivesNode = objectivesNode.nextSibling();
		}
		
		quest.setObjectives(((TextNode) objectivesNode).text());
		
		// Objective completion stages
		final Elements iconlists = mainContainer.select("table.iconlist");
		final Element stagesTable = iconlists.first();
		
		if (stagesTable != null) {
			// Remove any subtables
			stagesTable.select("table.iconlist").remove();
			
			for (final Element stageLink : stagesTable.getElementsByTag("a")) {
				// Find the innermost td element enclosing the a, and add its whole text
				Element parent = stageLink.parent();
				
				while (!parent.tagName().equals("td")) {
					parent = parent.parent();
				}
				
				quest.getStages().add(parent.text());
			}
		}
		
		// Provided items
		if (iconlists.size() >= 2) {
			final Element maybeProvided = iconlists.get(1);
			final Node before = maybeProvided.previousSibling();
			
			if (before instanceof TextNode && ((TextNode) before).text().contains("Provided")) {
				maybeProvided.select("table.iconlist").remove();
				
				for (final Element itemLink : maybeProvided.getElementsByTag("a")) {
					quest.getProvidedItems().add(itemLink.text());
				}
			}
		}
	}

	private void parseQuestText(final Quest quest, final Element mainContainer, final Document html) {
		// Description is messy
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		final Element descriptionHeading = headingsSize3.stream()
				.filter(el -> el.text().equals("Description")).findFirst().get();
		
		final StringBuilder description = new StringBuilder();
		
		for (Node node = descriptionHeading.nextSibling();
				!(node instanceof Element && ((Element) node).tagName().equals("h2"));
				node = node.nextSibling()) {
			if (node instanceof TextNode) {
				description.append(((TextNode) node).text());
			} else if (node instanceof Element && ((Element) node).tagName().equals("br")) {
				description.append("\n");
			}
		}
		
		quest.setDescription(description.toString().trim());
		
		// Progress section
		final Element progressHeading = html.getElementById("lknlksndgg-progress");
		
		if (progressHeading != null) {
			quest.setProgress(textOf(progressHeading));
		}
		
		// Completion section
		final Element completionHeading = html.getElementById("lknlksndgg-completion");
		
		if (completionHeading != null) {
			quest.setCompletion(textOf(completionHeading));
		}
	}
		
	private void parseMoney(final Quest quest, final Element mainContainer) {
		// Money rewards
		final List<Element> allMoneyElements = new ArrayList<Element>();
		allMoneyElements.addAll(mainContainer.select("span.moneygold"));
		allMoneyElements.addAll(mainContainer.select("span.moneysilver"));
		allMoneyElements.addAll(mainContainer.select("span.moneycopper"));
		
		// Find the leftmost money element (so we parse only the first group - second group is max level rewards)
		if (!allMoneyElements.isEmpty()) {
			int money = 0;
			Element leftEl = null;
			
			for (final Element el: allMoneyElements) {
				if (leftEl == null || el.siblingIndex() < leftEl.siblingIndex()) {
					leftEl = el;
				}
			}
			
			// Parse all directly adjacent span nodes, possibly with whitespace in between
			for (Node node = leftEl;
					(node instanceof Element && ((Element) node).tagName().equals("span"))
						|| (node instanceof TextNode && ((TextNode) node).text().trim().isEmpty());
					node = node.nextSibling()) {
				if (!(node instanceof Element)) {
					continue;
				}
				
				final Element el = (Element) node;
				
				if (el.hasClass("moneygold")) {
					money += Integer.parseInt(el.ownText()) * 10000;
				} else if (el.hasClass("moneysilver")) {
					money += Integer.parseInt(el.ownText()) * 100;
				} else if (el.hasClass("moneycopper")) {
					money += Integer.parseInt(el.ownText());
				}
			}
			
			quest.setMoney(money);
		}
	}
		
	private void parseRewards(final Quest quest, final Element mainContainer) {
		// Non-money rewards
		final Elements icontabs = mainContainer.select("table.icontab.icontab-box");
		
		for (final Element icontab : icontabs) {
			final Node prevNode = icontab.previousSibling();
			final List<String> rewardList;
			
			if (icontab.id().equals("dynamic-rewards")) {
				rewardList = quest.getChoiceRewards();
			} else if (prevNode instanceof TextNode) {
				final String prevText = ((TextNode) prevNode).text();
				
				if (prevText.contains("You will receive:") || prevText.contains("You will also receive:")) {
					rewardList = quest.getNonChoiceRewards();
				} else if (prevText.contains("You will be able to choose one of these rewards:")) {
					rewardList = quest.getChoiceRewards();
				} else if (prevText.contains("You will learn:")) {
					rewardList = quest.getAbilityRewards();
				} else if (prevText.contains("The following spell will be cast on you:")) {
					rewardList = quest.getBuffRewards();
				} else {
					continue; // unknown icontab type
				}
			} else {
				continue; // unknown icontab type
			}
			
			// Parse the icontab
			for (final Element link : icontab.getElementsByTag("a")) {
				rewardList.add(link.ownText());
			}
		}
	}
		
	private void parseGains(final Quest quest, final Element mainContainer) {
		// Gains section
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		final Optional<Element> gains = headingsSize3.stream()
				.filter(el -> el.text().equals("Gains")).findFirst();
		
		if (gains.isPresent()) {
			Node gainsData = gains.get().nextSibling();
			
			while (!(gainsData instanceof Element && ((Element) gainsData).tagName().equals("ul"))) {
				gainsData = gainsData.nextSibling();
			}
			
			Elements divs = ((Element) gainsData).getElementsByTag("div");
			int firstNonXPDiv;
			
			if (divs.first().ownText().contains("experience")) {
				firstNonXPDiv = 1;
				final String xpValue = getRegexGroup(divs.first().ownText(), "([0-9,]*) experience", 1).get();
				quest.setExperience(Integer.parseInt(xpValue.replace(",", "")));
			} else {
				firstNonXPDiv = 0;
			}
			
			for (int i = firstNonXPDiv; i < divs.size(); i++) {
				final Element div = divs.get(i);
				
				if (div.ownText().contains("reputation with")) {
					final String repValue = div.getElementsByTag("span").first().ownText();
					final String faction = div.getElementsByTag("a").first().ownText();
					quest.getReputationGains().put(faction, Integer.parseInt(repValue.replace(",", "")));
				} else {
					// Non-reputation gain
					quest.getOtherGains().add(div.text());
				}
			}
		}
	}
	
	private void parseInfobox(final Quest quest, final Document html) {
		// Infobox section
		final Optional<String> infoboxData = html.getElementsByTag("script")
				.stream()
				.map(Element::data)
				.filter(data -> data.contains("Markup.printHtml"))
				.findFirst();
		
		if (!infoboxData.isPresent()) {
			return;
		}
		
		final String infoboxMarkup = getRegexGroup(infoboxData.get(), "Markup\\.printHtml\\('([^']*)'", 1).get();
		final List<String> infoboxLines = unescapeInfoboxMarkup(infoboxMarkup);
		
		// Pattern-match each infobox line
		for (final String infoboxLine : infoboxLines) {
			getRegexGroup(infoboxLine, "Level: ([0-9]+)", 1).ifPresent(levelStr -> {
				quest.setLevel(Integer.parseInt(levelStr));
			});
			
			getRegexGroup(infoboxLine, "Requires level ([0-9]+)", 1).ifPresent(levelStr -> {
				quest.setLevelRequired(Integer.parseInt(levelStr));
			});
			
			getRegexGroup(infoboxLine, "Type: (.+)", 1).ifPresent(type -> {
				if (type.equals("Artifact")) {
					// This is what wowpedia uses
					quest.setType("Legendary");
				} else {
					quest.setType(type);
				}
			});
			
			getRegexGroup(infoboxLine, "Side: (.+)", 1).ifPresent(side -> {
				switch (side) {
				case "Alliance":
					quest.setFaction(Faction.ALLIANCE);
					break;
				case "Horde":
					quest.setFaction(Faction.HORDE);
					break;
				case "Both":
					quest.setFaction(Faction.NEUTRAL);
					break;
				default:
					System.err.printf("Unknown side %s\n", side);
					// Unknown faction
					quest.setFaction(null);
					break;
				}
			});
			
			getRegexGroup(infoboxLine, "Race: ([0-9]+)", 1).ifPresent(raceId -> {
				quest.setRace(Race.getById(Integer.parseInt(raceId)));
			});
			
			getRegexGroup(infoboxLine, "Class: ([0-9]+)", 1).ifPresent(classId -> {
				quest.setCharacterClass(CharacterClass.getById(Integer.parseInt(classId)));
			});
			
			getRegexGroup(infoboxLine, "Start: (.+)", 1).ifPresent(startEntity -> {
				quest.setStartEntity(startEntity);
			});
			
			getRegexGroup(infoboxLine, "End: (.+)", 1).ifPresent(finishEntity -> {
				quest.setFinishEntity(finishEntity);
			});
			
			getRegexGroup(infoboxLine, "Added in patch (.+)", 1).ifPresent(patch -> {
				quest.setPatchAdded(PatchVersions.getCanonicalVersion(patch));
			});
			
			if ("Repeatable".equals(infoboxLine)) {
				quest.setRepeatable(true);
			} else if ("Sharable".equals(infoboxLine)) {
				quest.setShareable(true);
			} else if ("Not sharable".equals(infoboxLine)) {
				quest.setShareable(false);
			}
			
			// If we still don't know the level, and it's a Legion quest, its level probably scales
			if (quest.getLevel() == null && LEGION_SCALING_QUEST_CATEGORIES.contains(quest.getCategory())) {
				quest.setLevel(100);
			}
		}
	}
	
	private void parseSeries(final Quest quest, final Document html) {
		// Try to determine previous and next quests
		final Element seriesTable = html.select("#sidebar table.series").first();
		
		if (seriesTable == null) {
			return;
		}
		
		// Find the table cell with the current quest, in bold
		final Element ourQuestItem = seriesTable.getElementsByTag("b").first();
		Element ourQuestCell = ourQuestItem.parent();
		
		while (!ourQuestCell.tagName().equals("td")) {
			ourQuestCell = ourQuestCell.parent();
		}
		
		// Find where in the table it is
		final Elements questCells = seriesTable.getElementsByTag("td");
		final int ourQuestIndex = questCells.indexOf(ourQuestCell);
		
		if (ourQuestIndex > 0) {
			final String[] previousQuests = textOf(questCells.get(ourQuestIndex - 1)).split("\n");
			Stream.of(previousQuests).forEach(quest.getPreviousQuests()::add);
		}
		
		if (ourQuestIndex < questCells.size() - 1) {
			final String[] nextQuests = textOf(questCells.get(ourQuestIndex + 1)).split("\n");
			Stream.of(nextQuests).forEach(quest.getNextQuests()::add);
		}
	}
	// Utility methods
	
	private List<String> unescapeInfoboxMarkup(final String infoboxMarkup) {
		// Convert \xNN escape sequences to their corresponding characters
		final Matcher matcher = Pattern.compile("\\\\x([0-9A-Z]{2})").matcher(infoboxMarkup);
		final StringBuffer sb = new StringBuffer();
		
		while (matcher.find()) {
			final String hex = matcher.group(1);
			matcher.appendReplacement(sb, Character.toString((char) Integer.parseInt(hex, 16)));
		}
		
		matcher.appendTail(sb);
		
		// We'll get BBCode, convert it to a list of plain text lines
		return Stream.of(sb.toString().split(Pattern.quote("[/li][li]")))
				.flatMap(line -> Stream.of(line.split(Pattern.quote("[br]"))))
				.map(line -> line.replaceAll("\\[(?:race|class)=([0-9]+)\\]", "$1")) // replace [race/class=X] with X
				.map(line -> line.replaceAll("\\[[^\\]]+\\]", ""))          // remove all square bracket tags
				.collect(Collectors.toList());
	}

	private Optional<String> getRegexGroup(final String str, final String regex, final int group) {
		final Matcher matcher = Pattern.compile(regex).matcher(str);
		
		if (!matcher.find()) {
			return Optional.empty();
		}
		
		return Optional.of(matcher.group(group));
	}
	
	private String textOf(final Element el) {
		final StringBuilder accum = new StringBuilder();
		new NodeTraversor(new NodeVisitor() {
			public void head(final Node node, final int depth) {
				if (node instanceof TextNode) {
					TextNode textNode = (TextNode) node;
					accum.append(textNode.text());
				} else if (node instanceof Element) {
					Element element = (Element) node;
					if (element.tag().getName().equals("br")) {
						accum.append("\n");
					}
				}
			}

			public void tail(final Node node, final int depth) {
			}
		}).traverse(el);
		return accum.toString().trim();
	}
	
	public static void main(final String[] args) throws IOException {
		final String localeEnus = "http://wow.zamimg.com/js/locale_enus.js";
		final WowheadParser parser;
		
		try (final Reader reader = new InputStreamReader(new URL(localeEnus).openStream(), StandardCharsets.UTF_8)) {
			parser = new WowheadParser(reader);
		}
		
		final String url = "http://www.wowhead.com/quest=28724/iverrons-antidote";
		final Document doc = Jsoup.connect(url).get();
		final Quest quest = parser.parse(doc);
		System.out.println(quest.dump());
		System.out.println();
		System.out.println(" ----------------------------------- ");
		System.out.println();
		System.out.println(new ArticleFormatter().format(quest));
	}
}
