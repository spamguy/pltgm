import { configure, getConsoleSink } from '@logtape/logtape';

export async function initLogging() {
	await configure({
		sinks: { console: getConsoleSink() },
		loggers: [{ category: 'pltgm', lowestLevel: 'debug', sinks: ['console'] }],
	});
}
