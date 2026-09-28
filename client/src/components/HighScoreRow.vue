<script setup lang="ts">
import { SOCKETS } from '#common/constants';
import { PlateOriginsList, type HighScore } from '#common/types';
import { socket } from '@/sockets';
import { ref } from 'vue';

const props = defineProps<{ highScore: HighScore }>();

const text = ref(props.highScore.text);
const origin = ref(props.highScore.origin ?? PlateOriginsList[0]);
const isCancelled = ref(false);
const isSaved = ref(false);

function isScoreVisible({ text, isCurrentGame, score }: HighScore) {
	return text || (isCurrentGame && score > 0);
}

function onOk() {
	socket.emit(
		SOCKETS.GAME_HIGH_SCORE,
		{ ...props.highScore, text: text.value, origin: origin.value },
		(saved: boolean) => {
			isSaved.value = saved;
		},
	);
}

function onCancel() {
	isCancelled.value = true;
}
</script>

<template>
	<tr v-if="!isCancelled && isScoreVisible(highScore)">
		<td v-if="highScore.isCurrentGame && !isSaved">
			<input type="text" v-model="text" />
			<select v-model="origin">
				<option v-for="o in PlateOriginsList" :key="o" :value="o">{{ o }}</option>
			</select>
			<button @click="onOk">OK</button>
			<button @click="onCancel">Cancel</button>
		</td>
		<td v-else>{{ text }}</td>
		<td>{{ highScore.score }}</td>
	</tr>
</template>
