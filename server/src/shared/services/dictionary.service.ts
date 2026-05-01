import { CHECK_DICTIONARY, GET_WORDS_FOR_TRIPLET, INSERT_DICTIONARY_WORD } from '#common/queries';
import type { ExistsResult } from '#common/types';
import { client } from '#integrations/sqlite';
import { getLogger } from '@logtape/logtape';
import { createReadStream } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

const logger = getLogger('pltgm');

const BATCH_SIZE = 1000;

export default class DictionaryService {
	private static readonly ASSETS_DIR = 'assets';

	private static readonly WORDS_PATH = resolve(this.ASSETS_DIR, 'english-words.txt');

	static async initDictionary(): Promise<void> {
		const t0 = performance.now();

		const wordsFileStream = createReadStream(this.WORDS_PATH, { flags: 'r' });
		const lineInterface = createInterface({ input: wordsFileStream });

		logger.info('Words file loaded from {path}', { path: this.WORDS_PATH });

		const q = client.prepare(INSERT_DICTIONARY_WORD);
		const insertBatch = client.transaction((batch: string[]) => {
			for (const entry of batch) {
				q.run({ word: entry });
			}
		});

		let batch: string[] = [];

		for await (const line of lineInterface) {
			const word = line.trim().toLocaleLowerCase();
			batch.push(word);
			if (batch.length >= BATCH_SIZE) {
				insertBatch(batch);
				batch = [];
			}
		}

		if (batch.length > 0) {
			insertBatch(batch);
		}

		const t1 = performance.now();
		logger.info('Dictionary loaded in {time} sec', { time: ((t1 - t0) / 1000).toFixed(2) });
	}

	static getWordsForTriplet(triplet: string): string[] {
		const q = client.prepare(GET_WORDS_FOR_TRIPLET);
		return (q.all({ triplet: triplet.toLowerCase() }) as { word: string }[]).map((r) => r.word);
	}

	static checkWord(word: string, triplet: string): boolean {
		const tripletFormat = `%${triplet.toLocaleLowerCase().split('').join('%')}%`;
		logger.debug(
			JSON.stringify(
				client.prepare(CHECK_DICTIONARY).get({ word, triplet: tripletFormat }) as ExistsResult,
			),
		);
		return (
			(client.prepare(CHECK_DICTIONARY).get({ word, triplet: tripletFormat }) as ExistsResult)
				.count > 0
		);
	}

	/* #endregion */
}
