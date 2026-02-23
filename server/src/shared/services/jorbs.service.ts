import { dateToString } from '#common/helpers';
import { client } from '#integrations/db/redis';
import { ExpirableService } from './expirable.service';

export class JorbsService extends ExpirableService {
	static async setTripletForDate(triplet: string, date: Date): Promise<void> {
		await client.set(`triplet:${dateToString(date)}`, triplet);
	}

	static async getCurrentTriplet(): Promise<string> {
		const today = dateToString();
		const result = await client.get(`triplet:${today}`);

		if (!result) {
			throw new Error('No triplet set for ${today}.');
		}

		return result;
	}
}
