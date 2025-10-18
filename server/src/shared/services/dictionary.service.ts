import * as readline from 'node:fs/promises';
import { resolve } from '@std/path';
import { exists, ensureFile } from '@std/fs';
import { getLogger } from '@logtape/logtape';

const logger = getLogger('pltgm');

export class DictionaryService {
	private static readonly ASSETS_DIR = 'assets';

	private static readonly DICTIONARY_PATH = resolve(this.ASSETS_DIR, 'dictionary.json');

	private static readonly WORDS_PATH = resolve(this.ASSETS_DIR, 'english-words.txt');

	static async initDictionary(): Promise<void> {
		try {
			if (await exists(this.DICTIONARY_PATH)) {
				await Deno.remove(this.DICTIONARY_PATH);
				logger.info(`Dictionary file at ${this.DICTIONARY_PATH} deleted`);
			}

			this.buildDictionary();
		} catch (ex) {
			logger.error('Error loading dictionary: ' + ex);
		}
	}

	private static async buildDictionary(): Promise<void> {
		await Deno.open(this.WORDS_PATH);

		await Deno.create(this.DICTIONARY_PATH);
	}
}
