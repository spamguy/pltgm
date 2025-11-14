import { join } from 'node:path';

export default async function fetcher(endpoint: string, extraOptions: RequestInit) {
	const host: string = import.meta.env.VITE_SERVER_URL;
	const clientPort = import.meta.env.VITE_CLIENT_PORT;
	const options = { ...extraOptions };

	if (import.meta.env.DEV) {
		options.headers = {
			...extraOptions.headers,
			'Access-Control-Allow-Origin': `http://localhost:${clientPort}`,
		};
	}

	return fetch(`http://${join(host, endpoint)}`, options);
}
