import { getWordIndexesFromText, WordIndex } from './utils';

describe('utils', () => {
	describe('getWordIndexesFromText', () => {
		const testCases: Array<[string, string, string[], WordIndex[], boolean?]> = [
			['should return empty', '', [], []],
			[
				'should return indexes of whole words',
				'simple text\nwith break line',
				[],
				[
					{ start: 0, end: 6, text: 'simple' },
					{ start: 7, end: 11, text: 'text' },
					{ start: 12, end: 16, text: 'with' },
					{ start: 17, end: 22, text: 'break' },
					{ start: 23, end: 27, text: 'line' },
				],
			],
			[
				'should return indexes of whole words - with search',
				'simple text\nwith break-with line with',
				['with'],
				[
					{ start: 12, end: 16, text: 'with' },
					{ start: 33, end: 37, text: 'with' },
				],
			],
			[
				'should ignore commented string',
				'simple text\nwith; break-with line with',
				['with'],
				[{ start: 12, end: 16, text: 'with' }],
			],
			[
				'should return single index of whole word - with search',
				'simple text\nwith break-with line with',
				['with'],
				[{ start: 12, end: 16, text: 'with' }],
				true,
			],
		];
		test.each(testCases)('%s', (_, text, search, expected, findOne) => {
			const result = getWordIndexesFromText(text, search, { findOne });
			expect(result).toEqual(expected);
		});
	});
});
