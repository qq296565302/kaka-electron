<template>
    <div class="RealTimeMarket">
        <section class="market">
            <el-alert class="alert" v-if="alertMessage" :title="alertMessage" :type="alertType" />
        </section>
        <section class="news">
            <div class="radio-inputs">
                <label class="radio">
                    <input type="radio" name="radio" v-model="newsType" value="telegraph"/>
                    <span class="name">财联社电报</span>
                </label>
                <label class="radio">
                    <input type="radio" name="radio" v-model="newsType" value="company"/>
                    <span class="name">上市公司今日动态</span>
                </label>
            </div>

            <News v-if="newsType === 'telegraph'"/>
        </section>
    </div>
</template>

<script setup>
import News from "./News.vue";
import { useTradeStore } from 'stores/trade'; // 状态管理 store
import { getWebSocketService } from 'utils/websocketService'; // WebSocket 服务
const tradeStore = useTradeStore(); // 获取交易状态 store
const alertMessage = ref('');
const alertType = ref('error');
watch(() => tradeStore.tradeStatus, () => {
    const statusName = tradeStore.tradeStatusName;
    let alertText = '';
    if(tradeStore.tradeStatus === '2'){
        alertType.value = 'error';
        alertText = `A股 ${statusName}，最后交易时间：${tradeStore.lastTradeTime}`;
    }
    if(tradeStore.tradeStatus === '1'){
        alertType.value = 'success';
        alertText = `A股 ${statusName}`;
    }
    if(tradeStore.tradeStatus === '0'){
        alertType.value = 'error';
        alertText = `A股 ${statusName}`;
    }
    alertMessage.value = alertText;
    
    // 获取 WebSocket 服务并发送状态变化消息
    try {
        const wsService = getWebSocketService('market');
        if (wsService.getStatus() === 1) { // 1 表示 WebSocket.OPEN
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
            wsService.sendMessage(statusMessage);
            console.log('已发送交易状态变化消息到服务端');
        } else {
            console.warn('WebSocket 连接未打开，无法发送交易状态变化消息');
        }
    } catch (error) {
        console.error('发送交易状态变化消息失败:', error);
    }
});
const newsType = ref('telegraph');
const newsTypes = {
  telegraph: '财联社电报',
  company: '上市公司今日动态'
};

const {} = getCurrentInstance()?.proxy;
onBeforeMount(() => {});
onMounted(() => {});
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
            top: 0;
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

.radio-inputs .radio input:checked + .name {
    background-color: #fff;
    font-weight: 600;
}

/* Hover effect */
.radio-inputs .radio:hover .name {
    background-color: rgba(255, 255, 255, 0.5);
}

/* Animation */
.radio-inputs .radio input:checked + .name {
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
.radio-inputs .radio input:checked + .name::before,
.radio-inputs .radio input:checked + .name::after {
    content: "";
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #3b82f6;
    opacity: 0;
    animation: particles 0.5s ease forwards;
}

.radio-inputs .radio input:checked + .name::before {
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
}

.radio-inputs .radio input:checked + .name::after {
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

.radio-inputs .radio input:checked + .name::before {
    --direction: -10px;
}

.radio-inputs .radio input:checked + .name::after {
    --direction: 10px;
}
</style>
