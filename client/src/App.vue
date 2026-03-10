<script setup lang="ts">
import GamePlayer from '@/components/GamePlayer.vue';
import NewGame from '@/components/NewGame.vue';
import { socket } from '@/sockets';
import { useGameStore } from '@/store/game';

// Remove any existing listeners (e.g., after a hot module replacement).
socket.off();

const store = useGameStore();
store.setupSockets();
</script>

<template>
	<div>
		<NewGame v-if="store.timer <= 0"></NewGame>
		<GamePlayer></GamePlayer>
	</div>
</template>

<style scoped></style>
