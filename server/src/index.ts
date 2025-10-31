import { Hono } from 'hono';
import { initLogging, logOnError, logOnRequest } from './core/logging/index.js';
import { initRedis } from './integrations/db/redis.js';
import { DictionaryService } from './shared/services/dictionary.service.js';
import { serve } from '@hono/node-server';
import ioMiddleware, { initWebsocket } from './shared/middleware/sockets.js';

const app = new Hono();

export const server = serve({
	fetch: app.fetch,
	port: 3000,
});

try {
	// logging init
	await initLogging();
	app.use('*', await logOnRequest);
	app.onError(logOnError);

	// socket.io init
	await initWebsocket(server);
	app.use(ioMiddleware);

	// Redis init
	await initRedis();

	// Dictionary init
	await DictionaryService.initDictionary();
} catch (ex) {
	console.error(ex);
}

export default app;
