import { reset } from '@logtape/logtape';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all dependencies before importing the module
const mockInitLogging = vi.fn();
const mockLogOnError = vi.fn();
const mockLogOnRequest = vi.fn();
const mockInitRedis = vi.fn();
const mockInitDictionary = vi.fn();
const mockServe = vi.fn();
const mockInitWebsocket = vi.fn();
const mockIoMiddleware = vi.fn();

vi.mock('../core/logging/logging.ts', () => ({
	initLogging: mockInitLogging,
	logOnError: mockLogOnError,
	logOnRequest: mockLogOnRequest,
}));

vi.mock('../integrations/db/redis.ts', () => ({
	initRedis: mockInitRedis,
}));

vi.mock('../shared/services/dictionary.service.ts', () => ({
	DictionaryService: {
		initDictionary: mockInitDictionary,
	},
}));

vi.mock('@hono/node-server', () => ({
	serve: mockServe,
}));

vi.mock('../shared/middleware/sockets.ts', () => ({
	default: mockIoMiddleware,
	initWebsocket: mockInitWebsocket,
}));

const mockApp = {
	use: vi.fn(),
	onError: vi.fn(),
	fetch: vi.fn(),
	post: vi.fn(),
	route: vi.fn(),
};

vi.mock('../features/games.ts', () => ({
	gameRoutes: mockApp,
}));

vi.mock('hono', () => {
	return {
		Hono: vi.fn(function () {
			return mockApp;
		}),
	};
});

describe('Application Index', () => {
	let mockServer: any;

	beforeEach(() => {
		// Setup default mock implementations.
		mockInitRedis.mockResolvedValue(undefined);
		mockInitDictionary.mockResolvedValue(undefined);
		mockInitWebsocket.mockResolvedValue(undefined);

		mockServer = {
			listen: vi.fn(),
			close: vi.fn(),
		};
		mockServe.mockReturnValue(mockServer);

		// Setup environment
		process.env.SERVER_PORT = '3001';
	});

	afterEach(async () => {
		await reset();
		vi.resetModules();
		vi.restoreAllMocks();
		delete process.env.SERVER_PORT;
	});

	it('creates the Hono app', async () => {
		const { Hono } = await import('hono');
		await import('../index.ts');

		expect(Hono).toHaveBeenCalled();
	});

	describe('Environment configuration', () => {
		it('should parse SERVER_PORT as number', async () => {
			process.env.SERVER_PORT = '8080';

			await import('../index.ts');

			expect(mockServe).toHaveBeenCalledWith(expect.objectContaining({ port: 8080 }));
		});

		it('should handle empty SERVER_PORT', async () => {
			process.env.SERVER_PORT = '';

			await import('../index.ts');

			expect(mockServe).toHaveBeenCalledWith(expect.objectContaining({ port: 3001 }));
		});
	});
});
