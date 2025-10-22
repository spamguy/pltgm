import { describe } from '@std/testing/bdd';
import { assertSpyCall, Stub, stub } from '@std/testing/mock';
import { expect } from '@std/expect';
import { DictionaryService } from './dictionary.service.ts';

const MINI_WORDS_FILE_CONTENT = `
amalgamation
gentrification
ocelot
zenith`;

const miniWordsFileBytes = new TextEncoder().encode(MINI_WORDS_FILE_CONTENT);

// TODO: Refactor suite to minimize duplicated code but also keep streams behaving.

describe('DictionaryService', () => {
	describe('initDictionary()', () => {
		Deno.test('loads the words file', async () => {
			const miniWordsFileReadable = new ReadableStream<Uint8Array>({
				start(controller) {
					controller.enqueue(miniWordsFileBytes);
					controller.close();
				},
			});
			using openStub = stub(Deno, 'open', (path, options) => {
				// Simulate opening the source file.
				if (options?.read) {
					return Promise.resolve({
						readable: miniWordsFileReadable,
						close: () => {},
					} as Deno.FsFile);
				}
				// Fail the test if an unexpected file is opened.
				throw new Error(`Unexpected Deno.open call with path: ${path}`);
			});
			await DictionaryService.initDictionary();
			assertSpyCall(openStub, 0); // Screw this function for counting from 0.
		});

		Deno.test('populates dictionary buckets with matching words', async () => {
			const miniWordsFileReadable = new ReadableStream<Uint8Array>({
				start(controller) {
					controller.enqueue(miniWordsFileBytes);
					controller.close();
				},
			});
			stub(Deno, 'open', (path, options) => {
				// Simulate opening the source file.
				if (options?.read) {
					return Promise.resolve({
						readable: miniWordsFileReadable,
						close: () => {},
					} as Deno.FsFile);
				}
				// Fail the test if an unexpected file is opened.
				throw new Error(`Unexpected Deno.open call with path: ${path}`);
			});
			await DictionaryService.initDictionary();
			expect(DictionaryService.getWordsForTriplet('zqq')).toHaveLength(0);
			expect(DictionaryService.getWordsForTriplet('eni')).toContain('zenith');
			expect(DictionaryService.getWordsForTriplet('eni')).toContain('gentrification');
			expect(DictionaryService.getWordsForTriplet('ntn')).toContain('gentrification');
			expect(DictionaryService.getWordsForTriplet('aaa')).not.toContain('gentrification');
		});
	});
});
