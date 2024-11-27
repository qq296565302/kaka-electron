<template>
	<div class="Page-Home _drag">
		<!-- CLS 数据 -->
		<div class="cls-container" ref="clsContainer" @scroll="handleClsScroll">
			<p class="lastUpdated PingFang _drag">
				<span>最后更新时间：{{ data.lastUpdated }}</span>
				<span class="update _no-drag" @click="requestCollection.getClsData()">手动更新</span>
			</p>
			<div class="cls-item PingFang _no-drag" v-for="item in data.cls" :key="item['发布时间']">
				<div class="cls-item-title" v-if="item['标题']">{{ item['标题'] }}</div>
				<div class="cls-item-content">{{ item['内容'] }}</div>
				<p class="posters">生成分享海报</p>
			</div>
			<!-- 回到顶部 -->
			<div class="back-to-top" @click="handleBackToTop" v-if="clsBackToTop">
				<el-icon class="icon"><Top /></el-icon>
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
import dayjs from 'dayjs'
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
		data.lastUpdated = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
		data.cls = result.data
	},
}
const data = reactive({
	lastUpdated: '', // 最后更新时间
	cls: [],
})
// CLS 滚动事件 如果滑动距离大于 500px 显示回到顶部按钮，点击按钮，返回顶部
const clsContainer = ref(null)
const clsBackToTop = ref(false)
const handleClsScroll = () => {
	if (clsContainer.value) {
		const scrollTop = clsContainer.value.scrollTop // 获取滚动距离
		clsBackToTop.value = scrollTop > 500
	}
}
const handleBackToTop = async () => {
	if (clsContainer.value) {
		clsContainer.value.scrollTop = 0 // 设置滚动距离为 0
		await requestCollection.getClsData()
	}
}
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
	padding: 30px;
	position: relative;
	width: 100%;
	.lastUpdated {
		color: #919191;
		display: flex;
		font-size: 12px;
		height: 40px;
		justify-content: space-between;
		line-height: 40px;
		.update {
			cursor: pointer;
		}
	}
	&::-webkit-scrollbar {
		display: none;
	}
	.cls-item {
		background-color: #dddddd;
		box-sizing: border-box;
		border-radius: 10px;
		color: #131313;
		margin-bottom: 30px;
		opacity: 0.8;
		padding: 20px;
		&:hover {
			box-shadow: 0 0 10px #666666;
			opacity: 1;
		}
		.cls-item-title {
			border-bottom: 1px dashed #131313;
			font-weight: bold;
			line-height: 1.8;
			padding-bottom: 20px;
		}
		.cls-item-content {
			line-height: 1.8;
			text-indent: 2em;
			text-align: justify;
			padding: 20px 0;
		}
		.posters {
			cursor: pointer;
			font-size: 14px;
			text-align: right;
		}
	}
	.back-to-top {
		background-color: rgba(255, 255, 255, 0.6);
		border-radius: 100%;
		bottom: 20px;
		cursor: pointer;
		color: rgba(0, 6, 32, 1);
		font-size: 32px;
		height: 50px;
		line-height: 50px;
		position: fixed;
		right: 20px;
		text-align: center;
		width: 50px;
		.icon {
			left: 0px;
			position: relative;
			top: 5px;
		}
	}
}
</style>
