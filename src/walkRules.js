// Recursively walk all "normal" rules, i.e. rules with selectors
import matches from "./matches.js";

export default function walkRules(rules, callback, ruleTest) {
	if (!rules) {
		return;
	}

	for (let rule of rules) {
		if (matches(rule, ruleTest)) {
			callback(rule);

			if (rule.rules) {
				walkRules(rule.rules, callback, ruleTest);
			}
		}
	}
}
