/** @module */
/**
 * Test whether a value passes a given test.
 * The test could be a string, regexp, function, or array of any of these.
 * This is at the core of most walkers.
 * @param value
 * @param {string|RegExp|Function|Array} [test]
 * @return {Boolean} true if no test is provided, or test passes, false otherwise.
 */
export default function matches(value, test, not) {
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
