/** @module */

import walkDeclarations from "./walkDeclarations.js";
import matches from "./matches.js";

/**
 * Count total declarations that pass a given test.
 * @see {@link module:walkDeclarations} for arguments
 * @returns {number} Declaration count that pass the provided conditions.
 */
export default function countDeclarations(rules, test) {
	let ret = 0;

	walkDeclarations(rules, declaration => ret++, test);

	return ret;
}
