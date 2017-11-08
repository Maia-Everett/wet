/**
 * Alias for `document.querySelector`.
 * 
 * @param selector {string} selector to query
 * @return {Element} element
 */
export function $(selector) {
	return document.querySelector(selector);
}

/**
 * Alias for `document.querySelectorAll`.
 * 
 * @param selector {string} selector to query
 * @return {NodeList} search result
 */
export function $$(selector) {
	return document.querySelectorAll(selector);
}
