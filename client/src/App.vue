<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import { SOCKETS } from '#common/constants';
import GameOutcome from '@/components/GameOutcome.vue';
import GamePlayer from '@/components/GamePlayer.vue';
import NewGame from '@/components/NewGame.vue';
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
		<NewGame v-if="!store.game"></NewGame>
		<GamePlayer v-else-if="!store.game.endedAt"></GamePlayer>
		<GameOutcome v-else></GameOutcome>

		<footer>
			&copy; 2026 Will Oram. All resemblence to actual license plates is purely coincidental.
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

	footer {
		position: absolute;
		bottom: 10px;
	}
}
</style>
