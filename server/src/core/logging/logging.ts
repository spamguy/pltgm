import { configure, getAnsiColorFormatter, getConsoleSink, getLogger } from '@logtape/logtape';
import { type Context } from 'hono';

export async function initLogging() {
	await configure({
		sinks: {
			console: getConsoleSink({
				formatter: getAnsiColorFormatter(),
				// formatter: getPrettyFormatter({ timestamp: 'date-time', icons: false }),
			}),
		},
		loggers: [
			{ category: ['redis'], lowestLevel: 'debug', sinks: ['console'] },
			{ category: ['pltgm'], lowestLevel: 'debug', sinks: ['console'] },
			{ category: ['hono'], lowestLevel: 'debug', sinks: ['console'] },
			{ category: [], sinks: ['console'], lowestLevel: 'error' },
		],
	});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logOnError(err: any, c: Context) {
	const logger = getLogger(['hono']);

	logger.error('Request error', {
		error: {
			name: err.name,
			message: err.message,
			stack: err.stack,
		},
		method: c.req.method,
		url: c.req.url,
	});

	return c.json({ error: 'Internal server error' }, 500);
}
