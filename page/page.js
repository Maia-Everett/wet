// TODO: Build with webpack, so we can write naturally with multiple modules
(function() {
	let $ = document.querySelector.bind(document);
	let $$ = document.querySelectorAll.bind(document);

	$$("#questfiller-popup").forEach(element => element.parentElement.removeChild(element));

	let popup = document.createElement("div");
	popup.setAttribute("id", "questfiller-popup");
	document.body.appendChild(popup);

	popup.innerHTML = `
		<textarea id="questfiller-content"></textarea>
		<button id="questfiller-copy">Copy to clipboard and close</button>
	`;

	var content = $("#questfiller-content");

	$("#questfiller-copy").addEventListener("click", e => {
		content.select();
		document.execCommand("copy");
		popup.parentElement.removeChild(popup);
	});

	content.value = "Hello World!";
	$("#questfiller-copy").focus();
})();
