<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { computed, reactive } from 'vue';
import HighScoreRow from './HighScoreRow.vue';
import ScoreOdometer from './ScoreCounter.vue';

const gameStore = useGameStore();
const editingHighScoreIds = reactive(new Set<string>());
const isEditingHighScore = computed(() => editingHighScoreIds.size > 0);

function onHighScoreEditing(id: string, isEditing: boolean) {
	if (isEditing) {
		editingHighScoreIds.add(id);
	} else {
		editingHighScoreIds.delete(id);
	}
}
</script>

<template>
	<table>
		<tbody>
			<tr>
				<td class="score-container">
					<h2>Your score</h2>
					<ScoreOdometer />
				</td>

				<td class="high-score-container">
					<h2>High scores</h2>
					<table>
						<tbody>
							<HighScoreRow
								v-for="(hs, i) in gameStore.highScores"
								v-bind:key="hs.id"
								:high-score="hs"
								:style="{ '--row-index': i }"
								@editing="onHighScoreEditing(hs.id, $event)"
							/>
						</tbody>
					</table>
				</td>
			</tr>

			<tr v-if="!isEditingHighScore">
				<td colspan="2" class="continue"><button @click="gameStore.$reset()">Continue</button></td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped>
h2 {
	font-family: 'DSEG14 Modern';
	text-align: right;
	text-transform: uppercase;
}

.score-container {
	padding-right: 40px;
	vertical-align: top;
}

.high-score-container {
	tbody:has(tr.editing) tr:not(.editing) {
		opacity: 0.4;
	}
}

.continue {
	text-align: center;
}
</style>
