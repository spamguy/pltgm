<script setup lang="ts">
import { socket } from './sockets';

// remove any existing listeners (after a hot module replacement)
socket.off();
</script>

<template>
	<h1>You did it!</h1>
	<p>
		Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
		documentation
	</p>
</template>

<style scoped></style>
