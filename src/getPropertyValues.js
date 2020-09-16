// Get distinct values of properties that pass a given test, in rules that pass a given test
// Returns object of properties with arrays of values.
import matches from "./matches.js";
import sortObject from "./sortObject.js"

export default function getPropertyValues(rules, test) {
	let ret = {};

	walkDeclarations(rules, declaration => {
		if (matches(declaration.property, test && test.properties) && matches(declaration.value, test && test.values)) {
			ret[declaration.property] = (ret[declaration.property] || new Set());
			ret[declaration.property].add(declaration.value);
		}
	}, {rules: test && test.rules});

	return sortObject(ret);
}
