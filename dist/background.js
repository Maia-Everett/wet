const PAGE_TYPES = new Set([
	"quest",
	"mission",
	"npc"
]);

function isSupported(url) {
	if (!url) {
		return false;
	}

	let result = url.match(/https?:\/\/(?:.+\.)?wowhead.com\/([a-z]+)=/);
	return result != null && PAGE_TYPES.has(result[1]);
}

chrome.tabs.onActivated.addListener(activeInfo => {
	chrome.tabs.get(activeInfo.tabId, tab => {
		if (isSupported(tab.url)) {
			chrome.pageAction.show(tab.id);
		} else if (tab.id) {
			chrome.pageAction.hide(tab.id);
		}
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (isSupported(tab.url)) {
		chrome.pageAction.show(tabId);
	} else {
		chrome.pageAction.hide(tabId);
	}
});

chrome.pageAction.onClicked.addListener(tab => {
	chrome.tabs.insertCSS(tab.id, {
		file: "/page/page.css"
	}, function() {
		chrome.tabs.executeScript(tab.id, {
			file: "/page/page.js"
		});
	});
});
