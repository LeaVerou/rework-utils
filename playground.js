import * as parsel from "../parsel/parsel.js"
import "./apriori.js";

window.parsel = parsel;

if (localStorage.cssCode) {
	cssCode.value = localStorage.cssCode;
}

(async () => {

window.AST = undefined;

let url = new URL(location)?.searchParams?.get("url");
if (url) {
	cssURL.value = url;
}

async function update() {
	if (cssCode.value) {
		try {
			AST = parse(cssCode.value);
			cssCode.setCustomValidity("");
		}
		catch (e) {
			cssCode.setCustomValidity(e.message);
		}

		cssCodeDisplay.textContent = cssCode.value;
	}
	else if (cssURL.value) {
		let response = await fetch('https://cors-anywhere.herokuapp.com/' + cssURL.value);
		let css = await response.text();
		cssCodeDisplay.textContent = css;
		try {
			AST = parse(css);
		}
		catch (e) {
			console.error(e);
		}
	}

	window.ast = AST;

	astDisplay.textContent = JSON.stringify(AST, null, "\t");

	if (document.querySelector('simple-tab[label="Query"][selected]')) {
		queryRerun.onclick();
	}
}

update();
cssCode.oninput = cssURL.onchange = update;
cssForm.onsubmit = evt => {
	evt.preventDefault();
	update();
}

cssCode.addEventListener("input", evt => {
	let lines = cssCode.value.split("\n").length || 0;
	cssCode.style.setProperty("--lines", lines);
	localStorage.cssCode = cssCode.value;
});

selectQuery.onchange =
queryRerun.onclick = async e => {
	if (!window.AST) {
		return;
	}
	let query = selectQuery.selectedOptions[0].value;
	let result = await testQuery(query);
	queryResults.textContent = JSON.stringify(result, null, "\t");
}

queryTab.addEventListener("tabselect", queryRerun.onclick);

window.testQuery = async function(name) {
	let filename = name.indexOf(".js") > -1? name : name + ".js?" + Date.now();
	let module = await import("../css-almanac/js/" + filename);
	let ret = module.default();
	console.log(ret);
	return ret;
}

tabs.addEventListener("tabselect", e => {
	localStorage.selectedTab = e.target.label;
});

if (localStorage.selectedTab) {
	document.querySelector(`simple-tab[label="${localStorage.selectedTab}"]`)?.select();
}

})();
