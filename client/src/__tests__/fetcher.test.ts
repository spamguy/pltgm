// Mostly written by Claude.

import fetcher from '../fetcher';

// Mock the fetch function.
global.fetch = vi.fn();

describe('fetcher', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.unstubAllEnvs();

		vi.stubEnv('VITE_SERVER_URL', 'timecube.com');
		vi.stubEnv('VITE_CLIENT_PORT', '3000');
		vi.stubEnv('DEV', false);

		(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({ data: 'test' }),
		});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('should call fetch with the correct URL', async () => {
		const endpoint = '/cubes';
		const options = { method: 'GET' };

		await fetcher(endpoint, options);

		expect(global.fetch).toHaveBeenCalledWith('http://timecube.com/cubes', options);
	});

	it('should merge extra options with default options', async () => {
		const endpoint = '/times';
		const extraOptions = {
			method: 'POST',
			body: JSON.stringify({ chimpanzee: 'Grendel' }),
		};

		await fetcher(endpoint, extraOptions);

		expect(global.fetch).toHaveBeenCalledWith('http://timecube.com/times', extraOptions);
	});

	it('should add CORS headers in DEV mode', async () => {
		vi.stubEnv('DEV', true);
		const endpoint = '/dev';
		const extraOptions = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		};

		await fetcher(endpoint, extraOptions);

		expect(global.fetch).toHaveBeenCalledWith('http://timecube.com/dev', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': 'http://localhost:3000',
			},
		});
	});

	it('should not add CORS headers in production mode', async () => {
		vi.stubEnv('DEV', false);
		const endpoint = '/dev';
		const extraOptions = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		};

		await fetcher(endpoint, extraOptions);

		expect(global.fetch).toHaveBeenCalledWith('http://timecube.com/dev', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	});

	it('should handle empty extraOptions', async () => {
		const endpoint = '/test';

		await fetcher(endpoint, {});

		expect(global.fetch).toHaveBeenCalledWith('http://timecube.com/test', {});
	});

	it('should return the fetch response', async () => {
		const mockResponse = {
			ok: true,
			json: async () => ({ result: 'success' }),
		};
		(global.fetch as any).mockResolvedValue(mockResponse);

		const result = await fetcher('/test', {});

		expect(result).toBe(mockResponse);
	});

	it('should use different client ports in DEV mode', async () => {
		vi.stubEnv('DEV', true);
		vi.stubEnv('VITE_CLIENT_PORT', '666');
		const endpoint = '/test';
		const extraOptions = { method: 'GET', headers: {} };

		await fetcher(endpoint, extraOptions);

		expect(global.fetch).toHaveBeenCalledWith('http://timecube.com/test', {
			method: 'GET',
			headers: {
				'Access-Control-Allow-Origin': 'http://localhost:666',
			},
		});
	});
});
