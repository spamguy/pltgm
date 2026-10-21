<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import { RouterView } from 'vue-router';

import { SOCKETS } from '#common/constants';
import { socket } from '@/sockets';
import { useGameStore } from '@/store/game';

// Remove any existing listeners (e.g., after a hot module replacement).
socket.off();

const store = useGameStore();
store.setupSockets();

function endGameIfActive() {
	if (store.game?.id && !store.game.endedAt) {
		socket.emit(SOCKETS.GAME_END, store.game.id);
	}
}

onMounted(() => window.addEventListener('beforeunload', endGameIfActive));
onUnmounted(() => {
	window.removeEventListener('beforeunload', endGameIfActive);
	endGameIfActive();
	socket.off();
	socket.disconnect();
});
</script>

<template>
	<div class="app-root">
		<RouterView />

		<footer>
			&copy; 2026 Will Oram. All resemblence to actual license plates, living or dead, is purely
			coincidental. Do not play while driving.
		</footer>
	</div>
</template>

<style scoped>
.app-root {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	overflow: hidden;
	position: relative;
	font-family: 'Overpass', sans-serif;

	footer {
		position: absolute;
		bottom: 10px;
	}
}
</style>
