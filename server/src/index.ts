import { serve } from '@hono/node-server';
import { honoLogger } from '@logtape/hono';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { initDatabase } from '#integrations/sqlite';
import DictionaryService from '#services/dictionary.service';
import { initLogging, logOnError } from './core/logging.ts';
import ioMiddleware, { initWebsocket } from './shared/middleware/sockets.ts';

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

	// SQLite init
	initDatabase();

	// Dictionary init
	await DictionaryService.initDictionary();
} catch (ex) {
	console.error(ex);
}
