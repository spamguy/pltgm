import { io } from 'socket.io-client';
import { reactive } from 'vue';

export const state = reactive({
	connected: false,
	fooEvents: [],
	barEvents: [],
});

// Use VITE_SERVER_URL if explicitly set (direct connection, needs server CORS configured).
// Otherwise use undefined so socket.io connects to window.location, letting the Vite
// proxy (or production reverse proxy) forward /ws to the server.
const URL = import.meta.env.VITE_SERVER_URL || undefined;

export const socket = io(URL, {
	path: '/ws',
	autoConnect: true,
	transports: ['websocket'],
});

socket.on('connect', () => {
	state.connected = true;
	console.log(socket.id);
});
