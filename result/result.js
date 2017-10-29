var $ = document.querySelector.bind(document);

chrome.runtime.onMessage.addListener(request => {
	$("#content").value = request.result;
});

$("#copy").addEventListener("click", e => {
	$("#content").select();
	document.execCommand("copy");
	window.close();
});
