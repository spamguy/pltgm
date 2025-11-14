import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const mockConfigure = vi.fn();
const mockGetConsoleSink = vi.fn();
const mockGetLogger = vi.fn();
const mockWithContext = vi.fn();

vi.mock('@logtape/logtape', () => ({
	configure: mockConfigure,
	getConsoleSink: mockGetConsoleSink,
	getLogger: mockGetLogger,
	withContext: mockWithContext,
}));

describe('Logging Module', () => {
	let mockLogger: any;

	beforeEach(() => {
		vi.clearAllMocks();

		// Setup mock logger
		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
		};

		mockGetLogger.mockReturnValue(mockLogger);
		mockGetConsoleSink.mockReturnValue({ type: 'console' });
		mockConfigure.mockResolvedValue(undefined);
		mockWithContext.mockImplementation(async (_, fn) => await fn());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('initLogging', () => {
		it('should configure logging with console sink', async () => {
			const { initLogging } = await import('../core/logging/logging.ts');

			await initLogging();

			expect(mockGetConsoleSink).toHaveBeenCalled();
			expect(mockConfigure).toHaveBeenCalledWith({
				sinks: { console: { type: 'console' } },
				loggers: [
					{ category: ['redis'], lowestLevel: 'debug', sinks: ['console'] },
					{ category: ['pltgm'], lowestLevel: 'debug', sinks: ['console'] },
					{ category: ['hono'], lowestLevel: 'debug', sinks: ['console'] },
					{ category: [], sinks: ['console'], lowestLevel: 'error' },
				],
			});
		});

		it('should configure loggers for different categories', async () => {
			const { initLogging } = await import('../core/logging/logging.ts');

			await initLogging();

			const config = mockConfigure.mock.calls[0][0];

			expect(config.loggers).toHaveLength(4);
			expect(config.loggers[0]).toEqual({
				category: ['redis'],
				lowestLevel: 'debug',
				sinks: ['console'],
			});
			expect(config.loggers[1]).toEqual({
				category: ['pltgm'],
				lowestLevel: 'debug',
				sinks: ['console'],
			});
			expect(config.loggers[2]).toEqual({
				category: ['hono'],
				lowestLevel: 'debug',
				sinks: ['console'],
			});
		});

		it('should set root logger to error level', async () => {
			const { initLogging } = await import('../core/logging/logging.ts');

			await initLogging();

			const config = mockConfigure.mock.calls[0][0];
			const rootLogger = config.loggers.find((l: any) => l.category.length === 0);

			expect(rootLogger.lowestLevel).toBe('error');
		});
	});
});
