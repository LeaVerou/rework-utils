// Count usage of a given property, as well as its values that pass a given test
// When no test provided, it counts usage of the property overall
import walkDeclarations from "./walkDeclarations.js";
import matches from "./matches.js";

export default function countDeclarations(rules, test) {
	let ret = 0;

	walkDeclarations(rules, declaration => ret++, test);

	return ret;
}
