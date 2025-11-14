import type { RedisClientOptions, RedisClientType } from 'redis';
import { vi } from 'vitest';

// Mock Redis client implementation
const createMockRedisClient = (): Partial<RedisClientType> => ({
	// Connection methods
	connect: vi.fn().mockResolvedValue(undefined),
	disconnect: vi.fn().mockResolvedValue(undefined),
	quit: vi.fn().mockResolvedValue('OK'),
	ping: vi.fn().mockResolvedValue('PONG'),
	isOpen: false,
	isReady: false,

	// Event handling
	on: vi.fn(),
	once: vi.fn(),
	off: vi.fn(),
	emit: vi.fn(),

	// String commands
	get: vi.fn().mockResolvedValue(null),
	set: vi.fn().mockResolvedValue('OK'),
	del: vi.fn().mockResolvedValue(0),
	exists: vi.fn().mockResolvedValue(0),
	expire: vi.fn().mockResolvedValue(false),
	ttl: vi.fn().mockResolvedValue(-2),
	persist: vi.fn().mockResolvedValue(false),
	rename: vi.fn().mockResolvedValue('OK'),
	incr: vi.fn().mockResolvedValue(1),
	decr: vi.fn().mockResolvedValue(-1),
	incrBy: vi.fn().mockResolvedValue(1),
	decrBy: vi.fn().mockResolvedValue(-1),
	append: vi.fn().mockResolvedValue(0),
	getRange: vi.fn().mockResolvedValue(''),
	setRange: vi.fn().mockResolvedValue(0),
	strLen: vi.fn().mockResolvedValue(0),
	mGet: vi.fn().mockResolvedValue([]),
	mSet: vi.fn().mockResolvedValue('OK'),
	setEx: vi.fn().mockResolvedValue('OK'),
	setNX: vi.fn().mockResolvedValue(false),
	getDel: vi.fn().mockResolvedValue(null),
	getEx: vi.fn().mockResolvedValue(null),

	// Hash commands
	hGet: vi.fn().mockResolvedValue(null),
	hSet: vi.fn().mockResolvedValue(0),
	hGetAll: vi.fn().mockResolvedValue({}),
	hDel: vi.fn().mockResolvedValue(0),
	hExists: vi.fn().mockResolvedValue(false),
	hKeys: vi.fn().mockResolvedValue([]),
	hVals: vi.fn().mockResolvedValue([]),
	hLen: vi.fn().mockResolvedValue(0),
	hIncrBy: vi.fn().mockResolvedValue(0),
	hmGet: vi.fn().mockResolvedValue([]),
	hSetNX: vi.fn().mockResolvedValue(false),

	// List commands
	lPush: vi.fn().mockResolvedValue(0),
	rPush: vi.fn().mockResolvedValue(0),
	lPop: vi.fn().mockResolvedValue(null),
	rPop: vi.fn().mockResolvedValue(null),
	lLen: vi.fn().mockResolvedValue(0),
	lRange: vi.fn().mockResolvedValue([]),
	lIndex: vi.fn().mockResolvedValue(null),
	lSet: vi.fn().mockResolvedValue('OK'),
	lRem: vi.fn().mockResolvedValue(0),
	lTrim: vi.fn().mockResolvedValue('OK'),
	blPop: vi.fn().mockResolvedValue(null),
	brPop: vi.fn().mockResolvedValue(null),
	rPopLPush: vi.fn().mockResolvedValue(null),
	brPopLPush: vi.fn().mockResolvedValue(null),

	// Set commands
	sAdd: vi.fn().mockResolvedValue(0),
	sRem: vi.fn().mockResolvedValue(0),
	sMembers: vi.fn().mockResolvedValue([]),
	sIsMember: vi.fn().mockResolvedValue(false),
	sCard: vi.fn().mockResolvedValue(0),
	sPop: vi.fn().mockResolvedValue(null),
	sRandMember: vi.fn().mockResolvedValue(null),
	sInter: vi.fn().mockResolvedValue([]),
	sUnion: vi.fn().mockResolvedValue([]),
	sDiff: vi.fn().mockResolvedValue([]),

	// Sorted Set commands
	zAdd: vi.fn().mockResolvedValue(0),
	zRem: vi.fn().mockResolvedValue(0),
	zScore: vi.fn().mockResolvedValue(null),
	zCard: vi.fn().mockResolvedValue(0),
	zCount: vi.fn().mockResolvedValue(0),
	zRange: vi.fn().mockResolvedValue([]),
	zRangeByScore: vi.fn().mockResolvedValue([]),
	zRank: vi.fn().mockResolvedValue(null),
	zRevRank: vi.fn().mockResolvedValue(null),
	zIncrBy: vi.fn().mockResolvedValue('0'),
	zPopMin: vi.fn().mockResolvedValue(null),
	zPopMax: vi.fn().mockResolvedValue(null),

	// Key commands
	keys: vi.fn().mockResolvedValue([]),
	scan: vi.fn().mockResolvedValue({ cursor: 0, keys: [] }),
	randomKey: vi.fn().mockResolvedValue(null),
	type: vi.fn().mockResolvedValue('none'),
	dump: vi.fn().mockResolvedValue(null),
	restore: vi.fn().mockResolvedValue('OK'),

	// Transaction commands
	multi: vi.fn().mockReturnThis(),
	watch: vi.fn().mockResolvedValue('OK'),
	unwatch: vi.fn().mockResolvedValue('OK'),

	// Pub/Sub commands
	publish: vi.fn().mockResolvedValue(0),
	subscribe: vi.fn().mockResolvedValue(undefined),
	unsubscribe: vi.fn().mockResolvedValue(undefined),
	pSubscribe: vi.fn().mockResolvedValue(undefined),
	pUnsubscribe: vi.fn().mockResolvedValue(undefined),

	// Server commands
	flushDb: vi.fn().mockResolvedValue('OK'),
	flushAll: vi.fn().mockResolvedValue('OK'),
	dbSize: vi.fn().mockResolvedValue(0),
	bgSave: vi.fn().mockResolvedValue('OK'),
	info: vi.fn().mockResolvedValue(''),

	// Script commands
	eval: vi.fn().mockResolvedValue(null),
	evalSha: vi.fn().mockResolvedValue(null),

	// Additional utility methods
	duplicate: vi.fn().mockReturnThis(),
	sendCommand: vi.fn().mockResolvedValue(null),
});

// Create a singleton mock client
let mockClient: Partial<RedisClientType> | null = null;

// Factory function to create Redis client
export const createClient = vi.fn((options?: RedisClientOptions) => {
	mockClient = createMockRedisClient();
	return mockClient as RedisClientType;
});

// Helper function to get the current mock client instance
export const getMockClient = (): Partial<RedisClientType> | null => {
	return mockClient;
};

// Helper function to reset the mock client
export const resetMockClient = (): void => {
	mockClient = null;
	createClient.mockClear();
};

// Export types for TypeScript
export type { RedisClientOptions, RedisClientType };

// Export additional helpers that might be useful
export const commandOptions = vi.fn((options: any) => options);

// Mock error classes
export class RedisError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'RedisError';
	}
}

export class ConnectionError extends RedisError {
	constructor(message: string) {
		super(message);
		this.name = 'ConnectionError';
	}
}

export class TimeoutError extends RedisError {
	constructor(message: string) {
		super(message);
		this.name = 'TimeoutError';
	}
}
