import { stat, createReadStream } from 'fs/promises';

const DICTIONARY_PATH = '../../assets/dictionary.json';

export async function verifyDictionary(): Promise<void> {
	const fileStat = await stat(DICTIONARY_PATH);
	if (!fileStat) {
		fileStat.
	}
		const readStream = createReadStream(DICTIONARY_PATH);
}
