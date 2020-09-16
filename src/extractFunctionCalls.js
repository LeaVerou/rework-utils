/** @module */
import * as parsel from "../../parsel/parsel.js";
import matches from "./matches.js";

/**
 * Extract all or some function calls from a string
 * @param {string} value - The value to extract function calls from.
 *                         Note that this will also extract nested function calls, you can use `pos` to discard those if they are not of interest.
 * @param {Object} [test]
 * @param {string|RegExp|Function|Array} test.names
 * @param {string|RegExp|Function|Array} test.args
 * @return {Array<Object>} Array of objects, one for each function call with `{name, args, pos}` keys
 */
export default function extractFunctionCalls(value, test) {
	// First, extract all function calls
	let ret = [];

	for (let match of value.matchAll(/\b(?<name>[\w-]+)\(/gi)) {
		let index = match.index;
		let openParen = index + match[0].length;
		let rawArgs = parsel.gobbleParens(value, openParen - 1);
		let args = rawArgs.slice(1, -1).trim();
		let name = match.groups.name;

		ret.push({name, pos: [index, index + match[0].length + rawArgs.length - 1], args})
	}

	if (test) {
		ret = ret.filter(f => {
			return matches(f.name, test && test.names) && matches(f.args, test && test.args);
		});
	}

	return ret;
}
