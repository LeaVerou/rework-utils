// Count usage of a given property, as well as its values that pass a given test
// When no test provided, it counts usage of the property overall
import walkDeclarations from "./walkDeclarations.js";
import matches from "./matches.js";

/**
 * @param rules {Object} Rework AST rules (ast.stylesheet.rules for an entire stylesheet)
 * @param propTest {String|Array|RegExp|Function} Property test (could be empty)
 * @param valueTest {String|Array|RegExp|Function} Value test (could be empty)
 */
export default function countDeclarations(rules, propTest, valueTest) {
	let ret = 0;

	walkDeclarations(rules, declaration => {
		let {property, value} = declaration;

		if (matches(property, prop) && matches(value, test)) {
			ret++;
		}
	});

	return ret;
}
