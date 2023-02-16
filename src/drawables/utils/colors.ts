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
};
export const defaultBlockColor = new Color(defaultThemeColor.blocks.default);
export const findMatchBlockColor = new Color(defaultThemeColor.blocks.findMatch);

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
