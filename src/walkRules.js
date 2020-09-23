/** @module */
import matches from "./matches.js";

/**
 * Recursively walk all "normal" rules, i.e. rules with selectors
 * @param rules {Object|Array} AST or array of CSS rules
 * @param callback {Function} Function to be executed for each matching rule. Rule passed as the only argument.
 * @param [test] {Object}
 * @param test.rules {string|RegExp|Function|Array} Which rules the callback runs on
 * @param test.type {string|RegExp|Function|Array} Which rule types the walker runs on
 * @param test.ancestors {string|RegExp|Function|Array} Which rules the walker descends on
 * @return The return value of the callback (which also breaks the loop) or undefined.
 */
export default function walkRules(rules, callback, test) {
	if (!rules) {
		return;
	}

	if (!Array.isArray(rules)) {
		// AST passed
		rules = rules.stylesheet.rules;
	}

	for (let rule of rules) {
		if (!test ||
		        matches(rule, test && test.rules)
		    &&  matches(rule.type, test && test.type)
		    && !matches(rule, test.not && test.not.rules, true)
		    && !matches(rule.type, test.not && test.not.type, true)
		) {
			let ret = callback(rule);

			if (ret !== undefined) {
				// Break loop and return immediately
				return ret;
			}
		}

		if (
		        matches(rule, test && test.ancestors)
		    && !matches(rule, test && test.not && test.not.ancestors, true)
		) {
			if (rule.rules) {
				walkRules(rule.rules, callback, test);
			}
		}
	}
}
