<script setup lang="ts">
import NewGame from './components/NewGame.vue';
import { socket } from './sockets';

// Remove any existing listeners (e.g., after a hot module replacement).
socket.off();
</script>

<template>
	<NewGame></NewGame>
</template>

<style scoped></style>
