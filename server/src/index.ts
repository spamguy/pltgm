import { serve } from '@hono/node-server';
import { honoLogger } from '@logtape/hono';
import { getLogger } from '@logtape/logtape';
import { CronJob } from 'cron';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initLogging, logOnError } from './core/logging/logging.ts';
import { initRedis } from './integrations/db/redis.ts';
import refreshGameForDay from './shared/jorbs/refreshGameForDay.ts';
import ioMiddleware, { initWebsocket } from './shared/middleware/sockets.ts';
import DictionaryService from './shared/services/dictionary.service.ts';

const app = new Hono();

const server = serve({
	fetch: app.fetch,
	port: +(process.env.SERVER_PORT || 3001),
});

try {
	// CORS init
	app.use(
		'*',
		cors({
			origin: [`http://localhost:${process.env.CLIENT_PORT || 5174}`],
			allowMethods: ['GET', 'POST', 'OPTIONS'],
		}),
	);

	// logging init
	await initLogging();
	app.use(honoLogger());
	app.onError((err, c) => logOnError(err, c));

	// socket.io init
	initWebsocket(server);
	app.use(ioMiddleware);

	// Redis init
	await initRedis();

	// Dictionary init
	if (process.env.REBUILD_DICT) {
		await DictionaryService.initDictionary();
	} else {
		getLogger('pltgm').info('Skipping dictionary rebuild');
	}

	const interval = process.env.GAME_INTERVAL || '';
	const cronTime = +interval > 0 ? `*/${interval} * * * * *` : '0 0 0 * * *';
	const cronLogger = getLogger('cron');
	// Schedule daily round refresh
	CronJob.from({
		cronTime,
		start: true,
		onTick: refreshGameForDay,
		errorHandler: (ex) => {
			cronLogger.error((ex as Error).message);
		},
	});
	cronLogger.debug('Jorb schedule: {cronTime}', { cronTime });
} catch (ex) {
	console.error(ex);
}
