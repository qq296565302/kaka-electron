<template>
	<div class="Page-Home">
		<div class="container">
			<Cls v-if="data.tabIndex === 0" :key="data.tabIndex"/>
			<CapitalMarket v-if="data.tabIndex === 1" :key="data.tabIndex"/>
		</div>
		<div class="navBar _no-drag">
			<cmpsvg :use="svgIcon.BN_information" class="nav-item" :class="{ active: data.tabIndex === 0 }" @click="data.tabIndex = 0" />
			<cmpsvg :use="svgIcon.BN_stock" class="nav-item" :class="{ active: data.tabIndex === 1 }" @click="data.tabIndex = 1" />
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Cls from './Information/cls.vue'
import CapitalMarket from './CapitalMarket/index.vue'

import crud from '@/utils/crud'
import API_Service from 'kaka-api-service'

const proxy = getCurrentInstance()?.proxy
const { request, storage, svgIcon } = proxy
const pageName = 'home'

API_Service.registerApi(pageName, {
	fetch: {
		default: (data) => request.get(`/finance/realTimeQuotes`, data),
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
}
const data = reactive({
	tabIndex: 0,
})

onMounted(() => {})
defineExpose({
	...toRefs(data),
})
</script>
<style scoped lang="scss">
.Page-Home {
	.container {
		height: calc(100% - 80px);
		width: 100%;
	}
	.navBar {
		align-items: center;
		background-color: rgb(23, 46, 73);
		display: flex;
		height: 80px;
		justify-content: space-around;
		position: relative;
		width: 100%;
		z-index: 5;
		.nav-item {
			height: 36px;
			width: 36px !important;
			filter: grayscale(80);
			&.active {
				filter: grayscale(0);
			}
		}
	}
}
</style>
