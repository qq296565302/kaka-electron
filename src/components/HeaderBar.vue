<template>
	<div class="Page-HeaderBar">
		<p class="icon-title">
			<SVG :use="svg.icon" />
			<span>
				Touch
				<del>FISH</del>
				Word
			</span>
		</p>
		<p class="toolbar">
			<SVG :use="svg.pushpin" @click="clickPushpinHandle" />
		</p>
	</div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue'

/**
 * 公共挂载方法和变量
 */
const { proxy } = getCurrentInstance()
const { svg } = proxy

/**
 * 数据部分
 */
const data = reactive({})
const clickPushpinHandle = () => {}
onBeforeMount(() => {})
onMounted(() => {})
defineExpose({
	...toRefs(data),
})
</script>
<style scoped lang="scss"></style>
