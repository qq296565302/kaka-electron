<template>
	<div class="Page-SiderBar _no-drag">
		<p v-for="(item, index) in data.side" :key="item.id" class="item" :class="{ active: data.sideActiveIndex === index }" @click="data.sideActiveIndex = index">
			<SVG :use="item.icon" class="svg" />
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

const data = reactive({
	// 侧边栏
	side: [
		{
			id: 0,
			name: '首页',
			icon: svg['logo'],
		},
	],
	sideActiveIndex: 0,
})

onBeforeMount(() => {})
onMounted(() => {})
defineExpose({
	...toRefs(data),
})
</script>
<style scoped lang="scss">
@import '../assets/scss/sidebar.scss';
</style>
