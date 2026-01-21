import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DictionaryService from '../shared/services/dictionary.service.ts';

const MINI_WORDS_FILE_CONTENT = `
AMALGAMATION
PENALIZE
OCELOT
ZENITH`;

describe('DictionaryService', () => {
	vi.mock('fs', async () => {
		const memfs = await vi.importActual('memfs');
		return memfs.fs;
	});

	beforeEach(async () => {
		const filePath = `${process.cwd()}/assets/english-words.txt`;
		vol.fromJSON({ [filePath]: MINI_WORDS_FILE_CONTENT });

		await DictionaryService.initDictionary();
	});

	afterEach(() => {
		vol.reset();
	});

	describe('initDictionary()', () => {
		it('loads the words file', async () => {
			expect(DictionaryService.getWordsForTriplet('zqq')).toHaveLength(0);
			expect(DictionaryService.getWordsForTriplet('eni')).toContain('zenith');
			expect(DictionaryService.getWordsForTriplet('eni')).toContain('penalize');
			expect(DictionaryService.getWordsForTriplet('aaa')).not.toContain('penalize');
		});

		it('throws an error if no words file exists', async () => {
			vol.reset();
			await expect(() => DictionaryService.initDictionary()).rejects.toThrowError(
				/no such file or directory/,
			);
		});
	});

	describe('checkWord()', () => {
		it('approves unused words found in the dictionary', () => {
			expect(DictionaryService.checkWord('zenith', 'eni')).toBe(true);
		});

		it('is case insensitive for all inputs', () => {
			expect(DictionaryService.checkWord('zENith', 'eni')).toBe(true);
			expect(DictionaryService.checkWord('zENith', 'Eni')).toBe(true);
			expect(DictionaryService.checkWord('zenith', 'enI')).toBe(true);
		});
	});
});
