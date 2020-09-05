export default function sortObject(obj, f = x => x) {
	return Object.fromEntries(Object.entries(obj).sort((a, b) => f(b[1]) - f(a[1])));
}
