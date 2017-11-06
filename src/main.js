import { $, $$ } from "./common/shortcuts";
import Parsers from "./Parsers";

// Remove any existing popups, if any
$$("#questfiller-popup").forEach(element => element.parentElement.removeChild(element));

// Create popup
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

Parsers.create().then(parsers => {
	let value = parsers.format();

	if (value) {
		content.value = value;
		$("#questfiller-copy").focus();
	}
});
