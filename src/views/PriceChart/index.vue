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

onBeforeMount(() => {
})
onMounted(() => {
})
defineExpose({
    ...toRefs(data)
})

</script>
<style scoped lang='scss'></style>