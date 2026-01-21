import { getLogger } from '@logtape/logtape';
import { createReadStream } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

const logger = getLogger('pltgm');

export default class DictionaryService {
	private static readonly ASSETS_DIR = 'assets';

	private static readonly WORDS_PATH = resolve(this.ASSETS_DIR, 'english-words.txt');

	private static readonly DICTIONARY = new Map<string, string[]>();

	static async initDictionary(): Promise<void> {
		const t0 = performance.now();
		this.initDictionaryBuckets();

		const wordsFileStream = createReadStream(this.WORDS_PATH, { flags: 'r' });
		const lineInterface = createInterface({ input: wordsFileStream });

		logger.info('Words file loaded from {path}', { path: this.WORDS_PATH });

		let lineNum = 0;
		for await (const line of lineInterface) {
			lineNum++;
			if (lineNum % 10000 === 0) {
				logger.debug('{ lineNum } words ({ line })...', { lineNum, line });
			}
			this.processWord(line);
		}
		const t1 = performance.now();

		logger.info('Dictionary loaded in {time} sec', { time: ((t1 - t0) / 1000).toFixed(2) });
	}

	static getWordsForTriplet(triplet: string): string[] {
		return this.DICTIONARY.get(triplet.toLowerCase()) || [];
	}

	static checkWord(testWord: string, triplet: string): boolean {
		return this.getWordsForTriplet(triplet).includes(testWord.toLowerCase());
	}

	/* #region Private functions */

	private static initDictionaryBuckets(): void {
		const a = 97;
		const z = 122;

		for (let i = a; i <= z; i++) {
			for (let j = a; j <= z; j++) {
				for (let k = a; k <= z; k++) {
					const c1 = String.fromCharCode(i);
					const c2 = String.fromCharCode(j);
					const c3 = String.fromCharCode(k);

					this.DICTIONARY.set(c1.concat(c2, c3), []);
				}
			}
		}
	}

	private static processWord(wordLine: string): void {
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
					}
				}
			}
		}

		for (const t of letterTriplets) {
			this.DICTIONARY.set(t, this.DICTIONARY.get(t)!.concat(word));
		}
	}

	/* #endregion */
}
