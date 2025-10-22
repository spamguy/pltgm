import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { initLogging } from './src/core/logging/index.ts';
import { DictionaryService } from './src/shared/services/dictionary.service.ts';

const app = new Hono();

await initLogging();
await DictionaryService.initDictionary();

app.use(logger());
app.get('/', (c) => {
	return c.text('Hello Hono!');
});

Deno.serve(app.fetch);
