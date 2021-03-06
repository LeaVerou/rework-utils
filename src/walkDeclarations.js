/** @module */

import matches from "./matches.js";

/**
 * Recursively walk all declarations
 * @param {Object|Array} rules - AST, array of rules, or single rule
 * @param {Function} callback - Callback to be executed on each declaration. Arguments: (declaration, rule)
 * @param {Object} [test] - Conditions that need to be satisfied for a declaration to be visited, all optional
 * @param {string|RegExp|Function|Array} test.properties - Test for property names
 * @param {string|RegExp|Function|Array} test.values - Test for values
 * @param {string|RegExp|Function|Array} test.rules - Test for rules
 */
export default function walkDeclarations(rules, callback, test) {
	if (!rules) {
		return;
	}

	if (rules.stylesheet) {
		// AST passed
		rules = rules.stylesheet.rules;
	}
	else if (!Array.isArray(rules)) {
		// Single rule
		rules = [rules];
	}

	for (let rule of rules) {
		if (!matches(rule, test && test.rules) || matches(rule, test && test.not && test.not.rules, true)) {
			continue;
		}

		// Walk declarations directly in rule
		if (rule.declarations) {
			for (let declaration of rule.declarations) {
				if (declaration.type !== "declaration") {
					continue;
				}

				let {property, value} = declaration;
				let important = false;

				value = value.replace(/\s*!important\s*$/, $0 => {
					important = true;
					return "";
				});

				if (!test ||
				        matches(property, test.properties)
				    &&  matches(value, test.values)
				    && !matches(property, test.not && test.not.properties, true)
				    && !matches(value, test.not && test.not.values, true)
				) {
					callback({property, value, important}, rule);
				}
			}
		}

		// Walk declarations of nested rules (e.g. @media, @supports have nested rules)
		if (rule.rules) {
			walkDeclarations(rule.rules, callback, test);
		}
	}
}
