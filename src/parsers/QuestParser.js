import { $, $$ } from "../common/shortcuts";
import u from "./utils";
import substitutions from "./substitutions";

import questEJS from "../templates/quest.ejs";

import Quest from "../model/quest/Quest";
import ItemReward from "../model/core/ItemReward";
import ReputationGain from "../model/quest/ReputationGain";

const LEGION_SCALING_QUEST_CATEGORIES = new Set([
	"Azsuna", "Val'sharah", "Highmountain", "Stormheim", "Artifact"
]);

/**
 * @return {Quest}
 */
export default function QuestParser(context) {
	this.name = "Quest";
	this.templatePrefix = "q";
	this.template = questEJS;

	/**
	 * @return {Quest}
	 */
	this.parse = function() {
		let quest = new Quest();
		
		let url = $("link[rel=canonical]").getAttribute("href");
		let idStr = u.getRegexGroup(url, "/quest=([0-9]+)/", 1);
		quest.id = parseInt(idStr, 10);
		
		let mainContainer = $("#main-contents > div.text");
		let questName = $("h1.heading-size-1");
		quest.name = questName.textContent;
		
		parseCategory(quest);
		parseObjectives(quest, mainContainer, questName);
		parseQuestText(quest, mainContainer);
		parseMoney(quest, mainContainer);
		parseRewards(quest, mainContainer);
		parseGains(quest, mainContainer);
		parseInfobox(quest);
		parseSeries(quest, mainContainer);
		parseRemoved(quest, mainContainer);

		return quest;
	}

	/**
	 * @param {Quest} quest
	 */
	function parseCategory(quest) {
		let categoryIds = u.getCategoryIds();
		let categoryId = categoryIds[categoryIds.length - 1];
		quest.category = context.questCategories[categoryId.toString()];
	}

	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 * @param {Element} questName 
	 */
	function parseObjectives(quest, mainContainer, questName) {
		// Objectives section
		let objectivesNode = questName.nextSibling;

		if (objectivesNode == null) {
			return;
		}
		
		// Objectives text is the first non-empty text node immediately following the header
		while (!(objectivesNode instanceof Text) || objectivesNode.data.trim().length === 0) {
			objectivesNode = objectivesNode.nextSibling;
		}
		
		let beforeObjectives = objectivesNode.previousSibling;
		
		// If there is a h2.heading-size-3 right before the "objectives" text, it is probably not objectives,
		// but rather progress or completion, like on the quest "Draenei Tail"
		if (!(beforeObjectives instanceof Element && u.tagName(beforeObjectives) === "h2"
				&& beforeObjectives.classList.contains("heading-size-3"))) {
			quest.objectives = u.normalize(objectivesNode.data);
		}
		
		// Objective completion stages
		let iconlists = mainContainer.querySelectorAll("table.iconlist");
		
		if (iconlists.length > 0) {
			let stagesTable = iconlists[0];

			// Remove any subtables
			for (let element of stagesTable.querySelectorAll("table.iconlist")) {
				element.parentElement.removeChild(element);
			}

			let tds = stagesTable.getElementsByTagName("td");

			if (!quest.objectives && tds.length > 0 && tds[0].getElementsByTagName("a").length === 0) {
				// No objectives, but first element is not a link. Assume it's the objective.
				quest.objectives = u.normalize(u.textOf(tds[0]));
			}
			
			for (let stageLink of stagesTable.querySelectorAll("td a")) {
				// Find the innermost td element enclosing the a, and add its whole text
				let parent = stageLink.parentElement;
				
				while (u.tagName(parent) !== "td") {
					parent = parent.parentElement;
				}
				
				quest.stages.push(u.normalize(parent.textContent));
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
					quest.providedItems.push(u.normalize(itemLink.textContent));
				}
			}
		}
	}

	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 */
	function parseQuestText(quest, mainContainer) {
		// Description section
		let headingsSize3 = mainContainer.querySelectorAll("h2.heading-size-3");

		if (headingsSize3 == null) {
			return;
		}
		
		u.getFirstWithOwnText(headingsSize3, "Description", descriptionHeading => {
			quest.description = u.normalize(u.collectTextUntilNextTag(descriptionHeading, "h2"));
		});
		
		// Progress section
		let progressHeading = document.getElementById("lknlksndgg-progress");
		
		if (progressHeading != null) {
			quest.progress = u.textOf(progressHeading);
		} else {
			u.getFirstWithOwnText(headingsSize3, "Progress", fallbackProgressHeading => {
				quest.progress = u.normalize(u.collectTextUntilNextTag(fallbackProgressHeading, "h2"));
			});
		}
		
		// Completion section
		let completionHeading = document.getElementById("lknlksndgg-completion");
		
		if (completionHeading != null) {
			quest.completion = u.textOf(completionHeading);
		} else {
			u.getFirstWithOwnText(headingsSize3, "Completion", fallbackCompletionHeading => {
				quest.completion = u.normalize(u.collectTextUntilNextTag(fallbackCompletionHeading, "h2"));
			});
		}
	}
		
	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 */
	function parseMoney(quest, mainContainer) {
		quest.money = u.getMoney(mainContainer);
	}
	
	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 */
	function parseRewards(quest, mainContainer) {
		// Non-money rewards
		let icontabs = mainContainer.querySelectorAll("table.icontab.icontab-box");
		
		for (let icontab of icontabs) {
			let prevNode = icontab.previousSibling;

			if (prevNode.id === "quest-reward-coin") {
				prevNode = prevNode.previousSibling;
			}
			
			if (icontab.id === "dynamic-rewards" || icontab.id === "choicerewards") {
				collectItemRewards(icontab, quest.choiceRewards);
			} else if (prevNode instanceof Text) {
				let prevText = prevNode.textContent;
				
				if (prevText.includes("You will receive:") || prevText.includes("You will also receive:")) {
					collectItemRewards(icontab, quest.nonChoiceRewards);
				} else if (prevText.includes("You will be able to choose one of these rewards:")) {
					collectItemRewards(icontab, quest.choiceRewards);
				} else if (prevText.includes("You will learn:")) {
					collectNonItemRewards(icontab, quest.abilityRewards);
				} else if (prevText.includes("The following spell will be cast on you:")) {
					collectNonItemRewards(icontab, quest.buffRewards);
				} else if ((prevText.trim().length === 0 || prevText.includes("if completed at level"))
						&& isMoneyRewardSpan(icontab.previousElementSibling)) {
					// This is probably an item tucked at the end after money rewards
					collectItemRewards(icontab, quest.nonChoiceRewards);
				}
			}
		}
	}
	
	// Convenience collection adapter around ParseUtils.collectItemRewards, which expects a Consumer
	/**
	 * @param {Element} icontab
	 * @param {Array.<ItemReward>} collector
	 */
	function collectItemRewards(icontab, collector) {
		u.collectItemRewards(icontab, (item, quantity) => {
			collector.push(new ItemReward(item, quantity, collector.length + 1));
		});
	}
	
	/**
	 * @param {Element} icontab
	 * @param {Array.<string>} collector
	 */
	function collectNonItemRewards(icontab, collector) {
		for (let link of icontab.querySelectorAll("td > a")) {
			collector.push(u.normalize(link.textContent));
		}
	}
	
	/**
	 * @param {Element} element
	 * @return {boolean}
	 */
	function isMoneyRewardSpan(element) {
		return u.tagName(element) === "span" && /money(?:gold|silver|copper)/.test(element.className);
	}

	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 */
	function parseGains(quest, mainContainer) {
		// Gains section
		let gainsData = null;

		for (let heading of mainContainer.querySelectorAll("h2.heading-size-3")) {
			if (heading.textContent === "Gains") {
				gainsData = u.findNextElementSibling(heading, el => u.tagName(el) === "ul");
				break;
			}
		}

		if (gainsData) {
			let divs = gainsData.getElementsByTagName("div");
			let firstNonXPDiv;
			
			if (divs[0].textContent.includes("experience")) {
				firstNonXPDiv = 1;
				let xpValue = u.getRegexGroup(divs[0].textContent, "([0-9, ]*) experience", 1);
				quest.experience = parseInt(xpValue.replace(/[ ,]/g, ""));
			} else {
				firstNonXPDiv = 0;
			}
			
			for (let i = firstNonXPDiv; i < divs.length; i++) {
				let div = divs[i];
				
				if (div.textContent.includes("reputation with")) {
					let repValue = div.getElementsByTagName("span")[0].textContent;
					let faction = div.getElementsByTagName("a")[0].textContent;
					let canonicalName = substitutions.getCanonicalReputationFaction(faction);
					quest.reputationGains.push(new ReputationGain(faction,
							canonicalName === faction ? null : canonicalName,
							parseInt(repValue.replace(",", ""))));
				} else {
					// Non-reputation gain
					quest.otherGains.push(u.normalize(div.textContent));
				}
			}
		}
	}
	
	/**
	 * @param {Quest} quest
	 */
	function parseInfobox(quest) {
		// Infobox section
		// Pattern-match each infobox line
		for (let infoboxLine of u.getInfoboxLines(true)) {
			u.getRegexGroup(infoboxLine, "Level: ([0-9]+)", 1, levelStr => {
				quest.level = parseInt(levelStr);
			});
			
			u.getRegexGroup(infoboxLine, "Requires level ([0-9]+)", 1, levelStr => {
				quest.levelRequired = parseInt(levelStr);
			});
			
			u.getRegexGroup(infoboxLine, "Type: (.+)", 1, type => {
				if (type === "Artifact") {
					// This is what wowpedia uses
					quest.type = "Legendary";
				} else {
					quest.type = type;
				}
			});
			
			u.getRegexGroup(infoboxLine, "Side: (.+)", 1, side => {
				if (side === "Both") {
					quest.faction = "Neutral";
				} else {
					quest.faction = side;
				}
			});
			
			u.getRegexGroup(infoboxLine, "Race: ([0-9]+)", 1, raceId => {
				quest.race = context.races[raceId];
			});
			
			u.getRegexGroup(infoboxLine, "Class: ([0-9]+)", 1, classId => {
				quest.characterClass = context.classes[classId];
			});
			
			u.getRegexGroup(infoboxLine, "Start: (.+)", 1, startEntity => {
				quest.startEntity = startEntity;
			});
			
			u.getRegexGroup(infoboxLine, "End: (.+)", 1, finishEntity => {
				quest.finishEntity = finishEntity;
			});
			
			u.getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1, patch => {
				quest.patchAdded = substitutions.getCanonicalPatchVersion(patch);
			});
			
			if (infoboxLine === "Repeatable") {
				quest.repeatable = true;
			} else if (infoboxLine === "Sharable") {
				quest.shareable = true;
			} else if (infoboxLine === "Not sharable") {
				quest.shareable = false;
			}
			
			// If we still don't know the level, and it's a Legion quest, its level probably scales
			if (!quest.level && LEGION_SCALING_QUEST_CATEGORIES.has(quest.category)) {
				quest.level = "100 - 110";
			}
		}
	}
	
	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 */
	function parseSeries(quest, mainContainer) {
		// Try to determine previous and next quests
		let seriesHeader = $("#infobox-series");

		if (!seriesHeader) {
			return;
		}

		let seriesTable = seriesHeader.parentElement.parentElement.querySelector("table.series");

		if (!seriesTable) {
			return;
		}
		
		// Find the table cell with the current quest, in bold
		let ourQuestItem = seriesTable.getElementsByTagName("b")[0];
		let ourQuestCell = ourQuestItem.parentElement;
		
		while (u.tagName(ourQuestCell) !== "td") {
			ourQuestCell = ourQuestCell.parentElement;
		}
		
		// Find where in the table it is
		let questCells = Array.from(seriesTable.getElementsByTagName("td"));
		let ourQuestIndex = questCells.indexOf(ourQuestCell);
		
		if (ourQuestIndex > 0) {
			let previousQuests = u.textOf(questCells[ourQuestIndex - 1]).split("\n");
			previousQuests.forEach(q => quest.previousQuests.push(q));
		}
		
		if (ourQuestIndex < questCells.length - 1) {
			let nextQuests = u.textOf(questCells[ourQuestIndex + 1]).split("\n");
			nextQuests.forEach(q => quest.nextQuests.push(q));
		}
	}
	
	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 */
	function parseRemoved(quest, mainContainer) {
		// Set a removed flag if there is an obsolete warning on the quest page
		for (let el of mainContainer.querySelectorAll("b[style=\"color: red\"]")) {
			if (el.textContent.startsWith("This quest was marked obsolete")) {
				quest.removed = true;
			}
		}
	}
}
