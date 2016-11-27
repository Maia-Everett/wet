package org.lucidfox.questfiller.parser;

import static org.lucidfox.questfiller.parser.ParseUtils.collectTextUntilNextTag;
import static org.lucidfox.questfiller.parser.ParseUtils.getFirstWithOwnText;
import static org.lucidfox.questfiller.parser.ParseUtils.getRegexGroup;
import static org.lucidfox.questfiller.parser.ParseUtils.textOf;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.lucidfox.questfiller.model.core.CharacterClass;
import org.lucidfox.questfiller.model.core.Faction;
import org.lucidfox.questfiller.model.core.ItemReward;
import org.lucidfox.questfiller.model.core.Race;
import org.lucidfox.questfiller.model.quest.Quest;

final class QuestParser implements IParser<Quest> {
	// Quest categories for which most quests scale with level
	private static final Set<String> LEGION_SCALING_QUEST_CATEGORIES = new HashSet<>(Arrays.asList(
			"Azsuna", "Val'sharah", "Highmountain", "Stormheim", "Artifact"
	));
	
	private final ParserContext context;
	
	QuestParser(final ParserContext context) {
		this.context = context; 
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
		final int[] categoryIds = ParseUtils.getCategoryIds(html);
		// last number in list is the category id
		final int categoryId = categoryIds[categoryIds.length - 1];
		quest.setCategory(context.getQuestCategory(categoryId));
	}

	private void parseObjectives(final Quest quest, final Element mainContainer, final Element questName) {
		// Objectives section
		Node objectivesNode = questName.nextSibling();
		
		// Objectives text is the first non-empty text node immediately following the header
		while (!(objectivesNode instanceof TextNode) || ((TextNode) objectivesNode).text().trim().isEmpty()) {
			objectivesNode = objectivesNode.nextSibling();
		}
		
		final Node beforeObjectives = objectivesNode.previousSibling();
		
		// If there is a h2.heading-size-3 right before the "objectives" text, it is probably not objectives,
		// but rather progress or completion, like on the quest "Draenei Tail"
		if (!(beforeObjectives instanceof Element && ((Element) beforeObjectives).tagName().equals("h2")
				&& ((Element) beforeObjectives).hasClass("heading-size-3"))) {
			quest.setObjectives(((TextNode) objectivesNode).text().trim());
		}
		
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

			// Suggested players
			final Element suggestedPlayers = stagesTable.getElementsContainingOwnText("Suggested players:").first();
			
			if (suggestedPlayers != null) {
				String playerCountStr =
						getRegexGroup(suggestedPlayers.ownText(), "Suggested players: ([0-9]+)", 1).get();
				quest.setGroupSize(Integer.parseInt(playerCountStr));
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
		// Description section
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		
		getFirstWithOwnText(headingsSize3, "Description").ifPresent(descriptionHeading -> {
			quest.setDescription(collectTextUntilNextTag(descriptionHeading, "h2").trim());
		});
		
		// Progress section
		final Element progressHeading = html.getElementById("lknlksndgg-progress");
		
		if (progressHeading != null) {
			quest.setProgress(textOf(progressHeading));
		} else {
			getFirstWithOwnText(headingsSize3, "Progress").ifPresent(fallbackProgressHeading -> {
				quest.setProgress(collectTextUntilNextTag(fallbackProgressHeading, "h2").trim());
			});
		}
		
		// Completion section
		final Element completionHeading = html.getElementById("lknlksndgg-completion");
		
		if (completionHeading != null) {
			quest.setCompletion(textOf(completionHeading));
		} else {
			getFirstWithOwnText(headingsSize3, "Completion").ifPresent(fallbackCompletionHeading -> {
				quest.setCompletion(collectTextUntilNextTag(fallbackCompletionHeading, "h2").trim());
			});
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
			
			if (icontab.id().equals("dynamic-rewards")) {
				collectItemRewards(icontab, quest.getChoiceRewards());
			} else if (prevNode instanceof TextNode) {
				final String prevText = ((TextNode) prevNode).text();
				
				if (prevText.contains("You will receive:") || prevText.contains("You will also receive:")) {
					collectItemRewards(icontab, quest.getNonChoiceRewards());
				} else if (prevText.contains("You will be able to choose one of these rewards:")) {
					collectItemRewards(icontab, quest.getChoiceRewards());
				} else if (prevText.contains("You will learn:")) {
					collectNonItemRewards(icontab, quest.getAbilityRewards());
				} else if (prevText.contains("The following spell will be cast on you:")) {
					collectNonItemRewards(icontab, quest.getBuffRewards());
				} else if (prevText.trim().isEmpty() && isMoneyRewardSpan(icontab.previousElementSibling())) {
					// This is probably an item tucked at the end after money rewards
					collectItemRewards(icontab, quest.getNonChoiceRewards());
				}
			}
		}
	}
	
	// Convenience collection adapter around ParseUtils.collectItemRewards, which expects a Consumer
	private void collectItemRewards(final Element icontab, final Collection<ItemReward> collector) {
		ParseUtils.collectItemRewards(icontab, collector::add);
	}
	
	private void collectNonItemRewards(final Element icontab, final Collection<String> collector) {
		for (final Element link : icontab.getElementsByTag("a")) {
			collector.add(link.ownText());
		}
	}
	
	private boolean isMoneyRewardSpan(final Element element) {
		return "span".equals(element.tagName()) && element.className().matches(".*money(?:gold|silver|copper).*");
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
		final List<String> infoboxLines = ParseUtils.getInfoboxLines(html);
		
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
			
			getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1).ifPresent(patch -> {
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
}
