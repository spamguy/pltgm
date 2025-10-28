import { configure, getConsoleSink, getLogger, withContext } from '@logtape/logtape';
import { Context, Hono } from 'hono';
import { Next } from 'hono/types';

export async function initLogging() {
	await configure({
		sinks: { console: getConsoleSink() },
		loggers: [
			{ category: ['redis'], lowestLevel: 'debug', sinks: ['console'] },
			{ category: ['pltgm'], lowestLevel: 'debug', sinks: ['console'] },
			{ category: ['hono'], lowestLevel: 'debug', sinks: ['console'] },
			{ category: [], sinks: ['console'], lowestLevel: 'error' },
		],
	});
}

export function logOnError(err: Error, c: Context) {
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

	await withContext({
		requestId,
		method: c.req.method,
		url: c.req.url,
		userAgent: c.req.header('User-Agent'),
		ipAddress: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For'),
	}, async () => {
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
	});
}
