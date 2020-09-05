// Generate export statements for every single module and log it in the console

(async () => {
let response = await fetch("https://api.github.com/repos/leaverou/rework-utils/contents/src");
let json = await response.json();

let modules = [];

for (let file of json) {
	if (file.type === "file" && /[a-z]+\.js$/i.test(file.name) && file.name !== "all.js") {
		modules.push(file.name.slice(0, -3));
	}
}

let imports = modules.map(name => `import ${name} from "./${name}.js";
export {${name}};
`);

console.log(imports.join("\n"));

})();
