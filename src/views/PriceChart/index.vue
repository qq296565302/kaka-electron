<template>
    <canvas :id="options.id" :width="options.width" :height="options.height"></canvas>
</template>

<script setup>

import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const proxy = getCurrentInstance()?.proxy;
const data = reactive({})

defineProps({
    options: {
        type: Object,
        /**
         * * id: canvas id
         * * width: canvas width
         * * height: canvas height
         * * min: min price
         * * max: max price
         * * start: start price
         * * padding: padding
         */
        default: () => ({
            id: 'priceChart',
            width: 250,
            height: 120,
            min: -10,
            max: 10,
            start: 0,
            padding: 20
        })
    },
    prices: {
        type: Array,
        default: () => []
    }
})

const generateCanvasColor = (lastPrice) => {
    const lineColor = lastPrice > 0 ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)';
    const backgroundColor = lastPrice > 0 ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';
    return {
        lineColor,
        backgroundColor
    }
}

const drawChart = (canvasId, prices, priceLimit, width, height, padding) => {
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

const updateDrawChart = () => {
    const {
        id,
        width,
        height,
        min,
        max,
        start,
        padding
    } = data.options;

    drawChart(id, data.prices, data.priceLimit, width, height, padding);

}
onBeforeMount(() => {
})
onMounted(() => {
})
defineExpose({
    ...toRefs(data)
})

</script>
<style scoped lang='scss'></style>