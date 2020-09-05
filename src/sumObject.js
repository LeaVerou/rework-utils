export default function sumObject(obj) {
	Object.values(obj).reduce((a, c) => a + c, 0);
}
