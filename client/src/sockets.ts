import { io } from 'socket.io-client';
import { reactive } from 'vue';

export const state = reactive({
	connected: false,
	fooEvents: [],
	barEvents: [],
});

// 'undefined' means the URL will be computed from the window.location object.
const URL = import.meta.env.PROD ? undefined : import.meta.env.VITE_SERVER_URL;

export const socket = io(URL, {
	path: '/ws',
	autoConnect: true,
});

socket.on('connect', () => {
	state.connected = true;
	console.log(socket.id);
});
