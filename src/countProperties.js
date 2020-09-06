// Count properties that pass a given test, in rules that pass a given test
// Returns object of properties and counts. Use sumObject(ret) to get total count.
import matches from "./matches.js";
import sortObject from "./sortObject.js"

export default function countProperties(rules, test) {
	let ret = {};

	walkDeclarations(rules, declaration => {
		if (matches(declaration.property, test?.properties) && matches(declaration.value, test?.values)) {
			ret[declaration.property] = (ret[declaration.property] || 0) + 1;
		}
	}, {rules: test?.rules});

	return sortObject(ret);
}
