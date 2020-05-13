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
	<a id="questfiller-dark-toggle" href="#">Use dark theme</a>
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

// Dark theme support

let darkThemeToggle = $("#questfiller-dark-toggle");
let isDark = false;

function setTheme() {
	if (isDark) {
		popup.classList.add("questfiller-dark");
		darkThemeToggle.textContent = "Use light theme";
	} else {
		popup.classList.remove("questfiller-dark");
		darkThemeToggle.textContent = "Use dark theme";
	}
}

chrome.storage.sync.get(["isDark"], result => {
	isDark = result.isDark || false;
	setTheme();
});

darkThemeToggle.addEventListener("click", () => {
	isDark = !isDark;
	chrome.storage.sync.set({ "isDark": isDark });
	setTheme();
});

// End dark theme support

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
