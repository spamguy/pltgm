import { reactive } from 'vue';
import { io } from 'socket.io-client';

export const state = reactive({
	connected: false,
	fooEvents: [],
	barEvents: [],
});

// 'undefined' means the URL will be computed from the window.location object.
const host = import.meta.env.VITE_SERVER_HOST;
const port = import.meta.env.VITE_SERVER_PORT;
const URL = import.meta.env.PROD ? undefined : `http://${host}:${port}`;

export const socket = io(URL, {
	path: '/ws',
	autoConnect: true,
});

socket.on('connect', () => {
	state.connected = true;
	console.log(socket.id);
});
