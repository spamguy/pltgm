import DictionaryService from '#services/dictionary.service';
import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const MINI_WORDS_FILE_CONTENT = `
AMALGAMATION
ÉLAN
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
		it('stores multiple unique triplets for a longer word', async () => {
			DictionaryService.initDictionary();

			const calls = mockRun.mock.calls.map((c) => c[0]);
			expect(calls).toContainEqual({ word: 'zenith', triplet: 'zen' });
			expect(calls).toContainEqual({ word: 'amalgamation', triplet: 'aml' });
			expect(calls).toContainEqual({ word: 'zenith', triplet: 'znt' });
			expect(calls).toContainEqual({ word: 'zenith', triplet: 'znh' });
			expect(mockRun.mock.calls.length).toBeGreaterThan(200);
		});

		it('ignores words shorter than 3 characters', async () => {
			DictionaryService.initDictionary();
			expect(mockRun).not.toHaveBeenCalledWith(expect.objectContaining({ word: 'oh' }));
		});

		it('ignores words with non-alphabetic characters', async () => {
			DictionaryService.initDictionary();
			expect(mockRun).not.toHaveBeenCalledWith(expect.objectContaining({ word: 'élan' }));
		});

		it('trims and lowercases words before processing', async () => {
			DictionaryService.initDictionary();
			expect(mockRun).not.toHaveBeenCalledWith(expect.objectContaining({ word: 'ZENITH' }));
		});
	});
});
