import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initLogging, logOnError, logOnRequest } from './core/logging/logging.ts';
import { routes } from './features/games.ts';
import { initRedis } from './integrations/db/redis.ts';
import ioMiddleware, { initWebsocket } from './shared/middleware/sockets.ts';
import { DictionaryService } from './shared/services/dictionary.service.ts';

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
			origin: [`http://localhost:${process.env.CLIENT_PORT}`],
			allowMethods: ['GET', 'POST', 'OPTIONS'],
		}),
	);

	// logging init
	await initLogging();
	app.use('*', logOnRequest);
	app.onError((err, c) => logOnError(err, c));

	// socket.io init
	initWebsocket(server);
	app.use(ioMiddleware);

	// Redis init
	await initRedis();

	// Dictionary init
	await DictionaryService.initDictionary();

	// Route config
	app.route('/games', routes);
} catch (ex) {
	console.error(ex);
}
