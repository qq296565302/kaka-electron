<template>
  <div>
    <canvas id="priceChart" width="250" height="120"></canvas>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance,h,nextTick} from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const proxy = getCurrentInstance()?.proxy;

const data = reactive({
  prices: generatePriceData(),
  priceLimit: { min: 100, max: 200 }, // Example limits
  startPrice: 150 // Example starting price
})

onBeforeMount(() => {
})
onMounted(() => {
  drawChart();
})
defineExpose({
  ...toRefs(data)
})

function generatePriceData() {
  const currentData = [];
  let currentPrice = 150;
  for (let i = 0; i < 100; i++) {
    currentPrice += (Math.random() - 0.5) * 5; // Random fluctuation
    currentData.push(currentPrice);
  }
  return currentData;
}

function drawChart() {
  const canvas = document.getElementById('priceChart');
  const ctx = canvas.getContext('2d');
  const { prices, priceLimit } = data;
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;

  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  // Draw axes
  ctx.setLineDash([15, 0]);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash to solid for future drawings

  // Draw price trend
  ctx.beginPath();
  ctx.moveTo(padding, height - padding - (prices[0] - priceLimit.min) / (priceLimit.max - priceLimit.min) * (height - 2 * padding));
  for (let i = 1; i < prices.length; i++) {
    const x = padding + (i / prices.length) * (width - 2 * padding);
    const y = height - padding - (prices[i] - priceLimit.min) / (priceLimit.max - priceLimit.min) * (height - 2 * padding);
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'red';
  ctx.stroke();
}
</script>

<style scoped lang='scss'>

</style>