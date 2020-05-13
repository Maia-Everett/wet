import { $, $$ } from "./common/shortcuts";
import Parsers from "./Parsers";

// Remove any existing popups, if any
$$("#questfiller-popup").forEach(element => element.parentElement.removeChild(element));

// Create popup
let popup = document.createElement("div");
popup.setAttribute("id", "questfiller-popup");
document.body.appendChild(popup);

popup.innerHTML = `
	<textarea id="questfiller-content" spellcheck="false"></textarea>
	<button id="questfiller-copy">Copy to clipboard and close</button>
	<button id="questfiller-close">Close</button>
`;

let content = $("#questfiller-content");

$("#questfiller-copy").addEventListener("click", e => {
	content.select();
	document.execCommand("copy");
	popup.parentElement.removeChild(popup);
});

$("#questfiller-close").addEventListener("click", e => {
	popup.parentElement.removeChild(popup);
});

Parsers.create().then(parsers => {
	let value = parsers.format();

	if (value) {
		content.value = value;
		$("#questfiller-copy").focus();
	}
}).catch(e => {
	content.value = e.message;
	console.log(e);
});
