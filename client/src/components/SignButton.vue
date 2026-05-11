<template>
	<div class="sign">
		<div class="border">
			<div class="content">
				<slot />
			</div>
		</div>
	</div>
</template>

<style scoped lang="css">
.sign {
	background-color: #006b54;
	padding: 0.25em;
	border-radius: 20px;
	height: 80px;
	min-width: 80px;
	cursor: pointer;
}

.border {
	border: solid 0.1em white;
	border-radius: 18px;
	padding: 0.5em 0.75em;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;

	font-family: 'Overpass', sans-serif;
	font-size: 20pt;
}

.content {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
}
</style>
