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
  priceLimit: { min: -20, max: 20 }, // Example limits
  startPrice: 150 // Example starting price
})

onBeforeMount(() => {
})
onMounted(() => {
  drawChart('priceChart', data.prices, data.priceLimit, 180, 80, 20);
})
defineExpose({
  ...toRefs(data)
})

function generatePriceData() {
  return Array.from({ length: 40 }, () => (Math.random() * 40 - 20).toFixed(2));
}

function drawChart(canvasId, prices, priceLimit, width, height, padding) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');

  // 清除画布
  ctx.clearRect(0, 0, width, height);

  // 创建渐变
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0)'); // 从完全透明开始
  gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0)'); // 从完全透明开始
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)'); // 结束时0.1不透明度的红色

  // 用渐变填充矩形
  ctx.fillStyle = gradient;
  ctx.fillRect(padding, padding, width - 2 * padding, height - 2 * padding);

  // 绘制坐标轴
  ctx.lineWidth = 0.3;
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(76, 122, 197,1)';
  ctx.beginPath();
  ctx.moveTo(padding, height / 2);
  ctx.lineTo(width - padding, height / 2);
  ctx.stroke();
  ctx.setLineDash([]); // 重置虚线为实线

  // 绘制价格趋势
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

function abstractDrawChart(canvasId, prices, priceLimit, width, height, padding) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');

  // 清除画布
  ctx.clearRect(0, 0, width, height);

  // 创建渐变
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0)'); // 从完全透明开始
  gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0)'); // 从完全透明开始
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)'); // 结束时0.1不透明度的红色

  // 用渐变填充矩形
  ctx.fillStyle = gradient;
  ctx.fillRect(padding, padding, width - 2 * padding, height - 2 * padding);

  // 绘制坐标轴
  ctx.lineWidth = 0.3;
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(76, 122, 197,1)';
  ctx.beginPath();
  ctx.moveTo(padding, height / 2);
  ctx.lineTo(width - padding, height / 2);
  ctx.stroke();
  ctx.setLineDash([]); // 重置虚线为实线

  // 绘制价格趋势
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