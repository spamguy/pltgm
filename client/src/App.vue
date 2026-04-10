<script setup lang="ts">
import GameOutcome from '@/components/GameOutcome.vue';
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
		<NewGame v-if="!store.game"></NewGame>
		<GamePlayer v-else-if="!store.game.endTime"></GamePlayer>
		<GameOutcome v-else></GameOutcome>
	</div>
</template>

<style scoped></style>
