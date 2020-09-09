/** @module */

import matches from "./matches.js";
import sortObject from "./sortObject.js"

/**
 * Count properties that pass a given test, in rules that pass a given test
 * @see {@link module:walkDeclarations} for arguments
 * @return {Object} Property names and declaration counts. Use `sumObject(ret)` to get total count.
 */
export default function countDeclarationsByProperty(rules, test) {
	let ret = {};

	walkDeclarations(rules, declaration => {
		ret[declaration.property] = (ret[declaration.property] || 0) + 1;
	}, test);

	return sortObject(ret);
}
