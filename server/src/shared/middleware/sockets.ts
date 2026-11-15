import { registerGameHandlers } from '#features/games';
import { registerWordHandlers } from '#features/words';
import { Server as Engine } from '@socket.io/bun-engine';
import { createMiddleware } from 'hono/factory';
import { Server } from 'socket.io';

export const SOCKET_PATH = '/ws/';

let io: Server | null;

export function initWebsocket(): Engine {
	io = new Server({ serveClient: false });

	const engine = new Engine({
		path: SOCKET_PATH,
		cors: {
			origin: `http://localhost:${process.env.CLIENT_PORT || 5174}`,
		},
	});
	io.bind(engine);

	io.on('connection', (socket) => {
		registerGameHandlers(socket);
		registerWordHandlers(socket);
	});

	io.on('error', (err) => {
		console.error(err);
	});

	return engine;
}

const ioMiddleware = createMiddleware<{ Variables: { io: Server } }>(async (c, next) => {
	if (!c.var.io && io) {
		c.set('io', io);
	}

	await next();
});

export default ioMiddleware;
