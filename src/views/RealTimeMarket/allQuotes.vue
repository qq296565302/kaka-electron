<template>
    <div class="allQuotes">
        <p class="quote" :class="{ 'down': quote['涨跌幅'] < 0 }" v-for="quote in quotes" :key="quote['名称']">
            <span class="name">{{ quote['名称'] }}</span>
            <span class="price" :class="{ 'down': quote['涨跌幅'] < 0 }">{{ quote['最新价'] }}</span>
            <span class="range" :class="{ 'down': quote['涨跌幅'] < 0 }">{{ quote['涨跌额'] }}[{{ quote['涨跌幅'] }}%]</span>
        </p>
    </div>
</template>

<script setup>
import eventBus from "utils/eventBus";
const PageName = 'AllQuotes';
const { Service, Request, CRUD, Storage, $message } = getCurrentInstance()?.proxy;

Service.registerApi(PageName, {
    fetch: {
        indexQuotes: () => Request.get(`/finance/quotes/all`),
    },
});
const quotes = ref([])
// 订阅WebSocket消息
const subscribeToWebSocketMessages = () => {
    // 订阅cls_news_update类型的消息
    eventBus.on('indexQuotes', (messageData) => {
        console.log('收到全指数消息:', messageData);
        quotes.value = messageData
    });
};

onBeforeMount(async () => {
    // 订阅WebSocket消息
    subscribeToWebSocketMessages();
    const result = await CRUD.launch(() => {
        return Service.fetch(PageName, undefined, 'indexQuotes');
    });
    quotes.value = result.data;
});

onBeforeUnmount(() => {
    eventBus.off('indexQuotes');
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
</style>