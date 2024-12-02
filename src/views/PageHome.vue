<template>
	<div class="Page-Home _drag">
		<cmpsvg :use="svgIcon.logo" />
		<Cls />
	</div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Cls from './Information/cls.vue'

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
const data = reactive({})

onMounted(() => {})
defineExpose({
	...toRefs(data),
})
</script>
<style scoped lang="scss"></style>
