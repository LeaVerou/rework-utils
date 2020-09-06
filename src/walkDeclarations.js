// Rework utility to recursively walk all declarations
import matches from "./matches.js";

export default function walkDeclarations(rules, callback, test) {
	if (!rules) {
		return;
	}

	if (!Array.isArray(rules)) {
		// AST passed
		rules = rules.stylesheet.rules;
	}

	for (let rule of rules) {
		if (!matches(rule, test?.rules)) {
			continue;
		}

		// Walk declarations directly in rule
		if (rule.declarations) {
			for (let declaration of rule.declarations) {
				if (matches(declaration.property, test?.properties) && matches(declaration.value, test?.values)) {
					callback(declaration, rule);
				}
			}
		}

		// Walk declarations of nested rules (e.g. @media, @supports have nested rules)
		if (rule.rules) {
			walkDeclarations(rule.rules, callback, test);
		}
	}
}
