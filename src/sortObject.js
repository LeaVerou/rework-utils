/** @module */
/**
 * Sort an object literal and return the result as a new object literal
 * @param {Object} obj
 * @param {Function} [f=x=>x] Optional function to pass arguments through, useful if e.g. we are sorting by a property of an object.
 */
export default function sortObject(obj, f = x => x) {
	return Object.fromEntries(Object.entries(obj).sort((a, b) => f(b[1]) - f(a[1])));
}
