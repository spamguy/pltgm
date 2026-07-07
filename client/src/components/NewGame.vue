<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { ref } from 'vue';
import GithubIcon from './GithubIcon.vue';
import LicensePlate from './LicensePlate.vue';
import SignButton from './SignButton.vue';

const store = useGameStore();
const openGithub = () => window.open('https://github.com/spamguy/pltgm', '_blank');

const isHelpHovered = ref(false);
const isGitHubHovered = ref(false);
const helpPage = ref(0);
const helpDialog = ref<HTMLElement | null>(null);
const showHelp = () => (helpDialog.value as HTMLDialogElement)?.showModal();
</script>

<template>
	<div class="new-game-container">
		<LicensePlate text="PLTGM" origin="CA" class="new-game-item"></LicensePlate>

		<table class="button-container new-game-item">
			<tbody>
				<tr>
					<td>
						<SignButton
							@click="showHelp"
							@mouseenter="isHelpHovered = true"
							@mouseleave="isHelpHovered = false"
						>
							?
						</SignButton>
					</td>
					<td>
						<SignButton
							id="github-link"
							@click="openGithub"
							@mouseenter="isGitHubHovered = true"
							@mouseleave="isGitHubHovered = false"
						>
							<GithubIcon />
						</SignButton>
					</td>
					<td></td>
					<td>
						<SignButton @click="store.startGame()">New Game</SignButton>
					</td>
				</tr>
				<tr>
					<td class="sign-label"><span v-if="isHelpHovered">Help</span></td>
					<td class="sign-label"><span v-if="isGitHubHovered">GitHub</span></td>
					<td></td>
					<td></td>
				</tr>
			</tbody>
		</table>

		<dialog
			ref="helpDialog"
			id="help-dialog"
			@click.self="($event.target as HTMLDialogElement).close()"
		>
			<h1>Welcome to PLTGM!</h1>
			<h2>(pronounced: 'plate game' or 'pultgum')</h2>

			<div class="dialog-content" v-if="helpPage === 0">
				<p>
					Your job is to list all the English words you can think of that use
					<strong>all</strong> the plate's letters <strong>in order</strong>.
				</p>

				<div class="examples-wrapper">
					<div class="example-container">
						<img src="../assets/left-down-arrow.png" alt="Left Arrow" />
						<LicensePlate text="TEN8646" origin="WA" class="example-plate"></LicensePlate>
						<img src="../assets/left-down-arrow.png" alt="Right Arrow" class="right-arrow" />
					</div>

					<div class="example-container">
						<table>
							<tbody>
								<tr class="example">
									<td><u>ten</u></td>
									<td>net</td>
								</tr>
								<tr class="explanation">
									<td></td>
									<td>[Letters not in order]</td>
								</tr>
								<tr class="example">
									<td><u>ten</u>t</td>
									<td><u>te</u>xt</td>
								</tr>
								<tr class="explanation">
									<td></td>
									<td>[Does not use all letters]</td>
								</tr>
								<tr class="example">
									<td>bea<u>ten</u></td>
									<td>benu<u>t</u>z<u>en</u></td>
								</tr>
								<tr class="explanation">
									<td></td>
									<td>[Not an English word]</td>
								</tr>
								<tr class="example">
									<td>effec<u>t</u>iv<u>en</u>ess</td>
									<td><u>Ten</u>nessee</td>
								</tr>
								<tr class="explanation">
									<td></td>
									<td>[No proper nouns]</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</dialog>
	</div>
</template>

<style lang="css">
.new-game-container {
	display: flex;
	flex-direction: column;
	align-items: center;

	.new-game-item {
		width: 600px;
		height: auto;
	}
	.button-container {
		margin-top: 15px;
		table-layout: fixed;

		td {
			padding-left: 10px;
			padding-right: 10px;
		}

		td:nth-child(1) {
			width: 20%;
		}
		td:nth-child(2) {
			width: 20%;
		}
		td:nth-child(3) {
			width: 20%;
		}
		td:nth-child(4) {
			width: 40%;
		}

		td.sign-label {
			font-family: 'Overpass', sans-serif;
			text-align: center;
			font-size: 14pt;
			height: 28px;
		}

		svg {
			fill: white;
			height: 100%;
		}
	}

	dialog {
		border-radius: 18px;
		font-family: 'Overpass', sans-serif;
		padding: 25px;

		.dialog-content {
			margin: 20px auto 30px auto;
			font-weight: 300;

			strong {
				font-weight: 700;
			}

			.examples-wrapper {
				width: 400px;
				margin: 0 auto;
			}

			.example-container {
				width: 100%;
				display: flex;
				justify-content: space-between;

				img {
					height: 100px;
				}

				.example-plate {
					height: auto;
					width: 200px;
				}

				.right-arrow {
					transform: scaleX(-1);
				}

				table {
					width: 100%;
					table-layout: fixed;
					border-collapse: collapse;

					td {
						width: 50%;
					}

					td:last-child {
						text-align: right;
					}

					tr.example {
						font-weight: 700;
						line-height: 1;

						td {
							padding-bottom: 0;
						}

						td:last-child {
							color: red;
							text-decoration: line-through;
						}
					}

					tr.explanation {
						font-size: 8pt;

						td {
							padding-top: 0;
							padding-bottom: 4px;
						}
					}
				}
			}
		}
	}
}

dialog::backdrop {
	background-color: transparent;
	transition: background-color 300ms ease;
	transition-behavior: allow-discrete;
}

dialog[open]::backdrop {
	background-color: #505050;
}

@starting-style {
	dialog[open]::backdrop {
		background-color: transparent;
	}
}
</style>
