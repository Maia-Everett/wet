function escapeRegExp(string) {
	return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
  
export default {
	/**
	 * @return {Array.<string>}
	 */
	getCategoryIds: function() {
		let breadcrumbData;

		for (let script of document.getElementsByTagName("script")) {
			let text = script.textContent;

			if (text.includes("PageTemplate.set({breadcrumb:")) {
				breadcrumbData = text;
				break;
			}
		};
		
		// ugh, parsing JS with regexes
		let regex = escapeRegExp("PageTemplate.set({breadcrumb: [") + "([0-9,-]+)" + escapeRegExp("]});");
		return this.getRegexGroup(breadcrumbData, regex, 1).split(",");
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
	 * @return {string}
	 */
	getRegexGroup: function(str, regex, group) {
		if (!regex instanceof RegExp) {
			regex = new Regex(regex);
		}
		
		let result = str.match(regex);

		if (result == null) {
			return null;
		}

		return result[group];
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

		return result.trim();
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
	 * @param {function} onFound
	 * @return {Element}
	 */
	getElementContainingOwnText: function(element, tagName, text, onFound) {
		return this.getFirstWithOwnText(element.getElementsByTagName(tagName), text, onFound);
	},

	/**
	 * @param {NodeList} elements
	 * @param {string} text
	 * @param {function} onFound
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
};
