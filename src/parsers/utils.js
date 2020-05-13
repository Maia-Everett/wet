function escapeRegExp(string) {
	return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

export default {
	/**
	 * @return {Array.<number>}
	 */
	getCategoryIds: function() {
		let breadcrumbData;

		for (let script of document.getElementsByTagName("script")) {
			let text = script.textContent;

			if (text.includes(".set({breadcrumb:")) {
				breadcrumbData = text;
				break;
			}
		}
		
		// ugh, parsing JS with regexes
		let regex = escapeRegExp(".set({breadcrumb: [") + "([0-9, -]+)" + escapeRegExp("]});");
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
		
		let infoboxMarkup = this.getRegexGroup(infoboxData, "[Mm]arkup\\.printHtml\\((['\"])(.*)\\1, ['\"]infobox", 2)
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

		if (header == null) {
			return result;
		}
		
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
			// the next element is a td with the name of the actual item (and possibly a link)
			let itemName = this.textOf(iconPlaceholder.nextElementSibling.getElementsByTagName("span")[0]);
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
};
