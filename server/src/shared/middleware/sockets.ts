import { type ServerType } from '@hono/node-server';
import { createMiddleware } from 'hono/factory';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { registerHandlers } from '../../features/games.ts';

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
		registerHandlers(socket);
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
