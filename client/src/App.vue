<script setup lang="ts">
import NewGame from '@/components/NewGame.vue';
import RoundPlayer from '@/components/RoundPlayer.vue';
import { useGameStore } from '@/store/game';

import { socket } from './sockets';

// Remove any existing listeners (e.g., after a hot module replacement).
socket.off();

const store = useGameStore();
</script>

<template>
	<NewGame v-if="!store.game"></NewGame>
	<RoundPlayer v-else></RoundPlayer>
</template>

<style scoped></style>
