<template>
  <div>
    <span class="LCD" style="color: red;">300444  +5.6% 8.66</span>
    <PriceChart :prices="data.prices"/>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance,h,nextTick} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PriceChart from '../PriceChart/index.vue'
const route = useRoute();
const router = useRouter();
const proxy = getCurrentInstance()?.proxy;

const data = reactive({
  prices: generatePriceData(),
  priceLimit: { min: -20, max: 20 }, // Example limits
  startPrice: 150 // Example starting price
})

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

</script>

<style scoped lang='scss'>

</style>