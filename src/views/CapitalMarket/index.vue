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

  // Create gradient
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0)'); // Start with fully transparent
  gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0)'); // Start with fully transparent
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)'); // End with 0.3 opacity red

  // Fill rectangle with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(padding, padding, width - 2 * padding, height - 2 * padding);

  // Draw axes
  ctx.lineWidth = 0.3;
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(76, 122, 197,1)';
  ctx.beginPath();
  ctx.moveTo(padding, height / 2);
  ctx.lineTo(width - padding, height /2);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash to solid for future drawings

  // Draw price trend
  ctx.lineWidth = 1;
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