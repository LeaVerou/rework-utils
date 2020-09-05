// Count properties that pass a given test, in rules that pass a given test
// Returns object of properties and counts. Use sumObject(ret) to get total count.
import matches from "./matches.js";
import sortObject from "./sortObject.js"

export default function countProperties(rules, test) {
	let ret = {};

	walkDeclarations(rules, declaration => {
		if (matches(rule, test?.rules) && matches(declaration.property, test?.properties)) {
			ret[declaration.property] = (ret[declaration.property] || 0) + 1;
		}
	});

	return sortObject(ret);
}
