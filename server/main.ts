import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { DictionaryService } from './src/shared/services/dictionary.service.ts';

const app = new Hono();

await DictionaryService.loadDictionary();

app.use(logger());
app.get('/', (c) => {
	return c.text('Hello Hono!');
});

Deno.serve(app.fetch);
