const fs = require("fs");

function readFile(file, enc = "utf8") {
	return new Promise((resolve, reject) => {
		fs.readFile(file, enc, (err,data) => {
			if (err) {
				reject(err);
			}

			resolve(data);
		});
	});
}

function writeFile(file, contents, enc) {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, contents, enc, (err) => {
			if (err) {
				reject(err);
			}

			resolve();
		});
	});
}




fs.readdir("./src", async (err, files) => {
	let imports = new Set();
	files = files.sort(); // for stability

	let code = await Promise.all(files.map(async file => {
		let data = await readFile("./src/" + file);
		data = data.replace("/** @module */", `/* ${file} */`)

		// Convert default exports to normal exports
		data = data.replace(/export default /g, "export ");

		// Drop internal imports
		data = data.replace(/import [a-z]+ from "\.\/[a-z]+\.js";?\s*\n/ig, "");

		// De-duplicate other imports
		data = data.replace(/import .+;?\s*\n/g, $0 => {
			imports.add($0.replace(/"\.\.\//, '"'));
			return "";
		});

		return data;
	}));

	// Create combined ESM
	let contents = [...imports].join(";\n") + code.join("\n\n");

	writeFile("./rework-utils.mjs", contents);

	// Create file with all-globals for BigQuery
	// Remove imports (whoever uses the resulting file needs to manage dependencies)
	contents = contents.replace(/import .+;?\s*\n|export /g, "");
	writeFile("./rework-utils.js", contents);
});
