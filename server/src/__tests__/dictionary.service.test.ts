import { vol } from 'memfs';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { DictionaryService } from '../shared/services/dictionary.service.ts';

const MINI_WORDS_FILE_CONTENT = `
amalgamation
penalize
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
			expect(DictionaryService.getWordsForTriplet('eni')).toContain('penalize');
			expect(DictionaryService.getWordsForTriplet('aaa')).not.toContain('penalize');
		});

		test('throws an error if no words file exists', async () => {
			await expect(() => DictionaryService.initDictionary()).rejects.toThrowError(
				/no such file or directory/,
			);
		});
	});
});
