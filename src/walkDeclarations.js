// Rework utility to recursively walk all declarations
export default function walkDeclarations(rules, callback, test) {
	if (!rules) {
		return;
	}

	for (let rule of rules) {
		if (!matches(rule, test?.rules)) {
			continue;
		}

		// Walk declarations directly in rule
		if (rule.declarations) {
			for (let declaration of rule.declarations) {
				callback(declaration, rule);
			}
		}

		// Walk declarations of nested rules (e.g. @media, @supports have nested rules)
		if (rule.rules) {
			walkDeclarations(rule.rules, callback);
		}
	}
}
