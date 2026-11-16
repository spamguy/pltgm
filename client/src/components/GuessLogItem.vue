<script setup lang="ts">
import type { WordCheckSocketCallback } from '#common/types';

const { guess } = defineProps<{ guess: WordCheckSocketCallback }>();
</script>

<template>
	<div class="guess-container" :class="guess.result">{{ guess.guessWord }}</div>
</template>

<style lang="css" scoped>
.guess-container {
	width: 100px;
}
</style>
