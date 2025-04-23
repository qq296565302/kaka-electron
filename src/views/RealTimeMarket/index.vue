<template>
    <div class="RealTimeMarket">
        <section class="market">
            <el-alert class="alert" v-if="alertMessage" :title="alertMessage" :type="alertType" />
            <RadioInputs v-model="marketType" name="market-type" :options="marketOptions" />
            <AllQuotes v-if="marketType === 'all'" />
        </section>
        <section class="news">
            <RadioInputs v-model="newsType" name="news-type" :options="newsOptions" />
            <News v-if="newsType === 'telegraph'" ref="newsComponent" />
            <Sina7x24 v-if="newsType === 'sina'" ref="sinaComponent" />
        </section>
    </div>
</template>

<script setup>
import AllQuotes from "./allQuotes.vue"; // 全指数
import News from "./News.vue"; // 财联社
import Sina7x24 from "./Sina7x24.vue"; // 新浪7x24
import RadioInputs from "../../components/RadioInputs.vue";
import { useTradeStore } from 'stores/trade'; // 状态管理 store
import WebSocketService from '@zhaoshijun/ws-service';
const tradeStore = useTradeStore(); // 获取交易状态 store
const alertMessage = ref('');
const alertType = ref('error');

const ws = WebSocketService.getInstance();

watch(() => tradeStore.tradeStatus, () => {
    const statusName = tradeStore.tradeStatusName;
    let alertText = '';
    if (tradeStore.tradeStatus === '3') {
        alertType.value = 'info';
        alertText = `A股 ${statusName}`;
    }
    if (tradeStore.tradeStatus === '2') {
        alertType.value = 'error';
        alertText = `A股 ${statusName}，最后交易时间：${tradeStore.lastTradeTime}`;
    }
    if (tradeStore.tradeStatus === '1') {
        alertType.value = 'success';
        alertText = `A股 ${statusName}`;
    }
    if (tradeStore.tradeStatus === '0') {
        alertType.value = 'error';
        alertText = `A股 ${statusName}`;
    }
    alertMessage.value = alertText;

    // 获取 WebSocket 服务并发送状态变化消息
    try {
        if (ws.getState() === 1) { // 1 表示 WebSocket.OPEN
            // 构建状态变化消息
            const statusMessage = JSON.stringify({
                type: 'tradeStatusChange',
                data: {
                    status: tradeStore.tradeStatus,
                    statusName: statusName,
                    timestamp: Date.now(),
                    lastTradeTime: tradeStore.lastTradeTime || null
                }
            });

            // 发送消息到服务端
            ws.send(statusMessage);
            console.log('已发送交易状态变化消息到服务端');
        } else {
            console.warn('WebSocket 连接未打开，无法发送交易状态变化消息');
        }
    } catch (error) {
        console.error('发送交易状态变化消息失败:', error);
    }
});

// 市场类型
const marketType = ref('all');
const marketOptions = [
    { value: 'all', label: '全指数' },
    { value: 'shanghai', label: '沪A个股' },
    { value: 'shenzhen', label: '深A个股' },
    { value: 'create', label: '创业板' },
    { value: 'kua', label: '科创板' },
    { value: 'self', label: '自选' }
];

// 监听 ws 消息推送
const marketDatas = ref([]);

// WebSocket连接和消息处理
const getMarketDataMessage = (msg) => {
    // 忽略心跳消息
    if (msg === heartbeatConfig.message) return;
    // 处理接收到的消息
    const receiveMessages = JSON.parse(msg);
    console.log('收到 WebSocket 消息:', msg);
};

// 新闻类型
const newsType = ref('telegraph');
const newsOptions = [
    { value: 'telegraph', label: '财联社电报' },
    { value: 'sina', label: '新浪7x24' }
];

const { } = getCurrentInstance()?.proxy;

onBeforeMount(() => {
});

// 组件卸载前关闭WebSocket连接
onBeforeUnmount(() => {
});
onMounted(() => {

});
defineExpose({});
</script>
<style scoped lang="scss">
.RealTimeMarket {
    display: flex;

    .market {
        position: relative;
        flex: 6;

        .alert {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 10;
            border-radius: 0;
        }
    }

    .news {
        flex: 3;
    }
}
</style>
<style>
/* From Uiverse.io by 00Kubi */
.radio-inputs {
    position: relative;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    border-radius: 0.5rem;
    background-color: #eee;
    box-sizing: border-box;
    box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
    padding: 10px;
    width: 100%;
    font-size: 14px;
}

.radio-inputs .radio {
    flex: 1 1 auto;
    text-align: center;
}

.radio-inputs .radio input {
    display: none;
}

.radio-inputs .radio .name {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    border: none;
    padding: 0.5rem 0;
    color: rgba(51, 65, 85, 1);
    transition: all 0.15s ease-in-out;
}

.radio-inputs .radio input:checked+.name {
    background-color: #fff;
    font-weight: 600;
}

/* Hover effect */
.radio-inputs .radio:hover .name {
    background-color: rgba(255, 255, 255, 0.5);
}

/* Animation */
.radio-inputs .radio input:checked+.name {
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: select 0.3s ease;
}

@keyframes select {
    0% {
        transform: scale(0.95);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

/* Particles */
.radio-inputs .radio input:checked+.name::before,
.radio-inputs .radio input:checked+.name::after {
    content: "";
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #3b82f6;
    opacity: 0;
    animation: particles 0.5s ease forwards;
}

.radio-inputs .radio input:checked+.name::before {
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
}

.radio-inputs .radio input:checked+.name::after {
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
}

@keyframes particles {
    0% {
        opacity: 0;
        transform: translateX(-50%) translateY(0);
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translateX(-50%) translateY(var(--direction));
    }
}

.radio-inputs .radio input:checked+.name::before {
    --direction: -10px;
}

.radio-inputs .radio input:checked+.name::after {
    --direction: 10px;
}
</style>
