<template>
  <div class="capitalMarket-container">
    <!-- @description: 顶部工具栏 -->
    <p class="header-tools">
      <el-icon class="icon" @click="codeSearchHandler">
        <Plus />
      </el-icon>
    </p>

    <div class="search-container " v-if="data.searchVisible">
      <el-input v-model.number="data.searchCode" class="input PingFang" placeholder="请输入六位编码，如 000001"
        @input="validateInput"></el-input>
      <el-card class="card">
        <el-descriptions  direction="vertical" :column="2" size="large" border>
          <el-descriptions-item v-for="item in data.searchResult" :key="item.key" :label="item.key">{{ item.value }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
    <!-- <span class="LCD" style="color: red;">300444  +5.6% 8.66</span>
    <PriceChart :prices="data.prices"/> -->
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PriceChart from '../PriceChart/index.vue'
const route = useRoute();
const router = useRouter();
const proxy = getCurrentInstance()?.proxy;
const { request, storage } = proxy

const pageName = 'capitalMarket'
import crud from '@/utils/crud'
import API_Service from 'kaka-api-service'

API_Service.registerApi(pageName, {
  fetch: {
    searchCode: (symbol) => request.get(`/finance/stockInfo`, { symbol }),
  },
})

const data = reactive({
  prices: generatePriceData(),
  priceLimit: { min: -20, max: 20 }, // Example limits
  startPrice: 150, // Example starting price
  // * 搜索框
  searchCode: '',
  lastSearchCode: '', // 存储上一次请求的编码
  searchVisible: false,
  //  * 搜索结果
  searchResult:[]
})

/**
 * 请求集合
 */
const requestCollection = {
  // 搜索 基础信息
  getSearchData: async (code) => {
    data.searchResult = []
    const result = await crud.launch(() => {
      return API_Service.fetch(pageName, code, 'searchCode')
    })
    for(let key in result.data.item) {
      data.searchResult.push({
        key:result.data.item[key],
        value:result.data.value[key]
      })
    }
  },
}

onBeforeMount(() => {
})
onMounted(() => {
  // setInterval(() => {
  //   data.prices = generatePriceData()
  // }, 1000)
})
defineExpose({
  ...toRefs(data)
})

function generatePriceData() {
  return Array.from({ length: 40 }, () => (Math.random() * 40 - 20).toFixed(2));
}

function codeSearchHandler() {
  data.searchVisible = true
}

function validateInput() {
  // 只保留数字并限制长度为六位
  data.searchCode = data.searchCode.toString().replace(/\D/g, '').slice(0, 6);
  // 如果输入达到六位数，触发请求方法
  if (data.searchCode.length === 6) {
    sendRequest();
  }
}

async function sendRequest() {
  // 检查当前编码是否与上一次相同
  if (data.searchCode === data.lastSearchCode) {
    return;
  }
  // 更新上一次请求的编码
  data.lastSearchCode = data.searchCode;
  await requestCollection.getSearchData(data.searchCode)
  console.log('请求已发送，编码:', data.searchCode);
  // 可以使用axios或fetch发送请求
}

</script>

<style scoped lang='scss'>
.capitalMarket-container {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  padding: 30px;
  position: relative;
  width: 100%;

  // * 顶部工具栏
  .header-tools {
    align-items: center;
    display: flex;
    height: 40px;

    .icon {
      background-color: rgb(255, 255, 255);
      border-radius: 10%;
      cursor: pointer;
      color: rgb(28, 34, 56);
      padding: 10px;
    }
  }

  // * 搜索框
  .search-container {
    background-color: rgba(0, 0, 0, 0.5);
    height: 100%;
    left: 0;
    top: 0;
    position: fixed;
    width: 100%;

    .input {
      height: 50px;
      margin: 60px 5% 10px 5%;
      width: 90%;
    }

    .card {
      margin: 0 5% 10px 5%;
      width: 90%;
    }
  }
}
</style>