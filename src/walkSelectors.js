/** @module */

import matches from "./matches.js";

/**
 * Walk all selectors in rules that have selectors
 * @param {Object|Array} rules - AST, array of rules, or single rule
 * @param {Function} callback - Function to be executed for each matching rule. Rule passed as the only argument.
 * @param {Object} [test]
 * @param {string|RegExp|Function|Array} test.selectors - Which selectors the callback runs on
 * @see {@link module:walkRules} for test properties available that filter the rules inspected
 */
export default function walkSelectors(rules, callback, test) {
	if (rules.stylesheet) {
		// AST passed
		rules = rules.stylesheet.rules;
	}
	else if (!Array.isArray(rules)) {
		// Single rule
		rules = [rules];
	}

	walkRules(rules, rule => {
		if (rule.selectors) {
			for (let selector of rule.selectors) {
				if (matches(selector, test && test.selectors)) {
					callback(selector, rule.selectors);
				}
			}
		}
	}, test);
}
