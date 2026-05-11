import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const MINI_WORDS_FILE_CONTENT = `
AMALGAMATION
QUANTIFY
PENALIZE
OCELOT
OH
ZENITH`;

const { mockRun, mockPrepare } = vi.hoisted(() => {
	const mockRun = vi.fn();
	const mockPrepare = vi.fn().mockReturnValue({ run: mockRun });
	return { mockRun, mockPrepare };
});

vi.mock('#integrations/sqlite', () => ({
	client: {
		prepare: mockPrepare,
		transaction:
			(fn: (...args: unknown[]) => void) =>
			(...args: unknown[]) =>
				fn(...args),
	},
}));

vi.mock('fs', async () => {
	const memfs = await vi.importActual('memfs');
	return memfs.fs;
});

describe('DictionaryService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	beforeEach(async () => {
		const filePath = `${process.cwd()}/assets/english-words.txt`;
		vol.fromJSON({ [filePath]: MINI_WORDS_FILE_CONTENT });
	});

	afterEach(() => {
		vol.reset();
	});

	describe('initDictionary()', () => {
		it('inserts each non-blank word trimmed and lowercased', async () => {
			const { default: DictionaryService } = await import('#services/dictionary.service');
			await DictionaryService.initDictionary();

			const insertedWords = mockRun.mock.calls.map((c) => c[0].word);
			expect(insertedWords).toEqual(
				expect.arrayContaining(['amalgamation', 'quantify', 'penalize', 'ocelot', 'oh', 'zenith']),
			);
			expect(insertedWords).not.toContain('');
		});

		it('inserts all words exactly once', async () => {
			const { default: DictionaryService } = await import('#services/dictionary.service');
			await DictionaryService.initDictionary();

			expect(mockRun).toHaveBeenCalledTimes(6);
		});

		it('does nothing when the words file is empty', async () => {
			vol.reset();
			const filePath = `${process.cwd()}/assets/english-words.txt`;
			vol.fromJSON({ [filePath]: '' });

			const { default: DictionaryService } = await import('#services/dictionary.service');
			await DictionaryService.initDictionary();

			expect(mockRun).not.toHaveBeenCalled();
		});
	});
});
