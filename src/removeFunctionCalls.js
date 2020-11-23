/** @module */
import extractFunctionCalls from "./extractFunctionCalls.js";

/**
 * Remove function calls from a string
 * @param {string} value - @see {@link module:extractFunctionCalls} for arguments
 * @param {Object} [test] @see {@link module:extractFunctionCalls} for arguments.
 *                        Except `topLevel` which is always true, as it doesn't make sense otherwise.
 * @return {String} The string
 */
export default function removeFunctionCalls(value, test = {}) {
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
