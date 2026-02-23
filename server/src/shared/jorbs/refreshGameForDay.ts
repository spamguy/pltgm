import { generateRandomAlphanumeric } from '#common/helpers';
import { JorbsService } from '#services/jorbs.service';
import { getLogger } from '@logtape/logtape';
import { format } from 'date-fns';

const logger = getLogger('cron');

export default function refreshGameForDay() {
	const today = new Date();
	const text = generateRandomAlphanumeric('LLL');

	logger.info('Setting triplet for {today}: {text}', { today: format(today, 'P'), text });
	JorbsService.setTripletForDate(text, today);
}
