<template>
	<!-- CLS 数据 -->
	<div class="cls-container" ref="clsContainer" @scroll="handleClsScroll">
		<p class="lastUpdated PingFang _drag">
			<span>最后更新时间：{{ data.lastUpdated }}</span>
			<span class="update _no-drag" @click="requestCollection.getClsData()">手动更新</span>
		</p>
		<div class="cls-item PingFang _no-drag" v-for="item in data.cls" :key="item['发布时间']">
			<div class="cls-item-title" v-if="item['标题']">{{ item['标题'] }}</div>
			<div class="cls-item-content">{{ item['内容'] }}</div>
			<p class="posters" @click="handlePosters(item)">生成分享海报</p>
		</div>
		<!-- 回到顶部 -->
		<div class="back-to-top _no-drag" @click="handleBackToTop" v-if="clsBackToTop">
			<el-icon class="icon"><Top /></el-icon>
		</div>
	</div>

	<!-- 海报容器 -->
	<div class="posters-container" v-if="createPoster">
		<div class="posters-button _no-drag">
			<el-button type="primary" plain round @click="copyPosterHandler">复制图片</el-button>
			<el-button type="warning" plain round @click="closePostersHandler">关闭</el-button>
		</div>
		<div class="posters-container-wrapper" ref="postersContainer">
			<div class="posters-container-inner _no-drag">
				<div class="publicize">
					<p class="title PMZD">市场速览</p>
					<p class="author PingFang">@卡卡投资助手 发布于 {{ data.posterData['发布时间'] }}</p>
				</div>
				<p class="dividingLine"></p>
				<div class="content">
					<div class="posters-title PingFang" v-if="data.posterData['标题']">{{ data.posterData['标题'] }}</div>
					<div class="posters-content PingFang">{{ data.posterData['内容'] }}</div>
					<div class="posters-tip PingFang">投资有风险，入市需谨慎。</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue'

const proxy = getCurrentInstance()?.proxy
const { request, storage } = proxy

const pageName = 'cls'
import crud from '@/utils/crud'
import API_Service from 'kaka-api-service'

API_Service.registerApi(pageName, {
	fetch: {
		cls: (symbol) => request.get(`/finance/news/cls`, { symbol }),
	},
})

/**
 * 请求集合
 */
import dayjs from 'dayjs'
const requestCollection = {
	// 获取 CLS 数据
	getClsData: async (type) => {
		const result = await crud.launch(() => {
			return API_Service.fetch(pageName, type, 'cls')
		})
		data.lastUpdated = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
		data.cls = result.data
		data.count = result.count
	},
}

const data = reactive({
	lastUpdated: '', // 最后更新时间
	cls: [],
	count: 0,
	posterData: {},
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

import html2canvas from 'html2canvas'
// 生成海报
const createPoster = ref(false)
const postersContainer = ref(null)
const handlePosters = (content) => {
	data.posterData = content
	createPoster.value = true
}
// 复制海报
const copyPosterHandler = async () => {
	const canvas = await html2canvas(postersContainer.value)
	// 将 canvas 转换为数据 URL
	const dataURL = canvas.toDataURL('image/png')
	await window.electronAPI.copyImageToClipboard(dataURL)
}
// 关闭海报
const closePostersHandler = () => {
	createPoster.value = false
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
		bottom: 120px;
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
.posters-container {
	box-sizing: border-box;
	padding: 20px;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.8);
	z-index: 9999;
	.posters-container-wrapper {
		background-color: #131313;
		box-sizing: border-box;
		padding: 20px;
		width: 100%;
		.posters-container-inner {
			border-radius: 3px;
			background-color: #fff;
			width: 100%;
			.publicize {
				background-color: rgba(235, 235, 235, 0.6);
				box-sizing: border-box;
				height: 100px;
				padding: 20px;
				width: 100%;
				.title {
					color: rgb(28, 34, 56);
					font-size: 24px;
				}
				.author {
					color: #757575;
					font-size: 12px;
					margin: 10px 0;
				}
			}
			// 分割线
			.dividingLine {
				height: 15px;
				position: relative;
				top: -7.5px;
				width: 100%;
				&::before {
					background-color: #131313;
					border-radius: 100%;
					content: '';
					display: block;
					height: 15px;
					left: -7.5px;
					position: absolute;
					width: 15px;
				}
				&::after {
					background-color: #131313;
					border-radius: 100%;
					content: '';
					display: block;
					height: 15px;
					position: absolute;
					right: -7.5px;
					width: 15px;
				}
			}
			// 内容
			.content {
				box-sizing: border-box;
				padding: 20px;
				.posters-title {
					border-bottom: 1px dashed #131313;
					font-weight: bold;
					line-height: 1.8;
					padding-bottom: 20px;
				}
				.posters-content {
					line-height: 1.8;
					text-indent: 2em;
					text-align: justify;
					padding: 20px 0;
				}
				.posters-tip {
					color: #757575;
					font-size: 12px;
					margin: 10px 0;
				}
			}
		}
	}

	.posters-button {
		align-items: center;
		display: flex;
		height: 50px;
		justify-content: space-around;
		width: 100%;
	}
}
</style>
