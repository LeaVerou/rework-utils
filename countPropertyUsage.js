// Count usage of a given property, as well as its values that pass a given test
// When no test provided, it counts usage of the property overall
import walkDeclarations from "./walkDeclarations.js";

export default function countPropertyUsage(rules, prop, test) {
	let ret = 0;

	if (typeof test === "string") {
		let t = test;
		test = v => v === t;
	}

	walkDeclarations(rules, declaration => {
		let {property, value} = declaration;

		if (property === prop && (!test || test(value))) {
			ret++;
		}
	});

	return ret;
}
