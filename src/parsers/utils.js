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
	 * @param {Element} element
	 * @param {string} tagName
	 * @param {string} text
	 * @return {Element}
	 */
	getElementContainingOwnText: function(element, tagName, text) {
		for (let child of element.getElementsByTagName(tagName)) {
			if (child.textContent.includes(text)) {
				return child;
			}
		}

		return null;
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
	}
};
