<template>
    <div class="allQuotes">
        <p class="quote" :class="{ 'down': quote['涨跌幅'] < 0, 'flash-red': flashStates[quote['名称']] === 'up', 'flash-green': flashStates[quote['名称']] === 'down' }" v-for="quote in quotes" :key="quote['名称']">
            <span class="name">{{ quote['名称'] }}</span>
            <span class="price" :class="{ 'down': quote['涨跌幅'] < 0 }">{{ quote['最新价'] }}</span>
            <span class="range" :class="{ 'down': quote['涨跌幅'] < 0 }">{{ quote['涨跌额'] }}[{{ quote['涨跌幅'] }}%]</span>
        </p>
    </div>
</template>

<script setup>
import WebSocketService from '@zhaoshijun/ws-service';
import { ref, watch, onBeforeMount, onBeforeUnmount, getCurrentInstance } from 'vue';

// 获取单例实例
const ws = WebSocketService.getInstance();
const PageName = 'AllQuotes';
const { Service, Request, CRUD, Storage, $message } = getCurrentInstance()?.proxy;

Service.registerApi(PageName, {
    fetch: {
        indexQuotes: () => Request.get(`/finance/quotes/all`),
    },
});

const quotes = ref([]);
const flashStates = ref({});

// 监听quotes变化，实现闪烁效果
watch(quotes, (newVal) => {
    if (newVal.length > 0) {
        // 直接根据新价格的涨跌幅来判断闪烁效果
        newVal.forEach(quote => {
            // 设置闪烁状态
            flashStates.value[quote['名称']] = quote['涨跌幅'] < 0 ? 'down' : 'up';
            
            // 1500毫秒后清除闪烁状态
            setTimeout(() => {
                flashStates.value[quote['名称']] = null;
            }, 1500);
        });
    }
}, { deep: true });

// 订阅特定类型的消息
const unsubscribe = ws.subscribe('indexQuotes', (payload, message) => {
    quotes.value = message.data;
});

onBeforeUnmount(() => {
    unsubscribe();
});

onBeforeMount(async () => {
    const result = await CRUD.launch(() => {
        return Service.fetch(PageName, undefined, 'indexQuotes');
    });
    quotes.value = result.data;
});
</script>
<style scoped lang="scss">
.allQuotes {
    box-sizing: border-box;
    padding: 10px;
    width: 100%;
    height: calc(100% - 50px);
    display: grid;
    overflow: auto;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;

    &::-webkit-scrollbar {
        display: none;
    }

    .quote {
        box-sizing: border-box;
        color: #131313;
        opacity: 0.8;
        padding: 10px 0;
        transition: background-color 0.2s ease-out;

        &.flash-red {
            animation: flash-red 0.5s;
        }

        &.flash-green {
            animation: flash-green 0.5s;
        }

        >span {
            display: block;
            text-align: center;

            &.down {
                color: #008907;
            }
        }

        .name {
            font-size: 16px;
            height: 30px;
            line-height: 30px;
        }

        .price {
            color: #ff0000;
            font-size: 20px;
        }

        .range {
            font-size: 14px;
            color: #ff0000;
            height: 30px;
            line-height: 30px;
        }
    }
}

@keyframes flash-red {
    0% { background-color: transparent; }
    30% { background-color: rgba(255, 0, 0, 0.15); }
    70% { background-color: rgba(255, 0, 0, 0.15); }
    100% { background-color: transparent; }
}

@keyframes flash-green {
    0% { background-color: transparent; }
    30% { background-color: rgba(0, 137, 7, 0.15); }
    70% { background-color: rgba(0, 137, 7, 0.15); }
    100% { background-color: transparent; }
}
</style>