<script setup lang="ts">
import GameOutcome from '@/components/GameOutcome.vue';
import GamePlayer from '@/components/GamePlayer.vue';
import NewGame from '@/components/NewGame.vue';
import { useGameStore } from '@/store/game';

const store = useGameStore();
</script>

<template>
	<NewGame v-if="!store.game"></NewGame>
	<GamePlayer v-else-if="!store.game.endedAt"></GamePlayer>
	<GameOutcome v-else></GameOutcome>
</template>
