export const FLOOR_SIZE = 100;

export function defined<T>(item: T): item is Exclude<T, null | undefined> {
	return item !== undefined && item !== null;
}
