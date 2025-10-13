const DICTIONARY_PATH = '../../assets/dictionary.json';

export async function verifyDictionary(): Promise<void> {
	const fileStat = await Deno.stat(DICTIONARY_PATH);
	if (!fileStat.isFile) {
		Deno.create(DICTIONARY_PATH);
	}
}
