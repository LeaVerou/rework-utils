import * as parsel from "../parsel/parsel.js";
/* countDeclarations.js */

/**
 * Count total declarations that pass a given test.
 * @see {@link module:walkDeclarations} for arguments
 * @returns {number} Declaration count that pass the provided conditions.
 */
export function countDeclarations(rules, test) {
	let ret = 0;

	walkDeclarations(rules, declaration => ret++, test);

	return ret;
}


/* countDeclarationsByProperty.js */

/**
 * Count properties that pass a given test, in rules that pass a given test
 * @see {@link module:walkDeclarations} for arguments
 * @return {Object} Property names and declaration counts. Use `sumObject(ret)` to get total count.
 */
export function countDeclarationsByProperty(rules, test) {
	let ret = {};

	walkDeclarations(rules, declaration => {
		ret[declaration.property] = (ret[declaration.property] || 0) + 1;
	}, test);

	return sortObject(ret);
}


/* extractFunctionCalls.js */
/**
 * Extract all or some function calls from a string
 * @param {string} value - The value to extract function calls from.
 *                         Note that this will also extract nested function calls, you can use `pos` to discard those if they are not of interest.
 * @param {Object} [test]
 * @param {string|RegExp|Function|Array} test.names
 * @param {string|RegExp|Function|Array} test.args
 * @param {Boolean} test.topLevel If true, only return top-level functions
 * @return {Array<Object>} Array of objects, one for each function call with `{name, args, pos}` keys
 */
export function extractFunctionCalls(value, test) {
	// First, extract all function calls
	let ret = [];

	for (let match of value.matchAll(/(?<name>[\w-]+)\(/gi)) {
		let index = match.index;
		let openParen = index + match[0].length;
		let rawArgs = parsel.gobbleParens(value, openParen - 1);
		let args = rawArgs.slice(1, -1).trim();
		let name = match.groups.name;

		ret.push({name, pos: [index, index + match[0].length + rawArgs.length - 1], args})
	}

	if (test) {
		if (test.names || test.args) {
			ret = ret.filter(f => {
				return matches(f.name, test.names) && matches(f.args, test.args);
			});
		}

		if (test.topLevel && ret.length > 0) {
			// Filter out nested functions
			let [start, end] = ret[0].pos;

			// Note that because we did the rest of the filtering earlier, this only takes into account
			// the functions that passed the test. E.g. if we're only extracting rgb() functions, it will
			// NOT consider linear-gradient(rgb(...)) as nested.
			ret = ret.filter(f => {
				let [s, e] = f.pos;
				if (s > start && e < end) {
					// Nested
					return false;
				}

				// Not nested
				[start, end] = [s, e];
				return true;
			});
		}
	}

	return ret;
}


// Get distinct values of properties that pass a given test, in rules that pass a given test
// Returns object of properties with arrays of values.
export function getPropertyValues(rules, test) {
	let ret = {};

	walkDeclarations(rules, declaration => {
		if (matches(declaration.property, test && test.properties) && matches(declaration.value, test && test.values)) {
			ret[declaration.property] = (ret[declaration.property] || new Set());
			ret[declaration.property].add(declaration.value);
		}
	}, {rules: test && test.rules});

	return sortObject(ret);
}


/* incrementByKey.js */

/**
 * Increment a value in an object, whether the key exists or not
 * @param {Object} obj - The object
 * @param {string} key - The object property
 * @return {number} The new value
 */
export function incrementByKey(obj, key) {
	return obj[key] = (obj[key] || 0) + 1;
}


/* matches.js */
/**
 * Test whether a value passes a given test.
 * The test could be a string, regexp, function, or array of any of these.
 * This is at the core of most walkers.
 * @param value
 * @param {string|RegExp|Function|Array} [test]
 * @return {Boolean} true if no test is provided, or test passes, false otherwise.
 */
export function matches(value, test, not) {
	if (!test) {
		return !not;
	}

	if (Array.isArray(test)) {
		return test.some(t => matches(value, t));
	}

	let type = typeof test;

	if (type === "string") {
		return value === test;
	}
	else if (type === "function") {
		return test(value);
	}
	else if (test instanceof RegExp) {
		let ret = test.test(value);
		test.lastIndex = 0;
		return ret;
	}

	return false;
}


/* removeFunctionCalls.js */
/**
 * Remove function calls from a string
 * @param {string} value - @see {@link module:extractFunctionCalls} for arguments
 * @param {Object} [test] @see {@link module:extractFunctionCalls} for arguments.
 *                        Except `topLevel` which is always true, as it doesn't make sense otherwise.
 * @return {String} The string
 */
export function removeFunctionCalls(value, test = {}) {
	test.topLevel = true;
	let offset = 0;

	for (let f of extractFunctionCalls(value, test)) {
		let [start, end] = f.pos;
		start -= offset;
		end -= offset;

		value = value.substring(0, start) + value.substring(end);
		offset += end - start;
	}

	return value;
}


/* sortObject.js */
/**
 * Sort an object literal and return the result as a new object literal
 * @param {Object} obj
 * @param {Function} [f=x=>x] Optional function to pass arguments through, useful if e.g. we are sorting by a property of an object.
 */
export function sortObject(obj, f = x => x) {
	if (!obj) {
		return obj;
	}
	
	return Object.fromEntries(Object.entries(obj).sort((a, b) => f(b[1]) - f(a[1])));
}


/* sumObject.js */
/**
 * Sum all values of an object and return the result
 * @param {Object} obj
 */
export function sumObject(obj) {
	return Object.values(obj).reduce((a, c) => a + c, 0);
}


/* walkDeclarations.js */

/**
 * Recursively walk all declarations
 * @param {Object|Array} rules - AST, array of rules, or single rule
 * @param {Function} callback - Callback to be executed on each declaration. Arguments: (declaration, rule)
 * @param {Object} [test] - Conditions that need to be satisfied for a declaration to be visited, all optional
 * @param {string|RegExp|Function|Array} test.properties - Test for property names
 * @param {string|RegExp|Function|Array} test.values - Test for values
 * @param {string|RegExp|Function|Array} test.rules - Test for rules
 */
export function walkDeclarations(rules, callback, test) {
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


/* walkRules.js */
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
export function walkRules(rules, callback, test) {
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


/* walkSelectors.js */

/**
 * Walk all selectors in rules that have selectors
 * @param {Object|Array} rules - AST, array of rules, or single rule
 * @param {Function} callback - Function to be executed for each matching rule. Rule passed as the only argument.
 * @param {Object} [test]
 * @param {string|RegExp|Function|Array} test.selectors - Which selectors the callback runs on
 * @see {@link module:walkRules} for test properties available that filter the rules inspected
 */
export function walkSelectors(rules, callback, test) {
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
