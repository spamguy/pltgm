<script setup lang="ts">
import { useGameStore } from '@/store/game';

const store = useGameStore();
</script>

<template>Game {{ store.game?.id }} created</template>
