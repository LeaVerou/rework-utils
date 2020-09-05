/**
 * Test whether a value passes a given test. The test could be a string, regexp, function, or array of any of these
 */
export default function matches(value, test) {
	if (!test) {
		return true;
	}

	if (Array.isArray(test)) {
		return test.some(t => matches(value, t));
	}

	let type = typeof value;

	if (type === "string") {
		return value === test;
	}
	else if (type === "function") {
		return test(value);
	}
	else if (test instanceof RegExp) {
		return test.test(value);
	}
	
	return false;
}
