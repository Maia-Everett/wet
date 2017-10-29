let lastResult = null;
let popupTab = null;

function isSupported(url) {
	console.log("url: " + url);
	let result = /https?:\/\/(www\.)?wowhead.com\/(quest|mission|npc)=/.test(url);
	console.log("result: " + result);
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

		chrome.windows.create({
			width: 600,
			height: 500,
			type: "popup",
			url: "/result/result.html"
		}, window => {
			popupTab = window.tabs[0];
		});
	});
});
