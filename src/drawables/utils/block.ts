import { defaultBoxSize } from './geometries';
import { CHAR_WIDTH, FONT_SIZE, LINE_HEIGHT } from './utils';

/**
 * Get the scale value (x, y) from text.
 * Use it to render dynamic block size depending on the text content.
 */
interface BlockScaleFromTextOpts {
	lineHeight?: number;
	charWidth?: number;
	boxInitialSize?: number;
	paddingX?: number;
	paddingY?: number;
}
export function getBlockScaleFromText(
	text = '',
	opts: BlockScaleFromTextOpts = {},
): { x: number; y: number } {
	const {
		lineHeight = LINE_HEIGHT,
		charWidth = CHAR_WIDTH,
		boxInitialSize = defaultBoxSize,
		paddingX = 0.5,
		paddingY = 0.25,
	} = opts;

	const textLines = text.split('\n');
	let lineCount = textLines.length;
	if (text.slice(-2) !== '\\n') {
		lineCount++;
	}
	const maxLineLength = Math.max(...textLines.map((textLine) => textLine.length));

	return {
		x: maxLineLength * (charWidth / boxInitialSize) + paddingX,
		y: lineCount * (lineHeight / boxInitialSize) + paddingY,
	};
}

export function getCharSizeFromFontSize(fontSize = FONT_SIZE): {
	height: number;
	width: number;
} {
	return {
		height: (fontSize / FONT_SIZE) * LINE_HEIGHT,
		width: (fontSize / FONT_SIZE) * CHAR_WIDTH,
	};
}
