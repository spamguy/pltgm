import { reset } from '@logtape/logtape';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all dependencies before importing the module
const mockInitLogging = vi.fn();
const mockLogOnError = vi.fn();
const mockInitDatabase = vi.fn();
const mockInitDictionary = vi.fn();
const mockServe = vi.fn();
const mockHandleRequest = vi.fn();
const mockWebsocketHandler = { open: vi.fn(), message: vi.fn(), close: vi.fn() };
const mockEngine = {
	handleRequest: mockHandleRequest,
	handler: vi.fn(() => ({ fetch: vi.fn(), websocket: mockWebsocketHandler })),
};
const mockInitWebsocket = vi.fn(() => mockEngine);
const mockIoMiddleware = vi.fn();

vi.mock('../core/logging.ts', () => ({
	initLogging: mockInitLogging,
	logOnError: mockLogOnError,
}));

vi.mock('#integrations/sqlite', () => ({
	initDatabase: mockInitDatabase,
}));

vi.mock('../shared/services/dictionary.service.ts', () => ({
	default: {
		initDictionary: mockInitDictionary,
	},
}));

vi.mock('../shared/middleware/sockets.ts', () => ({
	default: mockIoMiddleware,
	initWebsocket: mockInitWebsocket,
	SOCKET_PATH: '/ws/',
}));

const mockApp = {
	use: vi.fn(),
	all: vi.fn(),
	onError: vi.fn(),
	fetch: vi.fn(),
};

vi.mock('hono', () => {
	return {
		Hono: vi.fn(function () {
			return mockApp;
		}),
	};
});

describe('Application Index', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockInitDictionary.mockResolvedValue(undefined);
		vi.stubGlobal('Bun', { serve: mockServe });

		process.env.SERVER_PORT = '3001';
	});

	afterEach(async () => {
		await reset();
		vi.resetModules();
		vi.unstubAllGlobals();
		delete process.env.SERVER_PORT;
	});

	it('creates the Hono app', async () => {
		const { Hono } = await import('hono');
		await import('../index.ts');

		expect(Hono).toHaveBeenCalled();
	});

	it('routes the socket path to the socket.io engine', async () => {
		await import('../index.ts');

		expect(mockInitWebsocket).toHaveBeenCalled();
		expect(mockApp.all).toHaveBeenCalledWith('/ws/', expect.any(Function));

		const route = mockApp.all.mock.calls[0][1];
		const raw = new Request('http://localhost/ws/');
		const server = { fake: true };
		route({ req: { raw }, env: server });

		expect(mockHandleRequest).toHaveBeenCalledWith(raw, server);
	});

	it('serves the app with the engine websocket handler', async () => {
		await import('../index.ts');

		expect(mockServe).toHaveBeenCalledWith({
			port: 3001,
			idleTimeout: 30,
			fetch: mockApp.fetch,
			websocket: mockWebsocketHandler,
		});
	});

	it('initializes the database and dictionary', async () => {
		await import('../index.ts');

		expect(mockInitDatabase).toHaveBeenCalled();
		expect(mockInitDictionary).toHaveBeenCalled();
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
