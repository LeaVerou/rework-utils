// Recursively walk all "normal" rules, i.e. rules with selectors
import matches from "./matches.js";

export default function walkRules(rules, callback, test) {
	if (!rules) {
		return;
	}

	if (!Array.isArray(rules)) {
		// AST passed
		rules = rules.stylesheet.rules;
	}

	for (let rule of rules) {
		if (matches(rule, test?.rules)) {
			let ret = callback(rule);

			if (ret !== undefined) {
				// Break loop and return immediately
				return ret;
			}
		}

		if (matches(rule, test?.ancestors)) {
			if (rule.rules) {
				walkRules(rule.rules, callback, test);
			}
		}
	}
}
