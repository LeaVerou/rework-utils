import * as parsel from "../parsel/parsel.js"

window.parsel = parsel;

if (localStorage.cssCode) {
	cssCode.value = localStorage.cssCode;
}

if (localStorage.selectQuery) {
	selectQuery.value = localStorage.selectQuery;
}

if (localStorage.selectedTab) {
	document.querySelector(`simple-tab[label="${localStorage.selectedTab}"]`)?.select();
}

window.AST = undefined;

window.testQuery = async function(name) {
	let filename = name.indexOf(".js") > -1? name : name + ".js?" + Date.now();
	let module = await import("../css-almanac/js/" + filename);
	let ret = module.default();
	console.log(ret);
	return ret;
}

let url = new URL(location)?.searchParams?.get("url");
if (url) {
	cssURL.value = url;
}

queryRerun.onclick = async e => {
	if (!window.AST) {
		return;
	}

	let query = selectQuery.value;
	let result = await testQuery(query);
	queryResults.textContent = JSON.stringify(result, null, "\t");
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
		let url = cssURL.value;
		cssURL.classList.add("loading");
		let response = await fetch('https://cors-anywhere.herokuapp.com/' + url);
		let css;
		let mime = response.headers.get("Content-Type");

		if (url.endsWith(".css") || mime.startsWith("text/css")) {
			css = await response.text();
		}
		else {
			// URL to a website
			let html = await response.text();
			let doc = new DOMParser().parseFromString(html, "text/html");
			css = await Promise.all([...doc.querySelectorAll("link[rel=stylesheet]")]
				.map(async l => {
					let href = new URL(l.getAttribute("href"), url);
					let res = await fetch('https://cors-anywhere.herokuapp.com/' + href);
					return await res.text();
				}));
			css = css.join("\n")
		}

		cssURL.classList.remove("loading");
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

cssURL.oninput = e => {
	let url = new URL(location);
	url.searchParams.set("url", cssURL.value);
	history.replaceState(null, "", url);
}

cssForm.onsubmit = evt => {
	evt.preventDefault();
	update();
}

cssCode.addEventListener("input", evt => {
	let lines = cssCode.value.split("\n").length || 0;
	cssCode.style.setProperty("--lines", lines);
	localStorage.cssCode = cssCode.value;
});



queryTab.addEventListener("tabselect", queryRerun.onclick);

selectQuery.onchange = e => {
	localStorage.selectQuery = selectQuery.value;
	queryRerun.onclick();
};

tabs.addEventListener("tabselect", e => {
	localStorage.selectedTab = e.target.label;
});
