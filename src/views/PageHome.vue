<template>
	<div class="Page-Home _drag">
		<!-- CLS 数据 -->
		<div class="cls-container _no-drag">
			<div class="cls-item" v-for="item in data.cls" :key="item['发布时间']">
				<div class="cls-item-title" v-if="item['标题']">{{ item['标题'] }}</div>
				<div class="cls-item-content">{{ item['内容'] }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import crud from '@/utils/crud'
import API_Service from 'kaka-api-service'

const proxy = getCurrentInstance()?.proxy
const { request, storage } = proxy
const pageName = 'home'

API_Service.registerApi(pageName, {
	fetch: {
		default: (data) => request.get(`/finance/realTimeQuotes`, data),
		cls: (symbol) => request.get(`/finance/news/cls`, { symbol }),
	},
})
/**
 * 请求集合
 */
const requestCollection = {
	// 获取实时数据
	getRealData: async () => {
		const result = await crud.launch(() => {
			return API_Service.fetch(pageName, {
				symbol: '300444',
			})
		})
		console.log({ result })
	},
	// 获取 CLS 数据
	getClsData: async (type) => {
		const result = await crud.launch(() => {
			return API_Service.fetch(pageName, type, 'cls')
		})
		data.cls = result.data
		console.log(data.cls[0])
	},
}
const data = reactive({
	cls: [],
})

onBeforeMount(async () => {
	await requestCollection.getClsData()
})
onMounted(() => {})
defineExpose({
	...toRefs(data),
})
</script>
<style scoped lang="scss">
.cls-container {
	box-sizing: border-box;
	height: 100%;
	overflow: auto;
	padding: 50px;
	width: 100%;
	&::-webkit-scrollbar {
		display: none;
	}
	.cls-item {
		background-color: #dddddd;
		box-sizing: border-box;
		border-radius: 20px;
		color: #131313;
		margin-bottom: 40px;
		opacity: 0.3;
		padding: 40px;
		&:hover {
			opacity: 1;
		}
		.cls-item-title {
			border-bottom: 1px dashed #131313;
			font-weight: bold;
			padding-bottom: 30px;
		}
		.cls-item-content {
			line-height: 1.8;
			padding: 30px 0;
		}
	}
}
</style>
