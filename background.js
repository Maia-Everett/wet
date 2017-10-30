let lastResult = null;
let popupTab = null;
let browserInfo = null;

if (typeof browser !== "undefined") {
	browser.runtime.getBrowserInfo().then(info => browserInfo = info);
}

function isSupported(url) {
	let result = /https?:\/\/(www\.)?wowhead.com\/(quest|mission|npc)=/.test(url);
	return result;
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
	if (popupTab !== null && tabId == popupTab.id) {
		if (changeInfo.status == "complete") {
			chrome.tabs.sendMessage(popupTab.id, { result: lastResult });
		}

		return;
	}

	if (isSupported(tab.url)) {
		chrome.pageAction.show(tabId);
	} else {
		chrome.pageAction.hide(tabId);
	}
});

chrome.pageAction.onClicked.addListener(tab => {
	chrome.tabs.executeScript(tab.id, {
		file: "/page/page.js"
	}, result => {
		lastResult = result;

		// Work around Firefox 57 beta bug with blank popup window
		var isFirefox57 = browserInfo
			&& browserInfo.name === "Firefox"
			&& +browserInfo.version >= 57;

		chrome.windows.create({
			width: 800,
			height: 600,
			type: isFirefox57 ? null : "popup",
			url: "/result/result.html"
		}, window => {
			popupTab = window.tabs[0];
		});
	});
});
