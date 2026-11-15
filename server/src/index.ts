import { honoLogger } from '@logtape/hono';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { initDatabase } from '#integrations/sqlite';
import DictionaryService from '#services/dictionary.service';
import { initLogging, logOnError } from './core/logging.ts';
import ioMiddleware, { initWebsocket, SOCKET_PATH } from './shared/middleware/sockets.ts';

const app = new Hono<{ Bindings: Bun.Server<unknown> }>();

try {
	// socket.io init. Registered first so the engine handles its own CORS and logging,
	// as it did when attached directly to the Node HTTP server.
	const engine = initWebsocket();
	app.all(SOCKET_PATH, (c) => engine.handleRequest(c.req.raw, c.env));

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

	app.use(ioMiddleware);

	Bun.serve({
		port: +(process.env.SERVER_PORT || 3001),
		// Must exceed socket.io's pingInterval (25s) or idle sockets are dropped.
		idleTimeout: 30,
		fetch: app.fetch,
		websocket: engine.handler().websocket,
	});

	// SQLite init
	initDatabase();

	// Dictionary init
	await DictionaryService.initDictionary();
} catch (ex) {
	console.error(ex);
}
