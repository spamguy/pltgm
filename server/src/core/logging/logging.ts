import {
	configure,
	getAnsiColorFormatter,
	getConsoleSink,
	getLogger,
	withContext,
} from '@logtape/logtape';
import { type Context } from 'hono';
import { type Next } from 'hono/types';

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

export async function logOnRequest(c: Context, next: Next) {
	const logger = getLogger(['hono']);
	const requestId = crypto.randomUUID();
	const startTime = Date.now();

	await withContext(
		{
			requestId,
			method: c.req.method,
			url: c.req.url,
			userAgent: c.req.header('User-Agent'),
			ipAddress: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For'),
		},
		async () => {
			logger.info('Request started', {
				method: c.req.method,
				url: c.req.url,
				requestId,
			});

			await next();

			const duration = Date.now() - startTime;
			logger.info('Request completed', {
				status: c.res.status,
				duration,
				requestId,
			});
		},
	);
}
