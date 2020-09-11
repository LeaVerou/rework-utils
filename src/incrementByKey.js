/** @module */

/**
 * Increment a value in an object, whether the key exists or not
 * @param {Object} obj - The object
 * @param {string} key - The object property
 * @return {number} The new value
 */
export default function incrementByKey(obj, key) {
	return obj[key] = (obj[key] || 0) + 1;
}
