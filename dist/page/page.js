/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = $;
/* harmony export (immutable) */ __webpack_exports__["b"] = $$;
/**
 * Alias for `document.querySelector`.
 * 
 * @param selector {string} selector to query
 * @return {Element} element
 */
function $(selector) {
	return document.querySelector(selector);
}

/**
 * Alias for `document.querySelectorAll`.
 * 
 * @param selector {string} selector to query
 * @return {NodeList} search result
 */
function $$(selector) {
	return document.querySelectorAll(selector);
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function escapeRegExp(string) {
	return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
  
/* harmony default export */ __webpack_exports__["a"] = ({
	/**
	 * @return {Array.<number>}
	 */
	getCategoryIds: function() {
		let breadcrumbData;

		for (let script of document.getElementsByTagName("script")) {
			let text = script.textContent;

			if (text.includes("PageTemplate.set({breadcrumb:")) {
				breadcrumbData = text;
				break;
			}
		}
		
		// ugh, parsing JS with regexes
		let regex = escapeRegExp("PageTemplate.set({breadcrumb: [") + "([0-9,-]+)" + escapeRegExp("]});");
		return this.getRegexGroup(breadcrumbData, regex, 1).split(",").map(id => parseInt(id, 10));
	},
	
	/**
	 * @param {boolean} stripColor
	 * @return {Array.<string>}
	 */
	getInfoboxLines: function(stripColor) {
		let infoboxData = null;
		
		this.getElementContainingOwnText(document, "script", "arkup.printHtml", script => {
			infoboxData = script.textContent;
		});
		
		if (!infoboxData) {
			return [];
		}
		
		let infoboxMarkup = this.getRegexGroup(infoboxData, "[Mm]arkup\\.printHtml\\((['\"])(.*)\\1, 'infobox", 2)
					.replace(/\\\//g, "/") // unescape forward slashes (the regex matches the string \/)
					.replace(/\\x([0-9A-Z]{2})/g, escapeSeq => String.fromCharCode(parseInt(hex, 16)));
					// Convert \xNN escape sequences to their corresponding characters
		
		// We'll get BBCode, convert it to a list of plain text lines
		let lines = [];

		for (let line of infoboxMarkup.split("[/li][li]")) {
			lines.push.apply(lines, line.split("[br]"));
		}

		return lines.map(line => line.replace(/\[(?:race|class|money)=([0-9]+)\]/g, "$1"))
				.map(stripColor ? line => line
						: line => line.replace(/\[color=([^\]]+)\]/g, "<$1>"))
				.map(line => line.replace(/\[[^\]]+\]/g, ""));          // remove all square bracket tags
	},

	/**
	 * @param {Element} element
	 * @return {string}
	 */
	tagName: function(element) {
		return element.tagName.toLowerCase();
	},

	/**
	 * @param {string} str
	 * @param {string|RegExp} regex
	 * @param {number} group
	 * @param {function} onFound
	 * @return {string}
	 */
	getRegexGroup: function(str, regex, group, onFound) {
		if (!regex instanceof RegExp) {
			regex = new Regex(regex);
		}
		
		let match = str.match(regex);

		if (match === null) {
			return null;
		}

		let result = match[group];

		if (onFound) {
			onFound(result);
		}
		
		return result;
	},

	/**
	 * @param {Element} el
	 * @return {string}
	 */
	textOf: function(el) {
		let result = "";

		for (let node of el.childNodes) {
			if (node instanceof Text) {
				result += node.textContent;
			} else if (node instanceof Element) {
				if (this.tagName(node) === "br") {
					result += "\n";
				} else {
					result += this.textOf(node);
				}
			}
		}

		return this.normalize(result);
	},
	
	/**
	 * @param {Element} header
	 * @param {string} nextTagName
	 * @return {string}
	 */
	collectTextUntilNextTag: function(header, nextTagName) {
		let result = "";
		
		for (let node = header.nextSibling;
				!(node instanceof Element && this.tagName(node) === nextTagName);
				node = node.nextSibling) {
			if (node instanceof Text) {
				result += node.textContent;
			} else if (node instanceof Element && this.tagName(node) === "br") {
				result += "\n";
			}
		}
		
		return result;
	},

	/**
	 * @param {Element} element
	 * @param {string} tagName
	 * @param {string} text
	 * @param {(element: Element) => void} onFound
	 * @return {Element}
	 */
	getElementContainingOwnText: function(element, tagName, text, onFound) {
		return this.getFirstWithOwnText(element.getElementsByTagName(tagName), text, onFound);
	},

	/**
	 * @param {NodeList} elements
	 * @param {string} text
	 * @param {(element: Element) => void} onFound
	 * @return {Element}
	 */
	getFirstWithOwnText: function(elements, text, onFound) {
		for (let child of elements) {
			if (child.textContent.includes(text)) {
				if (onFound) {
					onFound(child);
				}

				return child;
			}
		}

		return null;
	},

	/**
	 * @param {Element} element
	 * @param {string} tagName
	 * @param {string} text
	 * @return {Array.<Element>}
	 */
	getElementsContainingOwnText: function(element, tagName, text) {
		let result = [];

		for (let child of document.getElementsByTagName(tagName)) {
			if (child.textContent.includes(text)) {
				result.push(child);
			}
		}

		return result;
	},
	
	/**
	 * @param {Element} icontab
	 * @param {(itemName: string, itemQuantity: number) => void} collector
	 */
	collectItemRewards: function(icontab, collector) {
		let itemNamesByIconId = new Map();
		let itemQuantitiesByIconId = new Map();
		
		// Item names are contained in the actual icontab, as are placeholders for the icon and quantity
		for (let iconPlaceholder of icontab.querySelectorAll("th[id]")) {
			let iconId = iconPlaceholder.id;
			// the next element is a td with the link to the actual item
			let itemName = iconPlaceholder.nextElementSibling.getElementsByTagName("a")[0].textContent;
			itemNamesByIconId.set(iconId, itemName);
		}
		
		// Item quantities are filled through JavaScript.
		// Find all script elements in the document containing icontab initialization code
		for (let script of this.getElementsContainingOwnText(document, "script", "icontab")) {
			// Parse JavaScript lines like
			// $WH.ge('icontab-icon1').appendChild(g_items.createIcon(115793, 1, "3"));
			// We're interested in what's inside ge() - the icon box ID -
			// and the contents of the last quotes (item quantity)
			let iconInitRegex = new RegExp(
					escapeRegExp("WH.ge('")
					+ "([^']+)"
					+ escapeRegExp("').appendChild(") + "[A-Za-z0-9_]+" + escapeRegExp(".createIcon(")
					+ "[^\"]+\"([^\"]+)\""
					+ escapeRegExp("));"), "g");
			
			let scriptText = script.textContent;
			let match;
			
			while ((match = iconInitRegex.exec(scriptText)) !== null) {
				// group 1 is icon box element ID, group 2 is item quantity (or 0 if no quantity should be displayed)
				itemQuantitiesByIconId.set(match[1], parseInt(match[2]));
			}
		}
		
		itemNamesByIconId.forEach((itemName, iconId) => {
			let itemQuantity = itemQuantitiesByIconId.get(iconId);
			
			// "0" means draw no quantity on the icon
			if (itemQuantity === undefined || itemQuantity == 0 || itemQuantity == 1) {
				itemQuantity = null;
			}
			
			collector(itemName, itemQuantity);
		});
	},
	
	/**
	 * @param {Element} container
	 * @return {number}
	 */
	getMoney: function(container) {
		let allMoneyElements = [];
		allMoneyElements.push.apply(allMoneyElements, container.querySelectorAll("span.moneygold"));
		allMoneyElements.push.apply(allMoneyElements, container.querySelectorAll("span.moneysilver"));
		allMoneyElements.push.apply(allMoneyElements, container.querySelectorAll("span.moneycopper"));
		
		if (allMoneyElements.length === 0) {
			return 0;
		}
		
		// Find the leftmost money element (so we parse only the first group - second group is max level rewards)
		let money = 0;
		let leftEl = null;
		
		for (let el of allMoneyElements) {
			if (leftEl === null || el.siblingIndex < leftEl.siblingIndex) {
				leftEl = el;
			}
		}
		
		let node;
		
		// Parse all directly adjacent span nodes, possibly with whitespace in between
		for (node = leftEl;
				(node instanceof Element && this.tagName(node) === "span")
					|| (node instanceof Text && node.textContent.trim().length === 0);
				node = node.nextSibling) {
			if (!(node instanceof Element)) {
				continue;
			}
			
			if (node.classList.contains("moneygold")) {
				money += parseInt(node.textContent) * 10000;
			} else if (node.classList.contains("moneysilver")) {
				money += parseInt(node.textContent) * 100;
			} else if (node.classList.contains("moneycopper")) {
				money += parseInt(node.textContent);
			}
		}
		
		// If the money group we just parsed is followed immediately by max level text, then it means that the only
		// money group is the max-level money group, so we should skip it.
		if (node instanceof Text && node.textContent.trim().startsWith("if completed at level")) {
			return 0;
		}
		
		return money;
	},
	
	/**
	 * @param {Element} startElement
	 * @param {(element: Element) => boolean} condition
	 */
	findNextElementSibling: function(startElement, condition) {
		for (let el = startElement.nextElementSibling; el != null; el = el.nextElementSibling) {
			if (condition(el)) {
				return el;
			}
		}
		
		return null;
	},

	/**
	 * @param {string} str
	 * @return {string}
	 */
	normalize: function(str) {
		return str.trim().replace(/[ ]{2,}/g, " ");
	}
});


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Mission {
	constructor() {
		 this.enemies = [];
		 this.bonusItems = [];
	}

	hasRewards() {
		return this.bonusItems.length > 0 || this.hasNonItemRewards();
	}
	
	hasNonItemRewards() {
		return !!this.bonusXP || !!this.bonusMoney || !!this.bonusResources;
	}

	getFollowerXPStr() {
		if (!this.followerXP) {
			return null;
		}
		
		return new Intl.NumberFormat("en-US").format(this.followerXP);
	}

	getBonusXPStr() {
		if (!bonusXP) {
			return null;
		}
		
		return new Intl.NumberFormat("en-US").format(this.bonusXP);
	}
	
	getGold() {
		return Math.floor(this.money / 10000) || "";
	}

	getSilver() {
		return (Math.floor(this.money / 100) % 100) || "";
	}

	getCopper() {
		return (this.money % 100) || "";
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Mission;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let patches = {
	"4.0.3": "4.0.3a",
	"6.0.1": "6.0.2",
	"7.0.1": "7.0.3",
};

let reputations = {
	"Stormwind": "Stormwind (faction)",
	"Ironforge": "Ironforge (faction)",
	"Darnassus": "Darnassus (faction)",
	"Exodar": "Exodar (faction)",
	"Gnomeregan": "Gnomeregan (faction)",
	"Gilneas": "Gilneas (faction)",
	"Orgrimmar": "Orgrimmar (faction)",
	"Thunder Bluff": "Thunder Bluff (faction)",
	"Undercity": "Undercity (faction)",
	"Silvermoon": "Silvermoon (faction)",
};

/* harmony default export */ __webpack_exports__["a"] = ({
	getCanonicalPatchVersion : function(patch) {
		return patches[patch] || patch;
	},

	getCanonicalReputationFaction : function(repFaction) {
		return reputations[repFaction] || repFaction;
	}
});


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class ItemReward {
	/**
	 * 
	 * @param {string} name 
	 * @param {number} quantity 
	 * @param {number} index 
	 */
	constructor(name, quantity, index) {
		this.name = name;
		this.quantity = quantity;
		this.index = index;
	}

	/**
	 * @return {string}
	 */
	toString() {
		if (this.quantity == null) {
			return this.name;
		}
		
		return this.name + " (" + this.quantity + ")";
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ItemReward;



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__common_shortcuts__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Parsers__ = __webpack_require__(6);



// Remove any existing popups, if any
Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["b" /* $$ */])("#questfiller-popup").forEach(element => element.parentElement.removeChild(element));

// Create popup
let popup = document.createElement("div");
popup.setAttribute("id", "questfiller-popup");
document.body.appendChild(popup);

popup.innerHTML = `
	<textarea id="questfiller-content" spellcheck="false"></textarea>
	<button id="questfiller-copy">Copy to clipboard and close</button>
`;

var content = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("#questfiller-content");

Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("#questfiller-copy").addEventListener("click", e => {
	content.select();
	document.execCommand("copy");
	popup.parentElement.removeChild(popup);
});

__WEBPACK_IMPORTED_MODULE_1__Parsers__["a" /* default */].create().then(parsers => {
	let value = parsers.format();

	if (value) {
		content.value = value;
		Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("#questfiller-copy").focus();
	}
}).catch(e => {
	content.value = e.message;
	console.log(e);
});


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__common_shortcuts__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__parsers_utils__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__parsers_ParserContext__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__parsers_QuestParser__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__parsers_MissionParser__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__parsers_NPCParser__ = __webpack_require__(18);








class Parsers {
	constructor(context) {
		this.quest = new __WEBPACK_IMPORTED_MODULE_3__parsers_QuestParser__["a" /* default */](context);
		this.mission = new __WEBPACK_IMPORTED_MODULE_4__parsers_MissionParser__["a" /* default */](context);
		this.npc = new __WEBPACK_IMPORTED_MODULE_5__parsers_NPCParser__["a" /* default */](context);
	}

	format() {
		let url = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("link[rel=canonical]").getAttribute("href");
		
		if (!url) {
			return null;
		}

		let articleType = __WEBPACK_IMPORTED_MODULE_1__parsers_utils__["a" /* default */].getRegexGroup(url, /\/([a-z-]+)=[0-9]+\//, 1);
		let parser = this[articleType];

		if (!parser) {
			return null;
		}

		let parseResult = parser.parse();

		// Format
		let context = {};
		context[parser.templatePrefix] = parseResult;
		return parser.template(context);
	}
};

/* harmony default export */ __webpack_exports__["a"] = ({
	create: function() {
		return __WEBPACK_IMPORTED_MODULE_2__parsers_ParserContext__["a" /* default */].create().then(context => {
			return new Parsers(context);
		});
	}
});

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function arrayToDict(array, dict) {
	dict = dict || {};
	array.forEach(element => dict[element[0]] = element[1]);
	return dict;
}

class ParserContext {
	constructor(localeData) {
		this.questCategories = {};

		localeData.mn_quests.forEach(element => {
			let sublist = element[3];
			
			if (Array.isArray(sublist)) {
				sublist.forEach(subelement => {
					// category ID and name
					this.questCategories[subelement[0]] = subelement[1];
				});
			}
		});

		this.missionMechanics = arrayToDict(localeData.fidropdowns.missionMechanics);
		arrayToDict(localeData.fidropdowns.missionThreats, this.missionMechanics);
		this.races = arrayToDict(localeData.fidropdowns.race);
		this.classes = arrayToDict(localeData.fidropdowns.classs);
		this.npcTypes = localeData.g_npc_types;

		// This has to be hardcoded for now :(
		this.legionMissionMechanics = {
			"474": "Broken Gear",
			"471": "Cursed",
			"472": "Disorienting",
			"762": "Dungeon",
			"760": "Elite",
			"473": "Head Wound",
			"475": "Heroic",
			"437": "Lethal",
			"476": "Mythic",
			"761": "Placeholder",
			"436": "Powerful",
			"482": "Powerful",
			"763": "Raid",
			"428": "Slowing",
		};
	}
}

/* harmony default export */ __webpack_exports__["a"] = ({
	create: function() {
		return new Promise((resolve, reject) => {
			// Hack: inject script to pass Wowhead localization data from window into content script
			function onMessage(e) {
				if (e.source === window && e.data.questFillerTag) {
					window.removeEventListener("message", onMessage);
					resolve(new ParserContext(e.data));
				}
			}

			window.addEventListener("message", onMessage);

			var script = document.createElement("script");
			script.text = `
				window.postMessage({
					questFillerTag: "questFillerTag",
					g_npc_types: window.g_npc_types,
					mn_quests: window.mn_quests,
					fidropdowns: window.LANG.fidropdowns
				}, "*");
			`;
			document.head.appendChild(script);
		});
	}
});


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = QuestParser;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__common_shortcuts__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__substitutions__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__templates_quest_ejs__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__templates_quest_ejs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__templates_quest_ejs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__model_quest_Quest__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__model_core_ItemReward__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__model_quest_ReputationGain__ = __webpack_require__(11);










const LEGION_SCALING_QUEST_CATEGORIES = new Set([
	"Azsuna", "Val'sharah", "Highmountain", "Stormheim", "Artifact"
]);

/**
 * @return {Quest}
 */
function QuestParser(context) {
	this.name = "Quest";
	this.templatePrefix = "q";
	this.template = __WEBPACK_IMPORTED_MODULE_3__templates_quest_ejs___default.a;

	/**
	 * @return {Quest}
	 */
	this.parse = function() {
		let quest = new __WEBPACK_IMPORTED_MODULE_4__model_quest_Quest__["a" /* default */]();
		
		let url = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("link[rel=canonical]").getAttribute("href");
		let idStr = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(url, "/quest=([0-9]+)/", 1);
		quest.id = parseInt(idStr, 10);
		
		let mainContainer = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("#main-contents > div.text");
		let questName = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("h1.heading-size-1");
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
		let categoryIds = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getCategoryIds();
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
		
		// Objectives text is the first non-empty text node immediately following the header
		while (!(objectivesNode instanceof Text) || objectivesNode.data.trim().length === 0) {
			objectivesNode = objectivesNode.nextSibling;
		}
		
		let beforeObjectives = objectivesNode.previousSibling;
		
		// If there is a h2.heading-size-3 right before the "objectives" text, it is probably not objectives,
		// but rather progress or completion, like on the quest "Draenei Tail"
		if (!(beforeObjectives instanceof Element && __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(beforeObjectives) === "h2"
				&& beforeObjectives.classList.contains("heading-size-3"))) {
			quest.objectives = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(objectivesNode.data.trim);
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
				
				while (__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(parent) !== "td") {
					parent = parent.parentElement;
				}
				
				quest.stages.push(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(parent.textContent));
			}

			// Suggested players
			let suggestedPlayers = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getElementContainingOwnText(stagesTable, "td", "Suggested players:");
			
			if (suggestedPlayers != null) {
				let playerCountStr =
						__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(suggestedPlayers.textContent, "Suggested players: ([0-9]+)", 1);
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
					quest.providedItems.push(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(itemLink.textContent));
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
		
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getFirstWithOwnText(headingsSize3, "Description", descriptionHeading => {
			quest.description = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].collectTextUntilNextTag(descriptionHeading, "h2"));
		});
		
		// Progress section
		let progressHeading = document.getElementById("lknlksndgg-progress");
		
		if (progressHeading != null) {
			quest.progress = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].textOf(progressHeading);
		} else {
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getFirstWithOwnText(headingsSize3, "Progress", fallbackProgressHeading => {
				quest.progress = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].collectTextUntilNextTag(fallbackProgressHeading, "h2"));
			});
		}
		
		// Completion section
		let completionHeading = document.getElementById("lknlksndgg-completion");
		
		if (completionHeading != null) {
			quest.completion = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].textOf(completionHeading);
		} else {
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getFirstWithOwnText(headingsSize3, "Completion", fallbackCompletionHeading => {
				quest.completion = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].collectTextUntilNextTag(fallbackCompletionHeading, "h2"));
			});
		}
	}
		
	/**
	 * @param {Quest} quest 
	 * @param {Element} mainContainer
	 */
	function parseMoney(quest, mainContainer) {
		quest.money = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getMoney(mainContainer);
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
			
			if (icontab.id === "dynamic-rewards") {
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
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].collectItemRewards(icontab, (item, quantity) => {
			collector.push(new __WEBPACK_IMPORTED_MODULE_5__model_core_ItemReward__["a" /* default */](item, quantity, collector.length + 1));
		});
	}
	
	/**
	 * @param {Element} icontab
	 * @param {Array.<string>} collector
	 */
	function collectNonItemRewards(icontab, collector) {
		for (let link of icontab.querySelectorAll("td > a")) {
			collector.push(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(link.textContent));
		}
	}
	
	/**
	 * @param {Element} element
	 * @return {boolean}
	 */
	function isMoneyRewardSpan(element) {
		return __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(element) === "span" && /money(?:gold|silver|copper)/.test(element.className);
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
				gainsData = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].findNextElementSibling(heading, el => __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(el) === "ul");
				break;
			}
		}

		if (gainsData) {
			let divs = gainsData.getElementsByTagName("div");
			let firstNonXPDiv;
			
			if (divs[0].textContent.includes("experience")) {
				firstNonXPDiv = 1;
				let xpValue = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(divs[0].textContent, "([0-9,]*) experience", 1);
				quest.experience = parseInt(xpValue.replace(",", ""));
			} else {
				firstNonXPDiv = 0;
			}
			
			for (let i = firstNonXPDiv; i < divs.length; i++) {
				let div = divs[i];
				
				if (div.textContent.includes("reputation with")) {
					let repValue = div.getElementsByTagName("span")[0].textContent;
					let faction = div.getElementsByTagName("a")[0].textContent;
					let canonicalName = __WEBPACK_IMPORTED_MODULE_2__substitutions__["a" /* default */].getCanonicalReputationFaction(faction);
					quest.reputationGains.push(new __WEBPACK_IMPORTED_MODULE_6__model_quest_ReputationGain__["a" /* default */](faction,
							canonicalName === faction ? null : canonicalName,
							parseInt(repValue.replace(",", ""))));
				} else {
					// Non-reputation gain
					quest.otherGains.push(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(div.textContent));
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
		for (let infoboxLine of __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getInfoboxLines(true)) {
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Level: ([0-9]+)", 1, levelStr => {
				quest.level = parseInt(levelStr);
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Requires level ([0-9]+)", 1, levelStr => {
				quest.levelRequired = parseInt(levelStr);
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Type: (.+)", 1, type => {
				if (type === "Artifact") {
					// This is what wowpedia uses
					quest.type = "Legendary";
				} else {
					quest.type = type;
				}
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Side: (.+)", 1, side => {
				if (side === "Both") {
					quest.faction = "Neutral";
				} else {
					quest.faction = side;
				}
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Race: ([0-9]+)", 1, raceId => {
				quest.race = context.races[raceId];
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Class: ([0-9]+)", 1, classId => {
				quest.characterClass = context.classes[classId];
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Start: (.+)", 1, startEntity => {
				quest.startEntity = startEntity;
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "End: (.+)", 1, finishEntity => {
				quest.finishEntity = finishEntity;
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1, patch => {
				quest.patchAdded = __WEBPACK_IMPORTED_MODULE_2__substitutions__["a" /* default */].getCanonicalPatchVersion(patch);
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
		let headingsSize3 = mainContainer.querySelectorAll("h2.heading-size-3");
		/** @type {Element} */
		let seriesTable = null;

		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getFirstWithOwnText(headingsSize3, "Series", seriesHeader => {
			seriesTable = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].findNextElementSibling(seriesHeader,
					el => __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(el) === "table" && el.classList.contains("series"));
		});

		if (!seriesTable) {
			return;
		}
		
		// Find the table cell with the current quest, in bold
		let ourQuestItem = seriesTable.getElementsByTagName("b")[0];
		let ourQuestCell = ourQuestItem.parentElement;
		
		while (__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(ourQuestCell) !== "td") {
			ourQuestCell = ourQuestCell.parentElement;
		}
		
		// Find where in the table it is
		let questCells = Array.from(seriesTable.getElementsByTagName("td"));
		let ourQuestIndex = questCells.indexOf(ourQuestCell);
		
		if (ourQuestIndex > 0) {
			let previousQuests = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].textOf(questCells[ourQuestIndex - 1]).split("\n");
			previousQuests.forEach(q => quest.previousQuests.push(q));
		}
		
		if (ourQuestIndex < questCells.length - 1) {
			let nextQuests = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].textOf(questCells[ourQuestIndex + 1]).split("\n");
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


/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = function anonymous(locals, filters, escape, rethrow) {
    escape = escape || function(html) {
        return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    };
    var __stack = {
        lineno: 1,
        input: '<% if (q.removed) { -%>\n{{Removed|patch=}}\n<% } else { -%>\n{{Stub/Quest}}\n<% } -%>\n{{Questbox\n<% if (q.removed) { -%>\n | doc =\n<% } -%>\n | id = <%-q.id%>\n | name = <%-q.name%>\n | category = <%-q.category%>\n<% if (q.faction) { -%>\n | faction = <%-q.faction%>\n<% } -%>\n<% if (q.race) { -%>\n | race = <%-q.race%>\n<% } -%>\n<% if (q.characterClass) { -%>\n | class = <%-q.characterClass%>\n<% } -%>\n | level = <%-q.level%>\n<% if (q.levelRequired) { -%>\n | levelreq = <%-q.levelRequired%>\n<% } -%>\n<% if (q.type) { -%>\n | type = <%-q.type%>\n<% } -%>\n<% if (q.groupSize) { -%>\n | groupsize = <%-q.groupSize%>\n<% } -%>\n<% if (q.startEntity) { -%>\n | start = [[<%-q.startEntity%>]]\n<% } else { -%>\n | start = Automatic\n<% } -%>\n<% if (q.finishEntity && q.startEntity !== q.finishEntity) { -%>\n | end = [[<%-q.finishEntity%>]]\n<% } else if (!q.finishEntity) { -%>\n | end = Automatic\n<% } -%>\n<% if (q.reputationGains.length) { -%>\n | reputation = <%\n	q.reputationGains.forEach(function(gain, index) {\n		%><%- gain %><%\n		if (index < q.reputationGains.length - 1) {\n			%><br /><%\n		}\n	}) %>\n<% } -%>\n<% if (q.experience) { -%>\n | experience = <%-q.getExperienceStr()%>\n<% } -%>\n<% if (q.hasNonMoneyRewards()) { -%>\n | rewards =\n<% q.choiceRewards.forEach(function(reward, index) { -%>\n<% if (index > 0) { -%>or <% } -%><% if (reward.quantity) { -%><%- reward.quantity %>x <% } -%>[[<%- reward.name %>]]<% if (index < q.choiceRewards.length - 1) { -%><br /><% } -%>\n<% }) -%>\n<% q.getAllNonChoiceRewards().forEach(function(reward, index, array) { -%>\n<% if (index === 0) { -%><% if (q.choiceRewards.length) { -%><br /><br /><% } } -%><% if (reward.quantity) { -%><%- reward.quantity %>x <% } -%>[[<%- reward.name %>]]<% if (index < array.length - 1) { -%><br /><% } -%>\n<% }) -%>\n<% } %>\n<% if (q.money) { -%>\n | money = {{cost|<%- q.getGold() %>|<%- q.getSilver() %>|<%- q.getCopper() %>}}\n<% } -%>\n<% if (q.repeatable) { -%>\n | repeatable = Yes\n<% } -%>\n<% if (!q.shareable) { -%>\n | shareable = No\n<% } -%>\n | previous = <% q.previousQuests.forEach(function(quest, index) {\n	%>[[Quest:<%- quest %>]]<%\n		if (index < q.previousQuests.length - 1) {\n			%>, <%\n		}\n	}) %>\n | next = <% q.nextQuests.forEach(function(quest, index) {\n	%>[[Quest:<%- quest %>]]<%\n		if (index < q.nextQuests.length - 1) {\n			%>, <%\n		}\n	}) %>\n<% if (q.faction && q.faction !== "Neutral") { -%>\n | other-faction =\n <% } -%>\n}}\n\n==Objectives==\n<% if (q.objectives) { -%>\n<%- q.objectives %>\n<% } else { -%>\n...\n<% } -%>\n<% q.stages.forEach(function(stage) { -%>\n* <%- stage %>\n<% }) -%>\n<% q.providedItems.forEach(function(item) { -%>\n* [[<%- item %>]] (provided)\n<% }) -%>\n<% if (q.groupSize) { -%>\n* Suggested players: <%- q.groupSize %>\n<% } -%>\n\n==Description==\n<% if (q.description) { -%>\n<%- q.description %>\n<% } else { -%>\n...\n<% } -%>\n\n<% if (q.hasRewards()) { -%>\n==Rewards==\n<% if (q.choiceRewards.length) { -%>\n{{itembox|You will be able to choose one of these rewards:\n<% q.choiceRewards.forEach(function(reward, index) { -%>\n<% if (reward.quantity) { %>|q<%- (index+1) %>=<%-reward.quantity%><% } %>|<%-reward.name%>\n<% }) -%>\n}}\n\n<% } -%>\n<% q.abilityRewards.forEach(function(reward, index) { -%>\nYou will <% if (q.hasItemRewards()) { -%>also <% } -%>learn: [[<%-reward%>]]\n\n<% }) %>\n<% q.buffRewards.forEach(function(reward, index) { -%>\nThe following spell will be cast on you: [[<%-reward%>]]\n\n<% }) -%>\n<% if (q.money) { -%>\nYou will <% if (q.hasChoiceAbilityOrBuffRewards()) { -%>also <% } -%>receive: {{cost|<%-q.getGold()%>|<%-q.getSilver()%>|<%-q.getCopper()%>}}\n\n<% } -%>\n<% if (q.nonChoiceRewards.length) { -%>\n{{itembox|<% if (!q.money) { -%>You will <% if (q.hasChoiceAbilityOrBuffRewards()) { -%>also <% } -%>receive:<% } -%>\n<% q.nonChoiceRewards.forEach(function(reward, index) { -%>\n<% if (reward.quantity) { %>|q<%- (index+1) %>=<%-reward.quantity%><% } %>|<%-reward.name%>\n<% }) -%>\n}}\n\n<% } -%>\n<% } %>\n<% if (q.progress) { -%>\n==Progress==\n<%-q.progress%>\n\n<% } -%>\n<% if (q.completion) { -%>\n==Completion==\n<%-q.completion%>\n<% } -%>\n\n<% if (q.hasGains()) { -%>\n==Gains==\n<% if (q.experience) { -%>\n* <%-q.getExperienceStr()%> [[XP]]\n<% } -%>\n<% q.reputationGains.forEach(function(gain) { -%>\n* <%-gain.getFullText()%>\n<% }) -%>\n<% } -%>\n<% q.otherGains.forEach(function(gain) { -%>\n* <%-gain%>\n<% }) -%>\n\n==Progression==\n...\n<% if (q.patchAdded) { -%>\n\n==Patch changes==\n* {{Patch <%-q.patchAdded%>|note=Added.}}\n<% } -%>\n\n==External links==\n{{subst:el}}\n{{Elinks-quest|<%-q.id%>}}\n',
        filename: "."
    };
    function rethrow(err, str, filename, lineno) {
        var lines = str.split("\n"), start = Math.max(lineno - 3, 0), end = Math.min(lines.length, lineno + 3);
        var context = lines.slice(start, end).map(function(line, i) {
            var curr = i + start + 1;
            return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
        }).join("\n");
        err.path = filename;
        err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
        throw err;
    }
    try {
        var buf = [];
        with (locals || {}) {
            (function() {
                buf.push("");
                __stack.lineno = 1;
                if (q.removed) {
                    buf.push("{{Removed|patch=}}\n");
                    __stack.lineno = 2;
                } else {
                    buf.push("{{Stub/Quest}}\n");
                    __stack.lineno = 3;
                }
                buf.push("{{Questbox\n");
                __stack.lineno = 4;
                if (q.removed) {
                    buf.push(" | doc =\n");
                    __stack.lineno = 5;
                }
                buf.push(" | id = ", (__stack.lineno = 5, q.id), "\n | name = ", (__stack.lineno = 6, q.name), "\n | category = ", (__stack.lineno = 7, q.category), "\n");
                __stack.lineno = 8;
                if (q.faction) {
                    buf.push(" | faction = ", (__stack.lineno = 8, q.faction), "\n");
                    __stack.lineno = 9;
                }
                buf.push("");
                __stack.lineno = 9;
                if (q.race) {
                    buf.push(" | race = ", (__stack.lineno = 9, q.race), "\n");
                    __stack.lineno = 10;
                }
                buf.push("");
                __stack.lineno = 10;
                if (q.characterClass) {
                    buf.push(" | class = ", (__stack.lineno = 10, q.characterClass), "\n");
                    __stack.lineno = 11;
                }
                buf.push(" | level = ", (__stack.lineno = 11, q.level), "\n");
                __stack.lineno = 12;
                if (q.levelRequired) {
                    buf.push(" | levelreq = ", (__stack.lineno = 12, q.levelRequired), "\n");
                    __stack.lineno = 13;
                }
                buf.push("");
                __stack.lineno = 13;
                if (q.type) {
                    buf.push(" | type = ", (__stack.lineno = 13, q.type), "\n");
                    __stack.lineno = 14;
                }
                buf.push("");
                __stack.lineno = 14;
                if (q.groupSize) {
                    buf.push(" | groupsize = ", (__stack.lineno = 14, q.groupSize), "\n");
                    __stack.lineno = 15;
                }
                buf.push("");
                __stack.lineno = 15;
                if (q.startEntity) {
                    buf.push(" | start = [[", (__stack.lineno = 15, q.startEntity), "]]\n");
                    __stack.lineno = 16;
                } else {
                    buf.push(" | start = Automatic\n");
                    __stack.lineno = 17;
                }
                buf.push("");
                __stack.lineno = 17;
                if (q.finishEntity && q.startEntity !== q.finishEntity) {
                    buf.push(" | end = [[", (__stack.lineno = 17, q.finishEntity), "]]\n");
                    __stack.lineno = 18;
                } else if (!q.finishEntity) {
                    buf.push(" | end = Automatic\n");
                    __stack.lineno = 19;
                }
                buf.push("");
                __stack.lineno = 19;
                if (q.reputationGains.length) {
                    buf.push(" | reputation = ");
                    __stack.lineno = 19;
                    q.reputationGains.forEach(function(gain, index) {
                        buf.push("", (__stack.lineno = 21, gain), "");
                        __stack.lineno = 21;
                        if (index < q.reputationGains.length - 1) {
                            buf.push("<br />");
                            __stack.lineno = 23;
                        }
                    });
                    buf.push("\n");
                    __stack.lineno = 26;
                }
                buf.push("");
                __stack.lineno = 26;
                if (q.experience) {
                    buf.push(" | experience = ", (__stack.lineno = 26, q.getExperienceStr()), "\n");
                    __stack.lineno = 27;
                }
                buf.push("");
                __stack.lineno = 27;
                if (q.hasNonMoneyRewards()) {
                    buf.push(" | rewards =\n");
                    __stack.lineno = 28;
                    q.choiceRewards.forEach(function(reward, index) {
                        buf.push("");
                        __stack.lineno = 28;
                        if (index > 0) {
                            buf.push("or ");
                            __stack.lineno = 28;
                        }
                        buf.push("");
                        __stack.lineno = 28;
                        if (reward.quantity) {
                            buf.push("", (__stack.lineno = 28, reward.quantity), "x ");
                            __stack.lineno = 28;
                        }
                        buf.push("[[", (__stack.lineno = 28, reward.name), "]]");
                        __stack.lineno = 28;
                        if (index < q.choiceRewards.length - 1) {
                            buf.push("<br />");
                            __stack.lineno = 28;
                        }
                        buf.push("");
                        __stack.lineno = 28;
                    });
                    buf.push("");
                    __stack.lineno = 28;
                    q.getAllNonChoiceRewards().forEach(function(reward, index, array) {
                        buf.push("");
                        __stack.lineno = 28;
                        if (index === 0) {
                            buf.push("");
                            __stack.lineno = 28;
                            if (q.choiceRewards.length) {
                                buf.push("<br /><br />");
                                __stack.lineno = 28;
                            }
                        }
                        buf.push("");
                        __stack.lineno = 28;
                        if (reward.quantity) {
                            buf.push("", (__stack.lineno = 28, reward.quantity), "x ");
                            __stack.lineno = 28;
                        }
                        buf.push("[[", (__stack.lineno = 28, reward.name), "]]");
                        __stack.lineno = 28;
                        if (index < array.length - 1) {
                            buf.push("<br />");
                            __stack.lineno = 28;
                        }
                        buf.push("");
                        __stack.lineno = 28;
                    });
                    buf.push("");
                    __stack.lineno = 28;
                }
                buf.push("\n");
                __stack.lineno = 29;
                if (q.money) {
                    buf.push(" | money = {{cost|", (__stack.lineno = 29, q.getGold()), "|", (__stack.lineno = 29, q.getSilver()), "|", (__stack.lineno = 29, q.getCopper()), "}}\n");
                    __stack.lineno = 30;
                }
                buf.push("");
                __stack.lineno = 30;
                if (q.repeatable) {
                    buf.push(" | repeatable = Yes\n");
                    __stack.lineno = 31;
                }
                buf.push("");
                __stack.lineno = 31;
                if (!q.shareable) {
                    buf.push(" | shareable = No\n");
                    __stack.lineno = 32;
                }
                buf.push(" | previous = ");
                __stack.lineno = 32;
                q.previousQuests.forEach(function(quest, index) {
                    buf.push("[[Quest:", (__stack.lineno = 33, quest), "]]");
                    __stack.lineno = 33;
                    if (index < q.previousQuests.length - 1) {
                        buf.push(", ");
                        __stack.lineno = 35;
                    }
                });
                buf.push("\n | next = ");
                __stack.lineno = 38;
                q.nextQuests.forEach(function(quest, index) {
                    buf.push("[[Quest:", (__stack.lineno = 39, quest), "]]");
                    __stack.lineno = 39;
                    if (index < q.nextQuests.length - 1) {
                        buf.push(", ");
                        __stack.lineno = 41;
                    }
                });
                buf.push("\n");
                __stack.lineno = 44;
                if (q.faction && q.faction !== "Neutral") {
                    buf.push(" | other-faction =\n ");
                    __stack.lineno = 45;
                }
                buf.push("}}\n\n==Objectives==\n");
                __stack.lineno = 48;
                if (q.objectives) {
                    buf.push("", (__stack.lineno = 48, q.objectives), "\n");
                    __stack.lineno = 49;
                } else {
                    buf.push("...\n");
                    __stack.lineno = 50;
                }
                buf.push("");
                __stack.lineno = 50;
                q.stages.forEach(function(stage) {
                    buf.push("* ", (__stack.lineno = 50, stage), "\n");
                    __stack.lineno = 51;
                });
                buf.push("");
                __stack.lineno = 51;
                q.providedItems.forEach(function(item) {
                    buf.push("* [[", (__stack.lineno = 51, item), "]] (provided)\n");
                    __stack.lineno = 52;
                });
                buf.push("");
                __stack.lineno = 52;
                if (q.groupSize) {
                    buf.push("* Suggested players: ", (__stack.lineno = 52, q.groupSize), "\n");
                    __stack.lineno = 53;
                }
                buf.push("\n==Description==\n");
                __stack.lineno = 55;
                if (q.description) {
                    buf.push("", (__stack.lineno = 55, q.description), "\n");
                    __stack.lineno = 56;
                } else {
                    buf.push("...\n");
                    __stack.lineno = 57;
                }
                buf.push("\n");
                __stack.lineno = 58;
                if (q.hasRewards()) {
                    buf.push("==Rewards==\n");
                    __stack.lineno = 59;
                    if (q.choiceRewards.length) {
                        buf.push("{{itembox|You will be able to choose one of these rewards:\n");
                        __stack.lineno = 60;
                        q.choiceRewards.forEach(function(reward, index) {
                            buf.push("");
                            __stack.lineno = 60;
                            if (reward.quantity) {
                                buf.push("|q", (__stack.lineno = 60, index + 1), "=", (__stack.lineno = 60, reward.quantity), "");
                                __stack.lineno = 60;
                            }
                            buf.push("|", (__stack.lineno = 60, reward.name), "\n");
                            __stack.lineno = 61;
                        });
                        buf.push("}}\n\n");
                        __stack.lineno = 63;
                    }
                    buf.push("");
                    __stack.lineno = 63;
                    q.abilityRewards.forEach(function(reward, index) {
                        buf.push("You will ");
                        __stack.lineno = 63;
                        if (q.hasItemRewards()) {
                            buf.push("also ");
                            __stack.lineno = 63;
                        }
                        buf.push("learn: [[", (__stack.lineno = 63, reward), "]]\n");
                        __stack.lineno = 64;
                    });
                    buf.push("\n");
                    __stack.lineno = 65;
                    q.buffRewards.forEach(function(reward, index) {
                        buf.push("The following spell will be cast on you: [[", (__stack.lineno = 65, reward), "]]\n\n");
                        __stack.lineno = 67;
                    });
                    buf.push("");
                    __stack.lineno = 67;
                    if (q.money) {
                        buf.push("You will ");
                        __stack.lineno = 67;
                        if (q.hasChoiceAbilityOrBuffRewards()) {
                            buf.push("also ");
                            __stack.lineno = 67;
                        }
                        buf.push("receive: {{cost|", (__stack.lineno = 67, q.getGold()), "|", (__stack.lineno = 67, q.getSilver()), "|", (__stack.lineno = 67, q.getCopper()), "}}\n");
                        __stack.lineno = 68;
                    }
                    buf.push("");
                    __stack.lineno = 68;
                    if (q.nonChoiceRewards.length) {
                        buf.push("{{itembox|");
                        __stack.lineno = 68;
                        if (!q.money) {
                            buf.push("You will ");
                            __stack.lineno = 68;
                            if (q.hasChoiceAbilityOrBuffRewards()) {
                                buf.push("also ");
                                __stack.lineno = 68;
                            }
                            buf.push("receive:");
                            __stack.lineno = 68;
                        }
                        buf.push("");
                        __stack.lineno = 68;
                        q.nonChoiceRewards.forEach(function(reward, index) {
                            buf.push("");
                            __stack.lineno = 68;
                            if (reward.quantity) {
                                buf.push("|q", (__stack.lineno = 68, index + 1), "=", (__stack.lineno = 68, reward.quantity), "");
                                __stack.lineno = 68;
                            }
                            buf.push("|", (__stack.lineno = 68, reward.name), "\n");
                            __stack.lineno = 69;
                        });
                        buf.push("}}\n\n");
                        __stack.lineno = 71;
                    }
                    buf.push("");
                    __stack.lineno = 71;
                }
                buf.push("\n");
                __stack.lineno = 72;
                if (q.progress) {
                    buf.push("==Progress==\n", (__stack.lineno = 73, q.progress), "\n\n");
                    __stack.lineno = 75;
                }
                buf.push("");
                __stack.lineno = 75;
                if (q.completion) {
                    buf.push("==Completion==\n", (__stack.lineno = 76, q.completion), "\n");
                    __stack.lineno = 77;
                }
                buf.push("\n");
                __stack.lineno = 78;
                if (q.hasGains()) {
                    buf.push("==Gains==\n");
                    __stack.lineno = 79;
                    if (q.experience) {
                        buf.push("* ", (__stack.lineno = 79, q.getExperienceStr()), " [[XP]]\n");
                        __stack.lineno = 80;
                    }
                    buf.push("");
                    __stack.lineno = 80;
                    q.reputationGains.forEach(function(gain) {
                        buf.push("* ", (__stack.lineno = 80, gain.getFullText()), "\n");
                        __stack.lineno = 81;
                    });
                    buf.push("");
                    __stack.lineno = 81;
                }
                buf.push("");
                __stack.lineno = 81;
                q.otherGains.forEach(function(gain) {
                    buf.push("* ", (__stack.lineno = 81, gain), "\n");
                    __stack.lineno = 82;
                });
                buf.push("\n==Progression==\n...\n");
                __stack.lineno = 85;
                if (q.patchAdded) {
                    buf.push("\n==Patch changes==\n* {{Patch ", (__stack.lineno = 87, q.patchAdded), "|note=Added.}}\n");
                    __stack.lineno = 88;
                }
                buf.push("\n==External links==\n{{subst:el}}\n{{Elinks-quest|", (__stack.lineno = 91, q.id), "}}\n");
            })();
        }
        return buf.join("");
    } catch (err) {
        rethrow(err, __stack.input, __stack.filename, __stack.lineno);
    }
}

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_ItemReward__ = __webpack_require__(4);


class Quest {
	constructor() {
		this.stages = [];
		this.providedItems = [];

		this.choiceRewards = [];
		this.nonChoiceRewards = [];
		this.abilityRewards = [];
		this.buffRewards = [];

		this.reputationGains = [];
		this.otherGains = [];

		this.previousQuests = [];
		this.nextQuests = [];
	}

	getGold() {
		return Math.floor(this.money / 10000) || "";
	}

	getSilver() {
		return (Math.floor(this.money / 100) % 100) || "";
	}

	getCopper() {
		return (this.money % 100) || "";
	}
	
	hasItemRewards() {
		return this.choiceRewards.length > 0 || this.nonChoiceRewards.length > 0;
	}
	
	getAllNonChoiceRewards() {
		let result = this.nonChoiceRewards.slice();
		
		// These are not actually item rewards, but the formatter will behave as if they're items with unknown quantity
		function insertReward(reward) {
			result.push(new __WEBPACK_IMPORTED_MODULE_0__core_ItemReward__["a" /* default */](reward, null, result.length + 1));
		}

		this.abilityRewards.forEach(insertReward);
		this.buffRewards.forEach(insertReward);
		return result;
	}
	
	hasChoiceAbilityOrBuffRewards() {
		return this.choiceRewards.length > 0 || this.abilityRewards.length > 0 || this.buffRewards.length > 0;
	}
	
	hasNonMoneyRewards() {
		return this.hasItemRewards() || this.abilityRewards.length > 0 || this.buffRewards.length > 0;
	}
	
	hasRewards() {
		return !!this.money || this.hasNonMoneyRewards();
	}

	getExperienceStr() {
		return new Intl.NumberFormat("en-US").format(this.experience);
	}
	
	hasGains() {
		return !!this.experience || this.reputationGains.length > 0;
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Quest;



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class ReputationGain {
	/**
	 * 
	 * @param {string} faction 
	 * @param {number} canonicalName 
	 * @param {number} gain
	 */
	constructor(faction, canonicalName, gain) {
		this.faction = faction;
		this.canonicalName = canonicalName;
		this.gain = gain;
	}

	/**
	 * @return {string}
	 */
	getLink() {
		if (this.canonicalName == null) {
			return "[[" + this.faction + "]]";
		} else {
			return "[[" + this.canonicalName + "|" + this.faction + "]]";
		}
	}

	/**
	 * @return {string}
	 */
	getFullText() {
		return "+" + this.gain + " reputation with " + this.getLink();
	}

	/**
	 * @return {string}
	 */
	toString() {
		return "+" + this.gain + " " + this.getLink();
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ReputationGain;



/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = MissionParser;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__common_shortcuts__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__substitutions__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__templates_mission_ejs__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__templates_mission_ejs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__templates_mission_ejs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__model_mission_Mission__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__model_mission_GarrisonMission__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__model_mission_NavalMission__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__model_mission_ClassHallMission__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__model_mission_MissionEnemy__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__model_core_ItemReward__ = __webpack_require__(4);













// Magic numbers from breadcrumb bar
const MISSION_SYSTEM_GARRISONS = 21;
const MISSION_SYSTEM_CLASS_HALLS = 30;
const MISSION_UNIT_FOLLOWERS = 1;
const MISSION_UNIT_SHIPS = 2;

/**
 * @param {ParserContext} context 
 */
function MissionParser(context) {
	this.context = context;
	this.templatePrefix = "m";
	this.template = __WEBPACK_IMPORTED_MODULE_3__templates_mission_ejs___default.a;

	/**
	 * @return {Mission}
	 */
	this.parse = function() {
		let mission = createMissionOfCorrectType();
		
		let url = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("link[rel=canonical]").getAttribute("href");
		let idStr = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(url, "/mission=([0-9]+)/", 1);
		mission.id = parseInt(idStr, 10);
		
		let mainContainer = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("#main-contents > div.text");
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
		let categoryIds = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getCategoryIds();
		
		if (categoryIds[1] === MISSION_SYSTEM_CLASS_HALLS) {
			return new __WEBPACK_IMPORTED_MODULE_7__model_mission_ClassHallMission__["a" /* default */]();
		}

		switch (categoryIds[3]) {
		case MISSION_UNIT_FOLLOWERS:
			return new __WEBPACK_IMPORTED_MODULE_5__model_mission_GarrisonMission__["a" /* default */]();
		case MISSION_UNIT_SHIPS:
			return new __WEBPACK_IMPORTED_MODULE_6__model_mission_NavalMission__["a" /* default */]();
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

		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getFirstWithOwnText(headingsSize3, "Description", descriptionHeading => {
			mission.description = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].collectTextUntilNextTag(descriptionHeading, "h2"));
		});
	}


	/**
	 * 
	 * @param {Mission} mission 
	 * @param {Element} mainContainer 
	 */
	function parseEncounters(mission, mainContainer) {
		let useLegionThreats = mission instanceof __WEBPACK_IMPORTED_MODULE_7__model_mission_ClassHallMission__["a" /* default */];
		
		for (let td of mainContainer.querySelectorAll("td.garrison-encounter-enemy")) {
			if (td.classList.contains("empty")) {
				continue;
			}
			
			let enemyName = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(td.querySelector("span.garrison-encounter-enemy-name").textContent);
			let enemyCounters = [];
			
			for (let mechanic of td.querySelectorAll("div.garrison-encounter-enemy-mechanic")) {
				if (useLegionThreats) {
					// Try to parse Legion mission counter, if available
					let abilityLink = mechanic.getAttribute("data-href");
					let abilityStr = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(abilityLink, "/mission-ability=([0-9]+)", 1);
					
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
			
			mission.enemies.push(new __WEBPACK_IMPORTED_MODULE_8__model_mission_MissionEnemy__["a" /* default */](enemyName, enemyCounters));
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
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getFirstWithOwnText(headingsSize3, "Cost", costHeading => {
			let icontab = costHeading;
			
			do {
				icontab = icontab.nextElementSibling;
			} while (__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(icontab) !== "table" || !icontab.classList.contains("icontab"));
			
			// Mission cost is the quantity of the only item in the icontab
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].collectItemRewards(icontab, (item, quantity) => mission.cost = quantity);
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
		
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getFirstWithOwnText(headingsSize3, "Gains", heading => {
			gainsList = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].findNextElementSibling(heading, el => __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(el) === "ul");
		});
		
		if (gainsList) {
			for (let li of gainsList.getElementsByTagName("li")) {
				let text = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(li.textContent);
				let maybeXP = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(text, "([0-9,]*) experience", 1);
				
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
		
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getFirstWithOwnText(headingsSize3, "Rewards", rewardsHeading => {
			// Look through everything between Rewards and the next header (or end of parent)
			for (let el = rewardsHeading.nextElementSibling;
					el !== null && !(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(el) === "h3" && el.classList.contains("heading-size-3"));
					el = el.nextElementSibling) {
				if (__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(el) === "table" && el.classList.contains("icontab")) {
					parseItemRewards(mission, el);
				} else if (__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(el) === "ul") {
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
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].collectItemRewards(icontab, (item, quantity) => {
			if (item === mission.getResourceName()) {
				mission.bonusResources = quantity;
			} else {
				mission.bonusItems.push(new __WEBPACK_IMPORTED_MODULE_9__model_core_ItemReward__["a" /* default */](item, quantity, mission.bonusItems.length + 1));
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
			let text = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].normalize(li.textContent);
			let maybeXP = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(text, "([0-9,]*) experience", 1);
			
			if (maybeXP) {
				mission.bonusXP = parseInt(maybeXP.replace(",", ""));
				continue;
			}
			
			let money = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getMoney(li);
			
			if (money !== 0) {
				mission.bonusMoney = money;
			}
		}
	}

	function parseInfobox(mission) {
		// Infobox section
		// Pattern-match each infobox line
		for (let infoboxLine of __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getInfoboxLines(true)) {
			if (infoboxLine.startsWith("Rare")) {
				mission.rare = true;
				continue;
			}
			
			if (infoboxLine.startsWith("Exhausting")) {
				mission.exhausting = true;
				continue;
			}
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Level: ([0-9]+)", 1, levelStr => {
				mission.level = parseInt(levelStr);
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Required item level: ([0-9]+)", 1, levelStr => {
				mission.followerItemLevel = parseInt(levelStr);
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Location: (.+)", 1, location => {
				mission.location = location;
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Duration: (.+)", 1, duration => {
				mission.duration = duration;
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Type: (.+)", 1, type => {
				mission.type = type;
			});

			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Category: (.+)", 1, category => {
				mission.category = category;
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Class: ([0-9]+)", 1, classId => {
				mission.characterClass = context.classes[classId];
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1, patch => {
				mission.patchAdded = __WEBPACK_IMPORTED_MODULE_2__substitutions__["a" /* default */].getCanonicalPatchVersion(patch);
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "(?:Followers|Champions|Ships): ([0-9]+)", 1, groupSize => {
				mission.groupSize = parseInt(groupSize);
			});
		}
	}
}


/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = function anonymous(locals, filters, escape, rethrow) {
    escape = escape || function(html) {
        return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    };
    var __stack = {
        lineno: 1,
        input: "{{<%- m.getInfoboxTemplate() %>\n | id = <%- m.id %>\n | name = <%- m.name %>\n | location = <%- m.location %>\n<% if (m.faction) { -%>\n | faction = <%- m.faction %>\n<% } -%>\n<% if (m.characterClass) { -%>\n | class = <%- m.characterClass %>\n<% } -%>\n | level = <%- m.level %>\n<% if (m.followerItemLevel) { -%>\n | flevel = <%- m.followerItemLevel %>\n<% } -%>\n<% if (m.rare) { -%>\n | rare = yes\n<% } -%>\n<% if (m.exhausting) { -%>\n | exhausting = yes\n<% } -%>\n | duration = <%- m.duration %>\n<% if (m.groupSize) { -%>\n | groupsize = <%- m.groupSize %>\n<% } -%>\n | type = <%- m.category %>\n | enemies = <% m.enemies.forEach(function(enemy, index) { %><%- enemy.name %><% if (index < m.enemies.length - 1) { %><br /><% } }) %>\n<% if (m.cost) { -%>\n | cost = <%- m.cost %>\n<% } -%>\n<% if (m.followerXP) { -%>\n | experience = <%- m.getFollowerXPStr() %>\n<% } -%>\n<% if (m.money) { -%>\n | bonusgold = {{cost|<%- m.getGold() %>|<%- m.getSilver() %>|<%- m.getCopper() %>}}\n<% } -%>\n<% if (m.bonusXP) { -%>\n | bonusxp = <%- m.getBonusXPStr() %>\n<% } -%>\n<% if (m.bonusResources) { -%>\n | bonusresources = <%- m.bonusResources %>\n<% } -%>\n<% if (m.bonusItems.length) { -%>\n | bonusitem = <% m.bonusItems.forEach(function(item, index) { %><% if (item.quantity) { %><%- item.quantity %>x <% } %>[[<%- item.name %>]]<% if (index < m.bonusItems.length - 1) { %><br /><% } }) %>\n<% } -%>\n}}\n\n==Description==\n<% if (m.description) { -%>\n<%- m.description %>\n<% } else { -%>\n...\n<% } -%>\n\n==Counters==\n<% if (m.type) { -%>\n* Type: {{Garrison ability|<%- m.type %>}}\n<% } -%>\n<% m.enemies.forEach(function(enemy) { -%>\n* <%- enemy.name %>:<% enemy.counters.forEach(function(counter) { %> {{Garrison ability|<%- counter %>}}<% }) %>\n<% }) -%>\n<% if (m.followerXP) { -%>\n\n==Gains==\n* <%- m.getFollowerXPStr() %> follower XP\n<% } -%>\n\n<% if (m.hasRewards()) { -%>\n==Rewards==\n<% if (m.bonusItems.length) { -%>\n{{itembox|You will receive:\n<% m.bonusItems.forEach(function(item, index) { -%>\n<% if (item.quantity) { %>|q<%- (index + 1) %>=<%- item.quantity %><% } %>|<%- item.name %>\n<% }) -%>\n}}\n<% } -%>\n\n<% if (m.hasNonItemRewards()) { -%>\nYou will <% if (m.bonusItems.length) { -%>also <% } -%>receive:\n<% if (m.bonusXP) { -%>\n* <%- m.getBonusXPStr() %> bonus follower XP\n<% } -%>\n<% if (m.money) { -%>\n* {{cost|<%- m.getGold() %>|<%- m.getSilver() %>|<%- m.getCopper() %>}}\n<% } -%>\n<% if (m.bonusResources) { -%>\n* [[<%- m.getResourceName() %>]] (<%- m.bonusResources %>)\n\n<% } -%>\n<% } -%>\n<% } -%>\n<% if (m.patchAdded) { -%>\n==Patch changes==\n* {{Patch <%- m.patchAdded %>|note=Added.}}\n\n<% } -%>\n==External links==\n{{subst:el}}\n{{Elinks-mission|<%- m.id %>}}\n",
        filename: "."
    };
    function rethrow(err, str, filename, lineno) {
        var lines = str.split("\n"), start = Math.max(lineno - 3, 0), end = Math.min(lines.length, lineno + 3);
        var context = lines.slice(start, end).map(function(line, i) {
            var curr = i + start + 1;
            return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
        }).join("\n");
        err.path = filename;
        err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
        throw err;
    }
    try {
        var buf = [];
        with (locals || {}) {
            (function() {
                buf.push("{{", (__stack.lineno = 1, m.getInfoboxTemplate()), "\n | id = ", (__stack.lineno = 2, m.id), "\n | name = ", (__stack.lineno = 3, m.name), "\n | location = ", (__stack.lineno = 4, m.location), "\n");
                __stack.lineno = 5;
                if (m.faction) {
                    buf.push(" | faction = ", (__stack.lineno = 5, m.faction), "\n");
                    __stack.lineno = 6;
                }
                buf.push("");
                __stack.lineno = 6;
                if (m.characterClass) {
                    buf.push(" | class = ", (__stack.lineno = 6, m.characterClass), "\n");
                    __stack.lineno = 7;
                }
                buf.push(" | level = ", (__stack.lineno = 7, m.level), "\n");
                __stack.lineno = 8;
                if (m.followerItemLevel) {
                    buf.push(" | flevel = ", (__stack.lineno = 8, m.followerItemLevel), "\n");
                    __stack.lineno = 9;
                }
                buf.push("");
                __stack.lineno = 9;
                if (m.rare) {
                    buf.push(" | rare = yes\n");
                    __stack.lineno = 10;
                }
                buf.push("");
                __stack.lineno = 10;
                if (m.exhausting) {
                    buf.push(" | exhausting = yes\n");
                    __stack.lineno = 11;
                }
                buf.push(" | duration = ", (__stack.lineno = 11, m.duration), "\n");
                __stack.lineno = 12;
                if (m.groupSize) {
                    buf.push(" | groupsize = ", (__stack.lineno = 12, m.groupSize), "\n");
                    __stack.lineno = 13;
                }
                buf.push(" | type = ", (__stack.lineno = 13, m.category), "\n | enemies = ");
                __stack.lineno = 14;
                m.enemies.forEach(function(enemy, index) {
                    buf.push("", (__stack.lineno = 14, enemy.name), "");
                    __stack.lineno = 14;
                    if (index < m.enemies.length - 1) {
                        buf.push("<br />");
                        __stack.lineno = 14;
                    }
                });
                buf.push("\n");
                __stack.lineno = 15;
                if (m.cost) {
                    buf.push(" | cost = ", (__stack.lineno = 15, m.cost), "\n");
                    __stack.lineno = 16;
                }
                buf.push("");
                __stack.lineno = 16;
                if (m.followerXP) {
                    buf.push(" | experience = ", (__stack.lineno = 16, m.getFollowerXPStr()), "\n");
                    __stack.lineno = 17;
                }
                buf.push("");
                __stack.lineno = 17;
                if (m.money) {
                    buf.push(" | bonusgold = {{cost|", (__stack.lineno = 17, m.getGold()), "|", (__stack.lineno = 17, m.getSilver()), "|", (__stack.lineno = 17, m.getCopper()), "}}\n");
                    __stack.lineno = 18;
                }
                buf.push("");
                __stack.lineno = 18;
                if (m.bonusXP) {
                    buf.push(" | bonusxp = ", (__stack.lineno = 18, m.getBonusXPStr()), "\n");
                    __stack.lineno = 19;
                }
                buf.push("");
                __stack.lineno = 19;
                if (m.bonusResources) {
                    buf.push(" | bonusresources = ", (__stack.lineno = 19, m.bonusResources), "\n");
                    __stack.lineno = 20;
                }
                buf.push("");
                __stack.lineno = 20;
                if (m.bonusItems.length) {
                    buf.push(" | bonusitem = ");
                    __stack.lineno = 20;
                    m.bonusItems.forEach(function(item, index) {
                        buf.push("");
                        __stack.lineno = 20;
                        if (item.quantity) {
                            buf.push("", (__stack.lineno = 20, item.quantity), "x ");
                            __stack.lineno = 20;
                        }
                        buf.push("[[", (__stack.lineno = 20, item.name), "]]");
                        __stack.lineno = 20;
                        if (index < m.bonusItems.length - 1) {
                            buf.push("<br />");
                            __stack.lineno = 20;
                        }
                    });
                    buf.push("\n");
                    __stack.lineno = 21;
                }
                buf.push("}}\n\n==Description==\n");
                __stack.lineno = 24;
                if (m.description) {
                    buf.push("", (__stack.lineno = 24, m.description), "\n");
                    __stack.lineno = 25;
                } else {
                    buf.push("...\n");
                    __stack.lineno = 26;
                }
                buf.push("\n==Counters==\n");
                __stack.lineno = 28;
                if (m.type) {
                    buf.push("* Type: {{Garrison ability|", (__stack.lineno = 28, m.type), "}}\n");
                    __stack.lineno = 29;
                }
                buf.push("");
                __stack.lineno = 29;
                m.enemies.forEach(function(enemy) {
                    buf.push("* ", (__stack.lineno = 29, enemy.name), ":");
                    __stack.lineno = 29;
                    enemy.counters.forEach(function(counter) {
                        buf.push(" {{Garrison ability|", (__stack.lineno = 29, counter), "}}");
                        __stack.lineno = 29;
                    });
                    buf.push("\n");
                    __stack.lineno = 30;
                });
                buf.push("");
                __stack.lineno = 30;
                if (m.followerXP) {
                    buf.push("\n==Gains==\n* ", (__stack.lineno = 32, m.getFollowerXPStr()), " follower XP\n");
                    __stack.lineno = 33;
                }
                buf.push("\n");
                __stack.lineno = 34;
                if (m.hasRewards()) {
                    buf.push("==Rewards==\n");
                    __stack.lineno = 35;
                    if (m.bonusItems.length) {
                        buf.push("{{itembox|You will receive:\n");
                        __stack.lineno = 36;
                        m.bonusItems.forEach(function(item, index) {
                            buf.push("");
                            __stack.lineno = 36;
                            if (item.quantity) {
                                buf.push("|q", (__stack.lineno = 36, index + 1), "=", (__stack.lineno = 36, item.quantity), "");
                                __stack.lineno = 36;
                            }
                            buf.push("|", (__stack.lineno = 36, item.name), "\n");
                            __stack.lineno = 37;
                        });
                        buf.push("}}\n");
                        __stack.lineno = 38;
                    }
                    buf.push("\n");
                    __stack.lineno = 39;
                    if (m.hasNonItemRewards()) {
                        buf.push("You will ");
                        __stack.lineno = 39;
                        if (m.bonusItems.length) {
                            buf.push("also ");
                            __stack.lineno = 39;
                        }
                        buf.push("receive:");
                        __stack.lineno = 39;
                        if (m.bonusXP) {
                            buf.push("* ", (__stack.lineno = 39, m.getBonusXPStr()), " bonus follower XP\n");
                            __stack.lineno = 40;
                        }
                        buf.push("");
                        __stack.lineno = 40;
                        if (m.money) {
                            buf.push("* {{cost|", (__stack.lineno = 40, m.getGold()), "|", (__stack.lineno = 40, m.getSilver()), "|", (__stack.lineno = 40, m.getCopper()), "}}\n");
                            __stack.lineno = 41;
                        }
                        buf.push("");
                        __stack.lineno = 41;
                        if (m.bonusResources) {
                            buf.push("* [[", (__stack.lineno = 41, m.getResourceName()), "]] (", (__stack.lineno = 41, m.bonusResources), ")\n\n");
                            __stack.lineno = 43;
                        }
                        buf.push("");
                        __stack.lineno = 43;
                    }
                    buf.push("");
                    __stack.lineno = 43;
                }
                buf.push("");
                __stack.lineno = 43;
                if (m.patchAdded) {
                    buf.push("==Patch changes==\n* {{Patch ", (__stack.lineno = 44, m.patchAdded), "|note=Added.}}\n\n");
                    __stack.lineno = 46;
                }
                buf.push("==External links==\n{{subst:el}}\n{{Elinks-mission|", (__stack.lineno = 48, m.id), "}}\n");
            })();
        }
        return buf.join("");
    } catch (err) {
        rethrow(err, __stack.input, __stack.filename, __stack.lineno);
    }
}

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Mission__ = __webpack_require__(2);


class GarrisonMission extends __WEBPACK_IMPORTED_MODULE_0__Mission__["a" /* default */] {
	getInfoboxTemplate() {
		return "Missionbox";
	}

	getResourceName() {
		return "Garrison Resources";
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = GarrisonMission;



/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Mission__ = __webpack_require__(2);


class NavalMission extends __WEBPACK_IMPORTED_MODULE_0__Mission__["a" /* default */] {
	getInfoboxTemplate() {
		return "Navalbox";
	}

	getResourceName() {
		return "Oil";
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = NavalMission;



/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Mission__ = __webpack_require__(2);


class ClassHallMission extends __WEBPACK_IMPORTED_MODULE_0__Mission__["a" /* default */] {
	getInfoboxTemplate() {
		return "MissionLegionbox";
	}

	getResourceName() {
		return "Order Resources";
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ClassHallMission;



/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class MissionEnemy {
	/**
	 * 
	 * @param {string} name 
	 * @param {Array.<string>} counters 
	 */
	constructor(name, counters) {
		this.name = name;
		this.counters = counters.slice();
	}

	toString() {
		return this.name + " " + this.counters;
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MissionEnemy;



/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = NPCParser;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__common_shortcuts__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__substitutions__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__templates_npc_ejs__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__templates_npc_ejs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__templates_npc_ejs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__model_npc_NPC__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__model_npc_NPCQuest__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__model_npc_SoldItem__ = __webpack_require__(22);










/**
 * @param {ParserContext} context 
 */
function NPCParser(context) {
	this.context = context;
	this.templatePrefix = "n";
	this.template = __WEBPACK_IMPORTED_MODULE_3__templates_npc_ejs___default.a;

	/**
	 * @return {NPC}
	 */
	this.parse = function() {
		let npc = new __WEBPACK_IMPORTED_MODULE_4__model_npc_NPC__["a" /* default */]();
		
		let url = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("link[rel=canonical]").getAttribute("href");
		let idStr = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(url, "/npc=([0-9]+)/", 1);
		npc.id = parseInt(idStr, 10);
		
		let mainContainer = Object(__WEBPACK_IMPORTED_MODULE_0__common_shortcuts__["a" /* $ */])("#main-contents > div.text");
		let npcName = mainContainer.querySelector("h1.heading-size-1").textContent;
		
		npc.name = npcName.replace(/<.*>/g, "").trim();
		
		// If we have a title
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(npcName, "<(.*)>", 1, title => {
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
		let categoryIds = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getCategoryIds();
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
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getElementContainingOwnText(document, "script", "new Listview", script => {
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
		
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(script, "new Listview\\(\\{template: 'quest', id: 'starts', (.*)\\);", 1, s => {
			addQuests(startsQuests, s);
		});
		
		let finishesQuests = new Set();
		
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(script, "new Listview\\(\\{template: 'quest', id: 'ends', (.*)\\);", 1, s => {
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
			quests.push(new __WEBPACK_IMPORTED_MODULE_5__model_npc_NPCQuest__["a" /* default */](quest, true, true));
		}
		
		for (let quest of startsQuests) {
			quests.push(new __WEBPACK_IMPORTED_MODULE_5__model_npc_NPCQuest__["a" /* default */](quest, true, false));
		}
		
		for (let quest of finishesQuests) {
			quests.push(new __WEBPACK_IMPORTED_MODULE_5__model_npc_NPCQuest__["a" /* default */](quest, false, true));
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
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(script, /new Listview\(\{template: 'item', id: 'sells', (.*)\);/, 1, s => {
			let soldItems = [];
			let regex = /"name":"[0-9]([^"]+)".+?cost:\[([0-9]+)/g;
			let match;
			
			while ((match = regex.exec(s)) !== null) {
				soldItems.push(new __WEBPACK_IMPORTED_MODULE_6__model_npc_SoldItem__["a" /* default */](match[1], parseInt(match[2])));
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
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(script, "new Listview\\(\\{template: 'sound', id: 'sounds', (.*)\\);", 1, s => {
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
				__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(s, "\"name\":\"([A-Za-z0-9_]+)(?:Attack|ATTACK)\"", 1, race => {
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
				let quotesEl = __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].findNextElementSibling(link.parentElement, el => __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].tagName(el) === "div");

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
		__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getElementContainingOwnText(document, "script", "Health: ", script => {
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(script.textContent, "Health: ([0-9,]+)", 1, health => {
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
		for (let infoboxLine of __WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getInfoboxLines(false)) {
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Level: (.+)", 1, levelStr => {
				let match = levelStr.match(/([^ ]+)(?: - ([0-9]+))?/);
				
				if (match) {
					npc.levelLow = match[1];
					npc.levelHigh = match[2];
				}
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Classification: (.+)", 1, levelClassification => {
				npc.levelClassification = levelClassification;
			});

			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "React: (.+)", 1, reaction => {
				__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(reaction, "<q([^>]*)>A", 1, colorId => {
					npc.allianceReaction = getReactionByColor(colorId);
				});

				__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(reaction, "<q([^>]*)>H", 1, colorId => {
					npc.hordeReaction = getReactionByColor(colorId);
				});
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Faction: (.+)", 1, repFaction => {
				npc.repFaction = repFaction;
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Tameable \\((.+)\\)", 1, petFamily => {
				npc.petFamily = petFamily;
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Worth: ([0-9]+)", 1, money => {
				npc.money = parseInt(money);
			});
			
			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Mana: ([0-9,]+)", 1, mana => {
				npc.mana = parseInt(mana.replace(/,/g, ""));
			});

			__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* default */].getRegexGroup(infoboxLine, "Added in patch ([0-9]+.[0-9]+.[0-9]+)", 1, patch => {
				npc.patchAdded = __WEBPACK_IMPORTED_MODULE_2__substitutions__["a" /* default */].getCanonicalPatchVersion(patch);
			});
		}
	}

	/**
	 * 
	 * @param {string} colorId 
	 */
	function getReactionByColor(colorId) {
		switch (colorId) {
			case "":
				return "Neutral";
			case "2":
				return "Friendly";
			case "10":
				return "Hostile";
			default:
				throw new Error();
			}
	}
}


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = function anonymous(locals, filters, escape, rethrow) {
    escape = escape || function(html) {
        return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    };
    var __stack = {
        lineno: 1,
        input: "{{Stub/NPC}}\n<% if (n.location) { -%>\n{{screenshot||<%- n.location %>}}\n<% } -%>\n{{Npcbox\n | name = <%- n.name %>\n | image = <%- n.name %>.jpg\n<% if (n.title) { -%>\n | title = <%- n.title %>\n<% } -%>\n | gender = <%- n.gender %>\n | level = <%- n.levelLow %><% if (n.levelHigh) { %> - <%- n.levelHigh %><% } %>\n<% if (n.levelClassification) { -%>\n | type = <%- n.levelClassification %>\n<% } -%>\n<% if (n.health) { -%>\n | health = <%- n.healthStr %>\n<% } -%>\n<% if (n.mana) { -%>\n | mana = <%- n.manaStr %>\n<% } -%>\n | faction = <%- n.getFaction() %>\n | aggro = {{Aggro|<%- n.allianceReaction %>|<%- n.hordeReaction %>}}\n | race = <%- n.race %>\n | creature = <%- n.creatureType %>\n<% if (n.repFaction) { -%>\n | repfaction = <%- n.repFaction %>\n<% } -%>\n | location = <% if (n.location) { %>[[<%- n.location %>]]<% } %>\n<% if (n.petFamily) { -%>\n | pet = <%- n.petFamily %>\n<% } -%>\n<% if (n.money) { -%>\n | money = {{Cost|<%- n.getGold() %>|<%- n.getSilver() %>|<%- n.getCopper() %>}}\n<% } -%>\n}}\n'''<%- n.name %>''' is a<% if (n.isRaceStartsWithVowel()) { %>n<% } %> [[<%- (n.race || \"\").toLowerCase() %>]] located in [[<%- n.location %>]].\n<% if (n.itemsSold.length) { -%>\n\n==Sells==\n<% if (n.isUseItembox()) { -%>\n{{Itembox\n<% n.itemsSold.forEach(function(item, index) { -%>\n|<%- item.name %>|c<%- (index + 1) %>={{Cost|<%- item.getGold() %>|<%- item.getSilver() %>|<%- item.getCopper() %>}}\n<% }) -%>\n}}\n<% } else { -%>\n{| class=\"darktable sortable zebra\"\n! Item !! Cost\n<% n.itemsSold.forEach(function(item) { -%>\n|-\n| [[<%- item.name %>]] || {{Cost|<%- item.getGold() %>|<%- item.getSilver() %>|<%- item.getCopper() %>}}\n<% }) -%>\n|}\n<% } -%>\n<% } -%>\n<% if (n.quests.length) { -%>\n\n==Quests==\n<% n.quests.forEach(function(quest) { -%>\n* [[Quest:<%- quest.name %>]] <%\n	if (quest.starts) {\n		if (quest.finishes) {\n			%>{{queststartfinish}}<%\n		} else {\n			%>{{queststart}}<%\n		}\n	} else if (quest.finishes) {\n		%>{{questfinish}}<%\n	} %>\n<% }) -%>\n<% } -%>\n<% if (n.quotes.length) { -%>\n\n==Quotes==\n<% n.quotes.forEach(function(quote) { -%>\n* <%- quote %>\n<% }) -%>\n<% } -%>\n<% if (n.patchAdded) { -%>\n\n==Patch changes==\n* {{Patch <%- n.patchAdded %>|note=Added.}}\n<% } -%>\n\n==External links==\n{{subst:el}}\n{{Elinks-NPC|<%- n.id %>}}\n\n<% if (n.location) { -%>\n[[Category:<%- n.location %> NPCs]]\n<% } -%>\n<% if (n.isQuestGiver()) { -%>\n[[Category:Quest givers]]\n<% } -%>\n<% if (n.isQuestEnder()) { -%>\n[[Category:Quest enders]]\n<% } -%>\n<% if (n.itemsSold.length) { -%>\n[[Category:Vendors]]\n<% } -%>\n<% if (!n.location && !n.quests.length && !n.itemsSold.length) { -%>\n[[Category:World of Warcraft NPCs]]\n<% } -%>\n",
        filename: "."
    };
    function rethrow(err, str, filename, lineno) {
        var lines = str.split("\n"), start = Math.max(lineno - 3, 0), end = Math.min(lines.length, lineno + 3);
        var context = lines.slice(start, end).map(function(line, i) {
            var curr = i + start + 1;
            return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
        }).join("\n");
        err.path = filename;
        err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
        throw err;
    }
    try {
        var buf = [];
        with (locals || {}) {
            (function() {
                buf.push("{{Stub/NPC}}\n");
                __stack.lineno = 2;
                if (n.location) {
                    buf.push("{{screenshot||", (__stack.lineno = 2, n.location), "}}\n");
                    __stack.lineno = 3;
                }
                buf.push("{{Npcbox\n | name = ", (__stack.lineno = 4, n.name), "\n | image = ", (__stack.lineno = 5, n.name), ".jpg\n");
                __stack.lineno = 6;
                if (n.title) {
                    buf.push(" | title = ", (__stack.lineno = 6, n.title), "\n");
                    __stack.lineno = 7;
                }
                buf.push(" | gender = ", (__stack.lineno = 7, n.gender), "\n | level = ", (__stack.lineno = 8, n.levelLow), "");
                __stack.lineno = 8;
                if (n.levelHigh) {
                    buf.push(" - ", (__stack.lineno = 8, n.levelHigh), "");
                    __stack.lineno = 8;
                }
                buf.push("\n");
                __stack.lineno = 9;
                if (n.levelClassification) {
                    buf.push(" | type = ", (__stack.lineno = 9, n.levelClassification), "\n");
                    __stack.lineno = 10;
                }
                buf.push("");
                __stack.lineno = 10;
                if (n.health) {
                    buf.push(" | health = ", (__stack.lineno = 10, n.healthStr), "\n");
                    __stack.lineno = 11;
                }
                buf.push("");
                __stack.lineno = 11;
                if (n.mana) {
                    buf.push(" | mana = ", (__stack.lineno = 11, n.manaStr), "\n");
                    __stack.lineno = 12;
                }
                buf.push(" | faction = ", (__stack.lineno = 12, n.getFaction()), "\n | aggro = {{Aggro|", (__stack.lineno = 13, n.allianceReaction), "|", (__stack.lineno = 13, n.hordeReaction), "}}\n | race = ", (__stack.lineno = 14, n.race), "\n | creature = ", (__stack.lineno = 15, n.creatureType), "\n");
                __stack.lineno = 16;
                if (n.repFaction) {
                    buf.push(" | repfaction = ", (__stack.lineno = 16, n.repFaction), "\n");
                    __stack.lineno = 17;
                }
                buf.push(" | location = ");
                __stack.lineno = 17;
                if (n.location) {
                    buf.push("[[", (__stack.lineno = 17, n.location), "]]");
                    __stack.lineno = 17;
                }
                buf.push("\n");
                __stack.lineno = 18;
                if (n.petFamily) {
                    buf.push(" | pet = ", (__stack.lineno = 18, n.petFamily), "\n");
                    __stack.lineno = 19;
                }
                buf.push("");
                __stack.lineno = 19;
                if (n.money) {
                    buf.push(" | money = {{Cost|", (__stack.lineno = 19, n.getGold()), "|", (__stack.lineno = 19, n.getSilver()), "|", (__stack.lineno = 19, n.getCopper()), "}}\n");
                    __stack.lineno = 20;
                }
                buf.push("}}\n'''", (__stack.lineno = 21, n.name), "''' is a");
                __stack.lineno = 21;
                if (n.isRaceStartsWithVowel()) {
                    buf.push("n");
                    __stack.lineno = 21;
                }
                buf.push(" [[", (__stack.lineno = 21, (n.race || "").toLowerCase()), "]] located in [[", (__stack.lineno = 21, n.location), "]].\n");
                __stack.lineno = 22;
                if (n.itemsSold.length) {
                    buf.push("\n==Sells==\n");
                    __stack.lineno = 24;
                    if (n.isUseItembox()) {
                        buf.push("{{Itembox\n");
                        __stack.lineno = 25;
                        n.itemsSold.forEach(function(item, index) {
                            buf.push("|", (__stack.lineno = 25, item.name), "|c", (__stack.lineno = 25, index + 1), "={{Cost|", (__stack.lineno = 25, item.getGold()), "|", (__stack.lineno = 25, item.getSilver()), "|", (__stack.lineno = 25, item.getCopper()), "}}\n");
                            __stack.lineno = 26;
                        });
                        buf.push("}}\n");
                        __stack.lineno = 27;
                    } else {
                        buf.push('{| class="darktable sortable zebra"\n! Item !! Cost\n');
                        __stack.lineno = 29;
                        n.itemsSold.forEach(function(item) {
                            buf.push("|-\n| [[", (__stack.lineno = 30, item.name), "]] || {{Cost|", (__stack.lineno = 30, item.getGold()), "|", (__stack.lineno = 30, item.getSilver()), "|", (__stack.lineno = 30, item.getCopper()), "}}\n");
                            __stack.lineno = 31;
                        });
                        buf.push("|}\n");
                        __stack.lineno = 32;
                    }
                    buf.push("");
                    __stack.lineno = 32;
                }
                buf.push("");
                __stack.lineno = 32;
                if (n.quests.length) {
                    buf.push("\n==Quests==\n");
                    __stack.lineno = 34;
                    n.quests.forEach(function(quest) {
                        buf.push("* [[Quest:", (__stack.lineno = 34, quest.name), "]] ");
                        __stack.lineno = 34;
                        if (quest.starts) {
                            if (quest.finishes) {
                                buf.push("{{queststartfinish}}");
                                __stack.lineno = 37;
                            } else {
                                buf.push("{{queststart}}");
                                __stack.lineno = 39;
                            }
                        } else if (quest.finishes) {
                            buf.push("{{questfinish}}");
                            __stack.lineno = 42;
                        }
                        buf.push("\n");
                        __stack.lineno = 44;
                    });
                    buf.push("");
                    __stack.lineno = 44;
                }
                buf.push("");
                __stack.lineno = 44;
                if (n.quotes.length) {
                    buf.push("\n==Quotes==\n");
                    __stack.lineno = 46;
                    n.quotes.forEach(function(quote) {
                        buf.push("* ", (__stack.lineno = 46, quote), "\n");
                        __stack.lineno = 47;
                    });
                    buf.push("");
                    __stack.lineno = 47;
                }
                buf.push("");
                __stack.lineno = 47;
                if (n.patchAdded) {
                    buf.push("\n==Patch changes==\n* {{Patch ", (__stack.lineno = 49, n.patchAdded), "|note=Added.}}\n");
                    __stack.lineno = 50;
                }
                buf.push("\n==External links==\n{{subst:el}}\n{{Elinks-NPC|", (__stack.lineno = 53, n.id), "}}\n\n");
                __stack.lineno = 55;
                if (n.location) {
                    buf.push("[[Category:", (__stack.lineno = 55, n.location), " NPCs]]\n");
                    __stack.lineno = 56;
                }
                buf.push("");
                __stack.lineno = 56;
                if (n.isQuestGiver()) {
                    buf.push("[[Category:Quest givers]]\n");
                    __stack.lineno = 57;
                }
                buf.push("");
                __stack.lineno = 57;
                if (n.isQuestEnder()) {
                    buf.push("[[Category:Quest enders]]\n");
                    __stack.lineno = 58;
                }
                buf.push("");
                __stack.lineno = 58;
                if (n.itemsSold.length) {
                    buf.push("[[Category:Vendors]]\n");
                    __stack.lineno = 59;
                }
                buf.push("");
                __stack.lineno = 59;
                if (!n.location && !n.quests.length && !n.itemsSold.length) {
                    buf.push("[[Category:World of Warcraft NPCs]]\n");
                    __stack.lineno = 60;
                }
                buf.push("");
            })();
        }
        return buf.join("");
    } catch (err) {
        rethrow(err, __stack.input, __stack.filename, __stack.lineno);
    }
}

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const MAX_ITEMBOX_ITEMS = 30;

/**
 * 
 * @param {Array.<any>} array 
 * @param {function} condition 
 */
function anyMatch(array, condition) {
	for (let element of array) {
		if (condition(element)) {
			return true;
		}
	}

	return false;
}

class NPC {
	constructor() {
		this.quests = [];
		this.quotes = [];
		this.itemsSold = [];
	}
	
	isQuestGiver() {
		return anyMatch(this.quests, q => q.starts);
	}
	
	isQuestEnder() {
		return anyMatch(this.quests, q => q.finishes);
	}
	
	getFaction() {
		if (this.allianceReaction == null && this.hordeReaction == null) {
			return null;
		} else if (this.allianceReaction === "Friendly" && this.hordeReaction !== "Friendly") {
			return "Alliance";
		} else if (this.allianceReaction !== "Friendly" && this.hordeReaction === "Friendly") {
			return "Horde";
		} else if (this.allianceReaction === "Hostile" && this.hordeReaction === "Hostile") {
			return "Combat";
		} else if (this.allianceReaction === "Neutral" && this.hordeReaction === "Neutral") {
			return "Combat";
		} else {
			return "Neutral";
		}
	}
	
	getHealthStr() {
		return new Intl.NumberFormat("en-US").format(this.health);
	}
	
	getManaStr() {
		return mana == null ? null : new Intl.NumberFormat("en-US").format(this.mana);
	}

	isUseItembox() {
		return this.itemsSold.length <= MAX_ITEMBOX_ITEMS;
	}
	
	isRaceStartsWithVowel() {
		return this.race && this.race.length && "AEIOU".includes(this.race.charAt(0));
	}

	getGold() {
		return Math.floor(this.money / 10000) || "";
	}

	getSilver() {
		return (Math.floor(this.money / 100) % 100) || "";
	}

	getCopper() {
		return (this.money % 100) || "";
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = NPC;



/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class NPCQuest {
	/**
	 * 
	 * @param {string} name 
	 * @param {boolean} starts 
	 * @param {boolean} finishes 
	 */
	constructor(name, starts, finishes) {
		this.name = name;
		this.starts = starts;
		this.finishes = finishes;
	}

	/**
	 * 
	 * @param {NPCQuest} other 
	 */
	compareTo(other) {
		return this.name.localeCompare(other.name);
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = NPCQuest;



/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class SoldItem {
	/**
	 * 
	 * @param {string} name 
	 * @param {number} price 
	 */
	constructor(name, price) {
		this.name = name;
		this.price = price || 0;
	}

	getGold() {
		return Math.floor(this.price / 10000) || "";
	}

	getSilver() {
		return (Math.floor(this.price / 100) % 100) || "";
	}

	getCopper() {
		return (this.price % 100) || "";
	}

	/**
	 * 
	 * @param {SoldItem} other 
	 */
	compareTo(other) {
		return this.name.localeCompare(other.name);
	}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SoldItem;



/***/ })
/******/ ]);
//# sourceMappingURL=page.js.map