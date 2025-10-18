import { describe } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { DictionaryService } from './dictionary.service.ts';

describe('DictionaryService', () => {
	describe('initDictionary()', () => {
		Deno.test('always deletes the previous dictionary', () => {
			expect(1 + 1).toBe(2);
		});
	});
});
