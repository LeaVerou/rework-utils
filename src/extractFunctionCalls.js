/** @module */
import * as parsel from "https://parsel.verou.me/dist/parsel.js";
import matches from "./matches.js";

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
export default function extractFunctionCalls(value, test) {
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