export const FLOOR_SIZE = 100;
export const FONT_SIZE = 0.05;
export const LINE_HEIGHT = 0.06594; // base line height for a monospace font size of 0.05
export const CHAR_WIDTH = 0.03; // base char width for a monospace font size of 0.05
export const FONT_URLS = {
	Mono: 'fonts/RobotoMono-Regular.ttf',
} as const;

export function defined<T>(item: T): item is Exclude<T, null | undefined> {
	return item !== undefined && item !== null;
}
