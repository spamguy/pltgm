import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { DictionaryService } from './dictionary.service.js';
import { vol } from 'memfs';

const MINI_WORDS_FILE_CONTENT = `
amalgamation
gentrification
ocelot
zenith`;

describe('DictionaryService', () => {
	beforeAll(() => {
		vi.mock('fs', async () => {
			const memfs = await vi.importActual('memfs');
			return memfs.fs;
		});
	});

	afterEach(() => {
		vol.reset();
	});

	describe('initDictionary()', () => {
		test('loads the words file', async () => {
			const filePath = `${process.cwd()}/assets/english-words.txt`;
			vol.fromJSON({ [filePath]: MINI_WORDS_FILE_CONTENT });
			await DictionaryService.initDictionary();

			expect(DictionaryService.getWordsForTriplet('zqq')).toHaveLength(0);
			expect(DictionaryService.getWordsForTriplet('eni')).toContain('zenith');
			expect(DictionaryService.getWordsForTriplet('eni')).toContain('gentrification');
			expect(DictionaryService.getWordsForTriplet('ntn')).toContain('gentrification');
			expect(DictionaryService.getWordsForTriplet('aaa')).not.toContain('gentrification');
		});

		test('throws an error if no words file exists', async () => {
			await expect(() => DictionaryService.initDictionary()).rejects.toThrowError(
				/no such file or directory/,
			);
		});
	});
});
