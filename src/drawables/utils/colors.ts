import { TextSelections } from '@/providers/TextSelectionProvider/TextSelectionProvider';
import { Color } from 'three';

// TODO: modify these colors to use a proper theme
export const defaultThemeColor = {
	editor: {
		foreground: '#000000',
		findMatchBackground: '#FF9900',
		selectionBackground: '#264f78',
	},
	blocks: {
		default: '#708090',
		// default: '#007ACC',
		findMatch: '#a5bcd4',
	},
	findMatchBackgroundColors: ['#FF8800', '#8800FF', '#00FF88'],
};
export const defaultBlockColor = new Color(defaultThemeColor.blocks.default);
export const findMatchBlockColor = new Color(defaultThemeColor.blocks.findMatch);
export const defaultFindMatchTextBackground = new Color(
	defaultThemeColor.editor.findMatchBackground,
);

// for text search
export const textBgColorsEntity = defaultThemeColor.findMatchBackgroundColors.reduce((acc, val) => {
	acc[val] = new Color(val);
	return acc;
}, {});

function padZero(str: string, len: number = 2) {
	const zeros = new Array(len).join('0');
	return (zeros + str).slice(-len);
}

/**
 * Receives a hex color (ie: "#1803E4") and returns its inverted color or black/white.
 *
 * @param hexColor
 * @param returnBW
 * @returns hex color in "#000000" format
 */
export function invertColor(hexColor: string, returnBW: boolean = false): string {
	if (hexColor[0] === '#') {
		hexColor = hexColor.slice(1);
	}
	// convert 3-digit hex to 6-digits.
	if (hexColor.length === 3) {
		hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
	}
	if (hexColor.length !== 6) {
		throw new Error('Invalid HEX color.');
	}

	const redValue = parseInt(hexColor.slice(0, 2), 16);
	const greenValue = parseInt(hexColor.slice(2, 4), 16);
	const blueValue = parseInt(hexColor.slice(4, 6), 16);

	if (returnBW) {
		// ref https://stackoverflow.com/a/3943023/112731
		return redValue * 0.299 + greenValue * 0.587 + blueValue * 0.114 > 186 ? '#000000' : '#FFFFFF';
	}

	// invert
	const redHex = (255 - redValue).toString(16);
	const greenHex = (255 - greenValue).toString(16);
	const blueHex = (255 - blueValue).toString(16);

	return '#' + padZero(redHex) + padZero(greenHex) + padZero(blueHex);
}

export function mixColors(colors: Color[]) {
	let rMixed = 0;
	let gMixed = 0;
	let bMixed = 0;

	for (let i = 0; i < colors.length; i++) {
		rMixed += colors[i].r;
		gMixed += colors[i].g;
		bMixed += colors[i].b;
	}

	return new Color(rMixed / colors.length, gMixed / colors.length, bMixed / colors.length);
}

export function getAvailableHighlightHexColor(textSelections: TextSelections): string {
	const defaultFallbackColor = '#FFFFFF';
	const hexColors = Object.values(textSelections).map(({ hexColor }) => hexColor);
	const availableColor =
		defaultThemeColor.findMatchBackgroundColors.find((color) => !hexColors.includes(color)) ??
		defaultFallbackColor;
	return availableColor;
}
