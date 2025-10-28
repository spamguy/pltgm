import { Hono } from 'hono';
import { initLogging, logOnError, logOnRequest } from './src/core/logging/index.ts';
import { DictionaryService } from './src/shared/services/dictionary.service.ts';
import { initRedis } from './src/integrations/db/redis.ts';

const app = new Hono();

try {
	await initLogging();

	app.use('*', await logOnRequest);
	app.onError(logOnError);

	await initRedis();
	await DictionaryService.initDictionary();

	app.get('/', (c) => {
		return c.text('Hello Hono!');
	});
} catch {}

Deno.serve(app.fetch);
