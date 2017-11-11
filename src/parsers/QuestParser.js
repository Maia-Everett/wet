import { $, $$ } from "../common/shortcuts";
import u from "./utils";
import Quest from "../model/quest/Quest";

const LEGION_SCALING_QUEST_CATEGORIES = new Set([
	"Azsuna", "Val'sharah", "Highmountain", "Stormheim", "Artifact"
]);

/**
 * @return {Quest}
 */
export default function QuestParser(context) {
	this.parse = function() {
		let quest = new Quest();
		
		let url = $("link[rel=canonical]").getAttribute("href");
		let idStr = u.getRegexGroup(url, "/quest=([0-9]+)/", 1);
		quest.id = parseInt(idStr);
		
		let mainContainer = $("#main-contents > div.text");
		let questName = $("h1.heading-size-1");
		quest.name = questName.textContent;
		
		parseCategory(quest);
		parseObjectives(quest, mainContainer, questName);
		parseQuestText(quest, mainContainer);
		/*
		parseMoney(quest, mainContainer);
		parseRewards(quest, mainContainer);
		parseGains(quest, mainContainer);
		parseInfobox(quest);
		parseSeries(quest, mainContainer);
		parseRemoved(quest, mainContainer);
		*/

		return quest;
	}

	function parseCategory(quest) {
		let categoryIds = u.getCategoryIds();
		let categoryId = categoryIds[categoryIds.length - 1];
		quest.category = context.questCategories[categoryId];
	}

	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 * @param {Element} questName 
	 */
	function parseObjectives(quest, mainContainer, questName) {
		// Objectives section
		let objectivesNode = questName.nextSibling;
		
		// Objectives text is the first non-empty text node immediately following the header
		while (!(objectivesNode instanceof Text) || objectivesNode.data.trim().length === 0) {
			objectivesNode = objectivesNode.nextSibling;
		}
		
		let beforeObjectives = objectivesNode.previousSibling;
		
		// If there is a h2.heading-size-3 right before the "objectives" text, it is probably not objectives,
		// but rather progress or completion, like on the quest "Draenei Tail"
		if (!(beforeObjectives instanceof Element && u.tagName(beforeObjectives) === "h2")
				&& beforeObjectives.classList.contains("heading-size-3")) {
			quest.objectives = objectivesNode.data.trim();
		}
		
		// Objective completion stages
		let iconlists = mainContainer.querySelectorAll("table.iconlist");
		
		if (iconlists.length > 0) {
			let stagesTable = iconlists[0];

			// Remove any subtables
			for (let element of stagesTable.querySelectorAll("table.iconlist")) {
				element.parentElement.removeChild(element);
			}
			
			for (let stageLink of stagesTable.querySelectorAll("td a")) {
				// Find the innermost td element enclosing the a, and add its whole text
				let parent = stageLink.parentElement;
				
				while (u.tagName(parent) !== "td") {
					parent = parent.parentElement;
				}
				
				quest.stages.push(parent.textContent);
			}

			// Suggested players
			let suggestedPlayers = u.getElementContainingOwnText(stagesTable, "td", "Suggested players:");
			
			if (suggestedPlayers != null) {
				let playerCountStr =
						u.getRegexGroup(suggestedPlayers.textContent, "Suggested players: ([0-9]+)", 1);
				quest.groupSize = parseInt(playerCountStr);
			}
		}
		
		// Provided items
		if (iconlists.length >= 2) {
			let maybeProvided = iconlists[1];
			let before = maybeProvided.previousSibling;
			
			if (before instanceof Text && before.textContent.includes("Provided")) {
				for (let element of maybeProvided.querySelectorAll("table.iconlist")) {
					element.parentElement.removeChild(element);
				}
				
				for (let itemLink of maybeProvided.querySelectorAll("td a")) {
					quest.providedItems.push(itemLink.textContent);
				}
			}
		}
	}

	function parseQuestText(quest, mainContainer) {
		// Description section
		let headingsSize3 = mainContainer.querySelectorAll("h2.heading-size-3");
		
		u.getFirstWithOwnText(headingsSize3, "Description", descriptionHeading => {
			quest.description = u.collectTextUntilNextTag(descriptionHeading, "h2").trim();
		});
		
		// Progress section
		let progressHeading = document.getElementById("lknlksndgg-progress");
		
		if (progressHeading != null) {
			quest.progress = u.textOf(progressHeading);
		} else {
			u.getFirstWithOwnText(headingsSize3, "Progress", fallbackProgressHeading => {
				quest.progress = u.collectTextUntilNextTag(fallbackProgressHeading, "h2").trim();
			});
		}
		
		// Completion section
		let completionHeading = document.getElementById("lknlksndgg-completion");
		
		if (completionHeading != null) {
			quest.completion = u.textOf(completionHeading);
		} else {
			u.getFirstWithOwnText(headingsSize3, "Completion", fallbackCompletionHeading => {
				quest.completion = u.collectTextUntilNextTag(fallbackCompletionHeading, "h2").trim();
			});
		}
	}
		
	/*
	private void parseMoney(final Quest quest, final Element mainContainer) {
		quest.setMoney(ParseUtils.getMoney(mainContainer));
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
				} else if ((prevText.trim().isEmpty() || prevText.contains("if completed at level"))
						&& isMoneyRewardSpan(icontab.previousElementSibling())) {
					// This is probably an item tucked at the end after money rewards
					collectItemRewards(icontab, quest.getNonChoiceRewards());
				}
			}
		}
	}
	
	// Convenience collection adapter around ParseUtils.collectItemRewards, which expects a Consumer
	private void collectItemRewards(final Element icontab, final Collection<ItemReward> collector) {
		ParseUtils.collectItemRewards(icontab, (item, quantity) -> {
			collector.add(new ItemReward(item, quantity, collector.size() + 1));
		});
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
		final Optional<Element> gainsData = headingsSize3.stream()
				.filter(el -> el.text().equals("Gains"))
				.findFirst()
				.flatMap(gains -> ParseUtils.findNextElementSibling(gains, el -> el.tagName().equals("ul")));
		
		if (gainsData.isPresent()) {
			Elements divs = ((Element) gainsData.get()).getElementsByTag("div");
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
					final String canonicalName = Substitutions.getCanonicalReputationFaction(faction);
					quest.getReputationGains().add(new ReputationGain(faction,
							canonicalName.equals(faction) ? null : canonicalName,
							Integer.parseInt(repValue.replace(",", ""))));
				} else {
					// Non-reputation gain
					quest.getOtherGains().add(div.text());
				}
			}
		}
	}
	
	private void parseInfobox(final Quest quest, final Document html) {
		// Infobox section
		final List<String> infoboxLines = ParseUtils.getInfoboxLines(html, true);
		
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
				quest.setPatchAdded(Substitutions.getCanonicalPatchVersion(patch));
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
	
	private void parseSeries(final Quest quest, final Element mainContainer) {
		// Try to determine previous and next quests
		final Elements headingsSize3 = mainContainer.select("h2.heading-size-3");
		final Optional<Element> seriesTable = getFirstWithOwnText(headingsSize3, "Series")
				.flatMap(seriesHeader -> ParseUtils.findNextElementSibling(
						seriesHeader, el -> "table".equals(el.tagName()) && el.hasClass("series")));
		
		if (!seriesTable.isPresent()) {
			return;
		}
		
		// Find the table cell with the current quest, in bold
		final Element ourQuestItem = seriesTable.get().getElementsByTag("b").first();
		Element ourQuestCell = ourQuestItem.parent();
		
		while (!ourQuestCell.tagName().equals("td")) {
			ourQuestCell = ourQuestCell.parent();
		}
		
		// Find where in the table it is
		final Elements questCells = seriesTable.get().getElementsByTag("td");
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
	
	private void parseRemoved(final Quest quest, final Element mainContainer) {
		// Set a removed flag if there is an obsolete warning on the quest page
		mainContainer.select("b[style=\"color: red\"]")
			.stream()
			.filter(el -> el.ownText().startsWith("This quest was marked obsolete"))
			.findFirst()
			.ifPresent(el -> quest.setRemoved(true));
	}
	*/
}
