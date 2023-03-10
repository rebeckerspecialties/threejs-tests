import { Vector3 } from 'three';

export const FLOOR_SIZE = 100;
export const FONT_SIZE = 0.05;
export const LINE_HEIGHT = 0.06594; // base line height for a monospace font size of 0.05
export const CHAR_WIDTH = 0.03; // base char width for a monospace font size of 0.05
export const FONT_URLS = {
	Mono: 'fonts/RobotoMono-Regular.ttf',
} as const;
export const CODE_SYMBOLS = {
	ASM_6502: {
		comment: [';'],
		nonWord: [';', ':', '#', ','], // TODO: verify if we have more symbols that are non-word
	},
};

export function defined<T>(item: T): item is Exclude<T, null | undefined> {
	return item !== undefined && item !== null;
}

// compare two arrays if they both have same items and length
export function arrayMatches(a: any[], b: any[]): boolean {
	const setb = new Set(b);
	return a.length === b.length && a.every((val) => setb.has(val));
}

export interface RectanglePoints {
	left?: number;
	right?: number;
	top?: number;
	bottom?: number;
}
/**
 * Merges an array of rectangle points into a single bigger rectangle.
 */
export function mergeRects(rects: RectanglePoints[] = []): RectanglePoints {
	return rects.reduce(
		(prev, curr) => {
			const { left: pLeft, right: pRight, top: pTop, bottom: pBottom } = prev;
			const { left: cLeft = 0, right: cRight = 0, top: cTop = 0, bottom: cBottom = 0 } = curr;
			return {
				left: defined(pLeft) ? Math.min(pLeft, cLeft) : cLeft,
				right: defined(pRight) ? Math.max(pRight, cRight) : cRight,
				top: defined(pTop) ? Math.max(pTop, cTop) : cTop,
				bottom: defined(pBottom) ? Math.min(pBottom, cBottom) : cBottom,
			};
		},
		{ left: undefined, right: undefined, top: undefined, bottom: undefined },
	);
}

/**
 * Returns the index of the first element in rects array that point is inside of a rectangle, or -1 if none.
 */
export function getRectangleIdxFromPoint(
	rects: RectanglePoints[],
	point: Pick<Vector3, 'x' | 'y'>,
): number {
	return rects.findIndex(({ left, right, top, bottom }) => {
		if (!defined(left) || !defined(right) || !defined(top) || !defined(bottom)) {
			return false;
		}
		if (left <= point.x && right >= point.x && bottom <= point.y && top >= point.y) {
			return true;
		}
		return false;
	});
}

export interface WordIndex {
	start?: number;
	end?: number;
	text?: string;
}

/**
 * Returns an array of indexes (start and end) of selectable words from a Text string.
 *
 * Spaces and tabs are considered by default, you can add more nonWord characters in the options.
 *
 * If searchStr is provided, this functions as a whole word search.
 * If commentRegExp is included, it disregards the rest of the line starting from the comment identifier.
 */
export function getWordIndexesFromText(
	text: string = '',
	searchStrs: string[] = [],
	options: { nonWordChars?: string[]; commentChars?: string[]; findOne?: boolean } = {},
): WordIndex[] {
	const {
		nonWordChars = CODE_SYMBOLS.ASM_6502.nonWord,
		commentChars = CODE_SYMBOLS.ASM_6502.comment,
		findOne = false,
	} = options;
	let inComment = false;
	let inWord = false;
	const wordIndexes: WordIndex[] = [];
	const emptySpace = [' ', '\t'];
	const breakLine = ['\n'];
	let wordIndex: WordIndex = {};
	const isNonWordChar = (char: string) =>
		emptySpace.includes(char) ||
		breakLine.includes(char) ||
		nonWordChars.includes(char) ||
		commentChars.includes(char);
	for (let i = 0; i < text.length; i++) {
		if (isNonWordChar(text[i])) {
			if (inWord) {
				inWord = false;
				wordIndex.end = i;
				wordIndex.text = text.slice(wordIndex.start, i);
				wordIndexes.push({ ...wordIndex });
				wordIndex = {};
				if (findOne) {
					break;
				}
			}
			if (commentChars.includes(text[i])) {
				// if it's a comment then ignore the rest of the line
				inComment = true;
			} else if (breakLine.includes(text[i])) {
				inComment = false;
			}
		} else {
			if (!inWord && !inComment) {
				if (searchStrs.length === 0) {
					// no seach, just separate words in text
					inWord = true;
					wordIndex.start = i;
				} else {
					// get the whole word in text and try to find in searchStrs
					let nonWordIdx = i;
					while (text[nonWordIdx] !== undefined && !isNonWordChar(text[nonWordIdx])) {
						nonWordIdx++;
					}
					if (
						(i === 0 || isNonWordChar(text[i - 1])) &&
						searchStrs.includes(text.slice(i, nonWordIdx))
					) {
						inWord = true;
						wordIndex.start = i;
						i = nonWordIdx - 1;
					}
				}
			}
		}
	}
	if (defined(wordIndex.start) && !defined(wordIndex.end)) {
		wordIndexes.push({ ...wordIndex, end: text.length, text: text.slice(wordIndex.start) });
	}
	return wordIndexes.filter((idx) => defined(idx));
}
