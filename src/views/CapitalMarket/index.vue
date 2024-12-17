<template>
  <div class="capitalMarket-container">
    <!-- @description: 顶部工具栏 -->
    <p class="header-tools">
      <el-icon class="icon" @click="codeSearchHandler">
        <Plus />
      </el-icon>
    </p>
    <section class="choice-container">
      <div v-for="item in data.choiceList" :key="item" class="choice-item">
        <div class="text">
          <span class="LCD" style="color: red;">{{ item }} +5.6% 8.66</span>
        </div>
        <div class="chart">
          <PriceChart :prices="generatePriceData()" :options="{ id: 'priceChart_' + item }" />
        </div>
        <div class="btn">
          <el-icon class="icon">
            <Delete />
          </el-icon>
          <el-icon class="icon">
            <Upload />
          </el-icon>
        </div>
      </div>
    </section>
    <!-- @description: 搜索框 -->
    <div class="search-container " v-if="data.searchVisible">
      <el-input v-model="data.searchCode" class="input PingFang" placeholder="请输入六位编码，如 000001" @input="validateInput"
        clearable @clear="data.searchResult = []"></el-input>
      <el-card class="card">
        <el-descriptions direction="vertical" :column="2" size="large" border v-if="data.searchResult.length"
          class="PingFang">
          <el-descriptions-item v-for="item in data.searchResult" :key="item.key" :label="item.key">{{ item.value
            }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else />
      </el-card>
      <!-- 确认 / 取消 -->
      <div class="btn-container">
        <el-button type="primary" @click="joinChoiceHandler">加入自选</el-button>
        <el-button @click="cancelHandler">取消</el-button>
      </div>
    </div>

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
  searchResult: [],
  // * 自选列表
  choiceList: [],
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
    const checkKey = ['行业', '股票简称', '总股本', '流通股']
    for (let key in result.data.item) {
      if (!checkKey.includes(result.data.item[key])) continue
      data.searchResult.push({
        key: result.data.item[key],
        value: result.data.value[key]
      })
    }
  },
}
/**
 * * 加入自选
 */
const joinChoiceHandler = () => {
  const choice = storage.getItem('choice')
  if (!choice) {
    storage.setItem('choice', [data.searchCode])
    cancelHandler()
    return
  }
  if (choice.includes(data.searchCode)) {
    cancelHandler()
    return
  }
  choice.push(data.searchCode)
  storage.setItem('choice', choice)
  cancelHandler()
}
const cancelHandler = () => {
  // 清空
  data.searchResult = []
  data.searchCode = ''
  // 更新自选列表
  data.choiceList = storage.getItem('choice')
  // 关闭
  data.searchVisible = false
}

onBeforeMount(() => {
  data.choiceList = storage.getItem('choice') || []
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
  // 只保留数字
  data.searchCode = data.searchCode.replace(/[^\d]/g, '').slice(0, 6);
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

    .btn-container {
      display: flex;
      justify-content: center;
    }
  }

  // * 自选列表
  .choice-container {
    height: calc(100% - 60px);
    margin-top: 10px;
    overflow: auto;
    width: 100%;

    .choice-item {
      background-color: rgba(0, 65, 102, 0.5);
      border-radius: 10px;
      display: flex;
      justify-content: space-around;
      height: 18%;
      margin-bottom: 2%;

      .text {
        width: 30%;
      }


      .chart {
        align-items: center;
        display: flex;
        width: 50%;
      }

      .btn {
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        height: 100%;
        width: 10%;

        .icon {
          background-color: rgb(28, 34, 56);
          border-radius: 10%;
          cursor: pointer;
          color: rgb(255, 255, 255);
          font-size: 16px;
          padding: 5px;
          opacity: 0.5;
        }

        .icon:hover {
          opacity: 1;
        }
      }
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>