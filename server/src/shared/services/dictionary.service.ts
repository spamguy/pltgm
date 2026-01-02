import { client } from '#integrations/db/redis';
import { getLogger } from '@logtape/logtape';
import { createReadStream } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

const logger = getLogger('pltgm');

export default class DictionaryService {
	private static readonly ASSETS_DIR = 'assets';

	private static readonly WORDS_PATH = resolve(this.ASSETS_DIR, 'english-words.txt');

	static async initDictionary(): Promise<void> {
		const t0 = performance.now();

		const wordsFileStream = createReadStream(this.WORDS_PATH, { flags: 'r' });
		const lineInterface = createInterface({ input: wordsFileStream });

		logger.info('Words file loaded from {path}', { path: this.WORDS_PATH });

		let lineNum = 0;
		for await (const line of lineInterface) {
			lineNum++;
			if (lineNum % 10000 === 0) {
				logger.debug('{ lineNum } words ({ line })...', { lineNum, line });
			}
			await this.processWord(line);
		}
		const t1 = performance.now();

		logger.info('Dictionary loaded in {time} sec', { time: ((t1 - t0) / 1000).toFixed(2) });
	}

	static async getWordsForTriplet(triplet: string): Promise<string[]> {
		return client.sMembers(`dict:${triplet.toLowerCase()}`) || [];
	}

	static async checkWord(testWord: string, triplet: string): Promise<boolean> {
		return (await this.getWordsForTriplet(triplet)).includes(testWord.toLowerCase());
	}

	/* #region Private functions */

	private static async storeWord(triplet: string, word: string): Promise<void> {
		const result = await client.sAdd(`dict:${triplet}`, word);

		if (result === 0) {
			logger.warn('{word} already found in {triplet} bucket', { word, triplet });
		}
	}

	private static async processWord(wordLine: string): Promise<void> {
		const word = wordLine.trim().toLocaleLowerCase();
		/*
		 * Ignore:
		 *   - too-short words
		 *   - words containing accented chars
		 */
		if (word.length < 3 || word.match(/[^a-z]/)) {
			return;
		}

		// TODO: Optimize.
		const letterTriplets: string[] = [];
		for (let p1 = 0; p1 < word.length - 2; p1++) {
			for (let p2 = p1 + 1; p2 < word.length - 1; p2++) {
				for (let p3 = p2 + 1; p3 < word.length; p3++) {
					const triplet = word[p1].concat(word[p2], word[p3]);

					if (!letterTriplets.includes(triplet)) {
						letterTriplets.push(triplet);
						await this.storeWord(triplet, word);
					}
				}
			}
		}
	}

	/* #endregion */
}
