import { registerGameHandlers } from '#features/games';
import { registerRoundHandlers } from '#features/rounds';
import { registerWordHandlers } from '#features/words';
import { type ServerType } from '@hono/node-server';
import { createMiddleware } from 'hono/factory';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server | null;

export function initWebsocket(server: ServerType) {
	io = new Server(server as HttpServer, {
		path: '/ws',
		serveClient: false,
		cors: {
			origin: `http://localhost:${process.env.CLIENT_PORT}`,
		},
	});

	io.on('connection', (socket) => {
		registerGameHandlers(socket);
		registerRoundHandlers(socket);
		registerWordHandlers(socket);
	});

	io.on('error', (err) => {
		console.error(err);
	});
}

const ioMiddleware = createMiddleware<{ Variables: { io: Server } }>(async (c, next) => {
	if (!c.var.io && io) {
		c.set('io', io);
	}

	await next();
});

export default ioMiddleware;
