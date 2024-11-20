<template>
	<div class="Page-Home _drag">
		<!-- 侧边栏 -->
		<SideBar />
	</div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()

/**
 * 引入的组件
 * SideBar 侧边栏
 */
import SideBar from './SideBar.vue'

const data = reactive({
	result: '',
})

const load = async () => {
	const result = await window.electronAPI.loadBook('CET4_1')
	data.result = result.code
}

onBeforeMount(() => {})
onMounted(() => {})
defineExpose({
	...toRefs(data),
})
</script>
<style scoped lang="scss"></style>
