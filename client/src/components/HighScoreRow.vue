<script setup lang="ts">
import { SOCKETS } from '#common/constants';
import { PlateOriginsList, type HighScore } from '#common/types';
import { socket } from '@/sockets';
import { computed, ref } from 'vue';
import LicensePlate from './LicensePlate.vue';

const props = defineProps<{ highScore: HighScore }>();

const text = ref(props.highScore.text);
const origin = ref(props.highScore.origin ?? PlateOriginsList[0]);
const isCancelled = ref(false);
const isSaved = ref(false);
const isEditing = computed(() => props.highScore.isCurrentGame && !isSaved.value);

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
	<tr v-if="!isCancelled && isScoreVisible(highScore)" :class="{ editing: isEditing }">
		<td v-if="isEditing">
			<input type="text" v-model="text" />
			<select v-model="origin">
				<option v-for="o in PlateOriginsList" :key="o" :value="o">{{ o }}</option>
			</select>
			<button @click="onOk">OK</button>
			<button @click="onCancel">Cancel</button>
		</td>
		<td v-else>
			<LicensePlate :text="text" :origin="origin" class="plate"></LicensePlate>
		</td>
		<td class="score">{{ highScore.score }}</td>
	</tr>
</template>

<style lang="css" scoped>
td {
	padding-bottom: 20px;

	&.score {
		font-family: 'DSEG7 Modern';
		text-align: right;
	}

	.plate {
		width: 100px;
	}
}
</style>
