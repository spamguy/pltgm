<script setup lang="ts">
import { TourGuideManager, type TourGuideManagerRef, type TourGuideStep } from 'v-tour-guide';
import 'v-tour-guide/style.css';
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';

import GamePlayer from '@/components/GamePlayer.vue';
import SignButton from '@/components/SignButton.vue';
import { useGameStore } from '@/store/game';

const store = useGameStore();
const router = useRouter();
const tour = useTemplateRef<TourGuideManagerRef>('tour');

// TODO: Flesh out step content.
const steps: TourGuideStep[] = [
	{
		id: 'plate',
		title: 'The plate',
		content: 'TODO: Use all the letters on the plate, in order.',
		target: 'plate',
		direction: 'bottom',
		showAction: true,
	},
	{
		id: 'status',
		title: 'Score and time',
		content: 'TODO: Each word scores its length and adds time to the clock.',
		target: 'status',
		direction: 'left',
		showAction: true,
	},
	{
		id: 'guess-form',
		title: 'Make a guess',
		content: 'TODO: Type a word here and press Check.',
		target: 'guess-form',
		direction: 'top',
		showAction: true,
	},
	{
		id: 'wrap-up',
		title: 'Ready?',
		content: 'TODO: Keep practicing, or exit to start a real game.',
		target: 'tutorial-exit',
		direction: 'top',
		showAction: true,
	},
];

// The tour targets only exist once the game has been created, so start it then.
watch(
	() => store.game?.id,
	async (id) => {
		if (!id) return;
		await nextTick();
		tour.value?.startTourGuide();
	},
);

onMounted(() => store.startTutorial());
onBeforeUnmount(() => store.endTutorial());
</script>

<template>
	<GamePlayer />

	<div class="tutorial-exit" data-tour-guide="tutorial-exit">
		<SignButton @click="router.push('/')">Exit Tutorial</SignButton>
	</div>

	<TourGuideManager ref="tour" :steps="steps" allow-interactions />
</template>

<style lang="css">
.tutorial-exit {
	margin-top: 15px;
	width: 300px;
}
</style>
