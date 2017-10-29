chrome.runtime.onMessage.addListener(request => {
	document.getElementById("content").value = request.result;
});
