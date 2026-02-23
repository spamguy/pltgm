import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DictionaryService from '../shared/services/dictionary.service.ts';

const MINI_WORDS_FILE_CONTENT = `
AMALGAMATION
ÉLAN
PENALIZE
OCELOT
OH
ZENITH`;

const { mockSMembers, mockSAdd } = vi.hoisted(() => ({
	mockSMembers: vi.fn(),
	mockSAdd: vi.fn(),
}));

vi.mock('#integrations/db/redis', () => ({
	client: {
		sMembers: mockSMembers,
		sAdd: mockSAdd,
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
		beforeEach(() => {
			mockSAdd.mockResolvedValue(1);
		});

		it('stores multiple unique triplets for a longer word', async () => {
			await DictionaryService.initDictionary();

			// Unique triplets from "abcd": abc, abd, acd, bcd
			const calledKeys = mockSAdd.mock.calls.map((c) => c[0]);
			expect(calledKeys).toContain('dict:zen');
			expect(calledKeys).toContain('dict:aml');
			expect(calledKeys).toContain('dict:znt');
			expect(calledKeys).toContain('dict:znh');
			expect(mockSAdd.mock.calls.length).toBeGreaterThan(200);
		});

		it('ignores words shorter than 3 characters', async () => {
			await DictionaryService.initDictionary();
			expect(mockSAdd).not.toHaveBeenCalledWith('dict:oh', 'oh');
		});

		it('ignores words with non-alphabetic characters', async () => {
			await DictionaryService.initDictionary();
			expect(mockSAdd).not.toHaveBeenCalledWith('dict:lan', 'lan');
		});

		it('trims and lowercases words before processing', async () => {
			await DictionaryService.initDictionary();
			expect(mockSAdd).not.toHaveBeenCalledWith('dict:ZNT', 'ZNT');
		});
	});
});
