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
const tooltip = {
	headerClass: 'tooltip-header',
	contentClass: 'tooltip-body',
	actionsClass: 'tooltip-actions',
	backgroundColor: '#fff',
	textColor: '#000',
	buttonBackgroundColor: '#006b54',
};

// TODO: Flesh out step content.
const steps: TourGuideStep[] = [
	{
		id: 'plate',
		title: 'The plate',
		content:
			'Given a random license plate, list all the words that use its letters in order. For this plate, r<u>ing</u>, t<u>ing</u>e, sledd<u>ing</u>, and d<u>i</u>se<u>ng</u>age are examples.',
		target: 'plate',
		direction: 'bottom',
		showAction: true,
		allowHtml: true,
		tooltip,
	},
	{
		id: 'status',
		title: 'Score and time',
		content: 'For each valid word, you score one point per letter and get extra time on the clock.',
		target: 'status',
		direction: 'left',
		showAction: true,
		tooltip,
	},
	{
		id: 'wrap-up',
		title: 'Ready?',
		content: 'Feel free to try it out now with the timer disabled, or continue to a real game.',
		target: 'tutorial-exit',
		direction: 'top',
		showAction: true,
		tooltip,
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

.tooltip-header {
	font-family: 'Overpass', sans-serif;
	font-size: 16pt;
}

.tooltip-body {
	font-family: 'Overpass', sans-serif;
	font-weight: 300;
}

.tooltip-actions {
	button {
		font-family: 'Overpass', sans-serif !important; /* No better way to override default font. */
	}
}
</style>
