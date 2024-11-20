<template>
	<div class="Component-Logo">
		<SVG :use="svg.logo" class="svg" />
		<p>Touch A Word</p>
	</div>
</template>
<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const { svg } = proxy
</script>
<style lang="scss" scoped>
.Component-Logo {
	display: flex;
	.svg {
		padding: 0 5px;
	}
}
</style>
