import { ServerType } from '@hono/node-server';
import { createMiddleware } from 'hono/factory';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server | null;

export function initWebsocket(server: ServerType) {
	io = new Server(server as HttpServer, {
		path: '/ws',
		serveClient: false,
	});
}

const ioMiddleware = createMiddleware<{ Variables: { io: Server } }>(async (c, next) => {
	if (!c.var.io && io) {
		c.set('io', io);
	}

	await next();
});

export default ioMiddleware;
